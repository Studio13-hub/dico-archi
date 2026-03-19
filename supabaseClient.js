(function () {
  // A single browser-side client keeps auth state and query helpers consistent
  // across all static pages without introducing a framework or build step.
  const authOptions = {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    multiTab: false
  };

  let clientInstance = null;
  const profileCache = new Map();
  let authBootstrapPromise = null;
  let authBootstrapComplete = false;

  function createTimeoutPromise(delay, value = null) {
    return new Promise((resolve) => {
      window.setTimeout(() => resolve(value), delay);
    });
  }

  function waitForInitialSession() {
    const client = getClient();
    if (!client) return Promise.resolve(null);
    if (authBootstrapComplete) return Promise.resolve(null);
    if (authBootstrapPromise) return authBootstrapPromise;

    authBootstrapPromise = new Promise((resolve) => {
      let settled = false;

      const finish = () => {
        if (settled) return;
        settled = true;
        authBootstrapComplete = true;
        resolve(null);
      };

      const subscriptionResult = client.auth.onAuthStateChange((event) => {
        if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
          subscriptionResult?.data?.subscription?.unsubscribe?.();
          finish();
        }
      });

      createTimeoutPromise(900).then(finish);
    });

    return authBootstrapPromise;
  }

  function hasConfig() {
    return Boolean(window.SUPABASE_URL && window.SUPABASE_ANON_KEY && window.supabase);
  }

  function getClient() {
    if (!hasConfig()) return null;
    if (!clientInstance) {
      clientInstance = window.supabase.createClient(
        window.SUPABASE_URL,
        window.SUPABASE_ANON_KEY,
        { auth: authOptions }
      );
    }
    return clientInstance;
  }

  function normalizeProfile(profile) {
    if (!profile) return null;

    const rawRole = profile.role || (profile.is_editor ? "maitre_apprentissage" : "apprenti");
    const role = rawRole === "maitre_apprentissage" ? "formateur" : rawRole;
    return {
      ...profile,
      role,
      active: profile.active !== false,
      is_editor: Boolean(profile.is_editor)
    };
  }

  // Auth/profile helpers centralize the legacy role fallback in one place.
  function getRoleLabel(profileOrRole) {
    const role = typeof profileOrRole === "string"
      ? profileOrRole
      : normalizeProfile(profileOrRole)?.role;

    if (role === "super_admin") return "Administration";
    if (role === "formateur") return "Formateur";
    if (role === "apprenti") return "Apprenti";
    return "Public";
  }

  function isStaffProfile(profile) {
    const normalized = normalizeProfile(profile);
    if (!normalized || normalized.active === false) return false;
    return normalized.role === "super_admin"
      || normalized.role === "formateur";
  }

  function isSuperAdminProfile(profile) {
    const normalized = normalizeProfile(profile);
    return Boolean(normalized && normalized.active !== false && normalized.role === "super_admin");
  }

  async function getCurrentUser() {
    const client = getClient();
    if (!client) return null;
    await waitForInitialSession();
    const sessionResult = await client.auth.getSession();
    if (sessionResult.error) {
      const message = String(sessionResult.error.message || "");
      if (message.toLowerCase().includes("auth session missing")) {
        return null;
      }
      throw sessionResult.error;
    }

    return sessionResult.data?.session?.user || null;
  }

  async function getProfile(userId, { force = false } = {}) {
    const client = getClient();
    if (!client || !userId) return null;

    if (!force && profileCache.has(userId)) {
      return profileCache.get(userId);
    }

    const coreQuery = await client
      .from("profiles")
      .select("role, active, display_name")
      .eq("id", userId)
      .single();

    let profile = null;
    if (!coreQuery.error) {
      profile = coreQuery.data;
    } else {
      const fallback = await client
        .from("profiles")
        .select("role, active, is_editor, display_name")
        .eq("id", userId)
        .single();

      if (!fallback.error) {
        profile = fallback.data;
      }
    }

    const normalized = normalizeProfile(profile);
    profileCache.set(userId, normalized);
    return normalized;
  }

  function clearProfileCache(userId) {
    if (userId) {
      profileCache.delete(userId);
      return;
    }
    profileCache.clear();
  }

  function onAuthStateChange(callback) {
    const client = getClient();
    if (!client) return { data: { subscription: { unsubscribe() {} } } };
    return client.auth.onAuthStateChange(async (event, session) => {
      authBootstrapComplete = true;
      const user = session?.user || null;
      if (!user) {
        clearProfileCache();
        callback(event, session, null, null);
        return;
      }

      const profile = await getProfile(user.id, { force: true });
      callback(event, session, user, profile);
    });
  }

  async function fetchJson(path) {
    const response = await fetch(path, {
      headers: {
        Accept: "application/json"
      }
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.error || "request_failed");
    }

    return payload;
  }

  function prefersDirectSupabaseReads() {
    const protocol = String(window.location.protocol || "");
    const hostname = String(window.location.hostname || "");
    const port = String(window.location.port || "");

    if (protocol === "file:") return true;
    if ((hostname === "127.0.0.1" || hostname === "localhost") && port === "4173") return true;
    return false;
  }

  function sanitizeStorageSegment(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase();
  }

  // API helpers are grouped by feature so pages reuse the same queries
  // instead of rebuilding raw Supabase calls inline.
  const api = {
    isMissingRichPayloadSupport(error) {
      const message = String(error?.message || error || "").toLowerCase();
      return message.includes("rich_payload") && (
        message.includes("does not exist")
        || message.includes("not exist")
        || message.includes("could not find the")
        || message.includes("column")
      );
    },

    async fetchPublishedTermsBasic() {
      if (!prefersDirectSupabaseReads()) {
        const payload = await fetchJson("/api/categories?resource=terms");
        if (Array.isArray(payload.terms) && payload.terms.length) return payload.terms;
      }

      const client = getClient();
      if (!client) throw new Error("missing_supabase_config");

      const query = await client
        .from("terms")
        .select(`
          id,
          term,
          slug,
          definition,
          category_id,
          categories:category_id (
            id,
            name,
            slug
          )
        `)
        .eq("status", "published")
        .order("term", { ascending: true });

      if (query.error) throw query.error;
      return Array.isArray(query.data) ? query.data : [];
    },

    async fetchCategories() {
      if (!prefersDirectSupabaseReads()) {
        const payload = await fetchJson("/api/categories?resource=categories");
        if (Array.isArray(payload.categories) && payload.categories.length) return payload.categories;
      }

      const client = getClient();
      if (!client) throw new Error("missing_supabase_config");

      const query = await client
        .from("categories")
        .select("id, name, slug, description")
        .order("name", { ascending: true });

      if (query.error) throw query.error;
      return Array.isArray(query.data) ? query.data : [];
    },

    async fetchMySubmissions(userId) {
      const client = getClient();
      if (!client) throw new Error("missing_supabase_config");

      const query = await client
        .from("term_submissions")
        .select(`
          id,
          term,
          slug,
          category_id,
          definition,
          example,
          media_urls,
          rich_payload,
          status,
          reviewer_comment,
          created_at,
          categories:category_id (
            id,
            name,
            slug
          )
        `)
        .eq("submitted_by", userId)
        .order("created_at", { ascending: false });

      if (query.error) {
        if (api.isMissingRichPayloadSupport(query.error)) {
          const legacyQuery = await client
            .from("term_submissions")
            .select(`
              id,
              term,
              slug,
              category_id,
              definition,
              example,
              media_urls,
              status,
              reviewer_comment,
              created_at,
              categories:category_id (
                id,
                name,
                slug
              )
            `)
            .eq("submitted_by", userId)
            .order("created_at", { ascending: false });
          if (legacyQuery.error) throw legacyQuery.error;
          return Array.isArray(legacyQuery.data)
            ? legacyQuery.data.map((item) => ({
                ...item,
                rich_payload: {},
                category: item.categories?.name || ""
              }))
            : [];
        }
        throw query.error;
      }
      return Array.isArray(query.data)
        ? query.data.map((item) => ({
            ...item,
            category: item.categories?.name || ""
          }))
        : [];
    },

    async createSubmission(payload) {
      const client = getClient();
      if (!client) throw new Error("missing_supabase_config");

      const query = await client
        .from("term_submissions")
        .insert(payload);

      if (query.error) {
        if (api.isMissingRichPayloadSupport(query.error)) {
          throw new Error("Le mode fiche complète nécessite d’abord la migration SQL 019 sur Supabase.");
        }
        throw query.error;
      }
      return query.data || null;
    },

    async fetchSubmissionById(submissionId) {
      const client = getClient();
      if (!client) throw new Error("missing_supabase_config");
      if (!submissionId) throw new Error("missing_submission_id");

      let query = await client
        .from("term_submissions")
        .select(`
          id,
          term,
          slug,
          category_id,
          definition,
          example,
          media_urls,
          rich_payload,
          status,
          reviewer_comment,
          created_at,
          updated_at
        `)
        .eq("id", submissionId)
        .single();

      if (query.error && api.isMissingRichPayloadSupport(query.error)) {
        query = await client
          .from("term_submissions")
          .select(`
            id,
            term,
            slug,
            category_id,
            definition,
            example,
            media_urls,
            status,
            reviewer_comment,
            created_at,
            updated_at
          `)
          .eq("id", submissionId)
          .single();

        if (!query.error && query.data) {
          query.data = { ...query.data, rich_payload: {} };
        }
      }

      if (query.error) throw query.error;
      return query.data || null;
    },

    async uploadSubmissionMedia(file, userId) {
      const client = getClient();
      if (!client) throw new Error("missing_supabase_config");
      if (!file) throw new Error("Aucun fichier fourni.");
      if (!userId) throw new Error("Utilisateur manquant pour le téléversement.");

      const maxSizeBytes = 10 * 1024 * 1024;
      const mime = String(file.type || "").toLowerCase();
      const ext = String(file.name || "").toLowerCase().split(".").pop() || "";
      const allowedImageExt = ["png", "jpg", "jpeg", "webp", "gif", "svg"];
      const isPdf = mime === "application/pdf" || ext === "pdf";
      const isImage = mime.startsWith("image/") || allowedImageExt.includes(ext);

      if (!isPdf && !isImage) {
        throw new Error("Format non supporté. Utilise une image (png/jpg/webp/gif/svg) ou un PDF.");
      }
      if (file.size > maxSizeBytes) {
        throw new Error("Fichier trop lourd (max 10 MB).");
      }
      const sessionResult = await client.auth.getSession();
      const accessToken = sessionResult.data?.session?.access_token || "";
      if (!accessToken) {
        throw new Error("Session introuvable. Reconnecte-toi avant le téléversement.");
      }

      const prepareResponse = await fetch("/api/submission-media-upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type
        })
      });

      const preparePayload = await prepareResponse.json().catch(() => ({}));
      if (!prepareResponse.ok) {
        throw new Error(preparePayload.error || "signed_upload_prepare_failed");
      }

      const upload = await client.storage.from("term-images").uploadToSignedUrl(
        preparePayload.path,
        preparePayload.token,
        file,
        {
          cacheControl: "3600",
          contentType: file.type || undefined,
          upsert: false
        }
      );

      if (upload.error) throw upload.error;

      return preparePayload.publicUrl || "";
    },

    async searchTerms(query) {
      if (!prefersDirectSupabaseReads()) {
        return await fetchJson(`/api/search?q=${encodeURIComponent(query)}`);
      }

      const items = await api.fetchPublishedTermsBasic();
      const normalizedQuery = String(query || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

      const results = items
        .filter((item) => {
          const term = String(item.term || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
          const definition = String(item.definition || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
          return term.includes(normalizedQuery) || definition.includes(normalizedQuery);
        })
        .slice(0, 20);

      return { results };
    },

    async fetchTermBySlug(slug) {
      return fetchJson(`/api/terms?slug=${encodeURIComponent(slug)}`);
    },

    async fetchHomeMetrics() {
      return fetchJson("/api/home-metrics");
    },

    async listProfiles() {
      const client = getClient();
      if (!client) throw new Error("missing_supabase_config");

      const query = await client.rpc("admin_list_profiles");
      if (query.error) throw query.error;
      return Array.isArray(query.data) ? query.data : [];
    },

    async updateProfile(targetProfileId, nextRole, nextActive) {
      const client = getClient();
      if (!client) throw new Error("missing_supabase_config");

      const query = await client.rpc("admin_update_profile", {
        target_profile_id: targetProfileId,
        next_role: nextRole,
        next_active: nextActive
      });

      if (query.error) throw query.error;
      return query.data || null;
    },

    async fetchMyNotifications(userId) {
      const client = getClient();
      if (!client) throw new Error("missing_supabase_config");

      let query = await client
        .from("notifications")
        .select("id, kind, severity, title, body, actor_id, actor_label, related_table, related_id, metadata, read_at, created_at")
        .eq("recipient_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (query.error) {
        const message = String(query.error.message || "").toLowerCase();
        const isLegacySchema = ["severity", "actor_id", "actor_label", "metadata"].some((field) => message.includes(field));
        if (isLegacySchema) {
          query = await client
            .from("notifications")
            .select("id, kind, title, body, related_table, related_id, read_at, created_at")
            .eq("recipient_id", userId)
            .order("created_at", { ascending: false })
            .limit(20);

          if (!query.error && Array.isArray(query.data)) {
            query.data = query.data.map((item) => ({
              ...item,
              severity: "info",
              actor_id: null,
              actor_label: "",
              metadata: {}
            }));
          }
        }
      }

      if (query.error) throw query.error;
      return Array.isArray(query.data) ? query.data : [];
    },

    async createNotification(payload) {
      const client = getClient();
      if (!client) throw new Error("missing_supabase_config");

      const query = await client
        .from("notifications")
        .insert(payload)
        .select("id")
        .single();

      if (query.error) throw query.error;
      return query.data || null;
    },

    async markNotificationRead(notificationId) {
      const client = getClient();
      if (!client) throw new Error("missing_supabase_config");

      const query = await client
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", notificationId)
        .select("id")
        .single();

      if (query.error) throw query.error;
      return query.data || null;
    },

    async fetchSubmissionMessagesForUser(userId) {
      const client = getClient();
      if (!client) throw new Error("missing_supabase_config");

      const query = await client
        .from("submission_messages")
        .select(`
          id,
          submission_id,
          audience,
          body,
          created_at,
          author:author_id (
            email,
            display_name
          ),
          submission:submission_id (
            id,
            term,
            status
          )
        `)
        .eq("audience", "submitter")
        .order("created_at", { ascending: false })
        .limit(40);

      if (query.error) throw query.error;
      return Array.isArray(query.data) ? query.data : [];
    },

    async createSubmissionMessage(payload) {
      const client = getClient();
      if (!client) throw new Error("missing_supabase_config");

      const query = await client
        .from("submission_messages")
        .insert(payload)
        .select("id")
        .single();

      if (query.error) throw query.error;
      return query.data || null;
    },

    async updateOwnSubmission(submissionId, payload) {
      const client = getClient();
      if (!client) throw new Error("missing_supabase_config");

      const query = await client
        .from("term_submissions")
        .update(payload)
        .eq("id", submissionId)
        .select("id, status")
        .single();

      if (query.error) throw query.error;
      return query.data || null;
    },

    async fetchAdminMetrics() {
      const client = getClient();
      if (!client) throw new Error("missing_supabase_config");

      const sessionResult = await client.auth.getSession();
      const accessToken = sessionResult.data?.session?.access_token || "";
      if (!accessToken) throw new Error("missing_auth_token");

      const response = await fetch("/api/admin-metrics", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`
        }
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "admin_metrics_request_failed");
      }
      return payload;
    }
  };

  window.DicoArchiSupabase = {
    authOptions,
    hasConfig,
    getClient,
    getCurrentUser,
    waitForInitialSession,
    getProfile,
    normalizeProfile,
    getRoleLabel,
    isStaffProfile,
    isSuperAdminProfile,
    clearProfileCache,
    onAuthStateChange
  };

  window.DicoArchiApi = api;
})();
