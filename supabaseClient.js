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
    if (role === "formateur") return "Relecture";
    if (role === "apprenti") return "Contributeur";
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
    async fetchPublishedTermsBasic() {
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
            name
          )
        `)
        .eq("status", "published")
        .order("term", { ascending: true });

      if (query.error) throw query.error;
      return Array.isArray(query.data) ? query.data : [];
    },

    async fetchCategories() {
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

      if (query.error) throw query.error;
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
      return fetchJson(`/api/search?q=${encodeURIComponent(query)}`);
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
