(function () {
  // A single browser-side client keeps auth state and query helpers consistent
  // across all static pages without introducing a framework or build step.
  const authOptions = {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage
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

    if (role === "super_admin") return "Super admin";
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
    const { data, error } = await client.auth.getUser();
    if (error) throw error;
    return data?.user || null;
  }

  async function getProfile(userId, { force = false } = {}) {
    const client = getClient();
    if (!client || !userId) return null;

    if (!force && profileCache.has(userId)) {
      return profileCache.get(userId);
    }

    const withRoles = await client
      .from("profiles")
      .select("role, active, is_editor, display_name")
      .eq("id", userId)
      .single();

    let profile = null;
    if (!withRoles.error) {
      profile = withRoles.data;
    } else {
      const fallback = await client
        .from("profiles")
        .select("role, active, is_editor")
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
        .select("id, term, category, definition, status, reviewer_comment, created_at")
        .eq("submitted_by", userId)
        .order("created_at", { ascending: false });

      if (query.error) throw query.error;
      return Array.isArray(query.data) ? query.data : [];
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

    async searchTerms(query) {
      return fetchJson(`/api/search?q=${encodeURIComponent(query)}`);
    },

    async fetchTermBySlug(slug) {
      return fetchJson(`/api/terms?slug=${encodeURIComponent(slug)}`);
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
