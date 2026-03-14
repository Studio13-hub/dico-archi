(function () {
  const SESSION_STORAGE_KEY = "dico_archi_session_id_v1";
  const VISITOR_STORAGE_KEY = "dico_archi_visitor_id_v1";

  function makeId() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function getStoredId(key) {
    try {
      let value = window.localStorage.getItem(key);
      if (!value) {
        value = makeId();
        window.localStorage.setItem(key, value);
      }
      return value;
    } catch (_error) {
      return makeId();
    }
  }

  function getSessionId() {
    return getStoredId(SESSION_STORAGE_KEY);
  }

  function getVisitorId() {
    return getStoredId(VISITOR_STORAGE_KEY);
  }

  async function getAccessToken() {
    try {
      const client = window.DicoArchiSupabase?.getClient?.();
      if (!client) return "";
      const sessionResult = await client.auth.getSession();
      return sessionResult.data?.session?.access_token || "";
    } catch (_error) {
      return "";
    }
  }

  async function postJson(path, payload, { includeAuth = false } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (includeAuth) {
      const token = await getAccessToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    return fetch(path, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      keepalive: true
    });
  }

  async function trackPageView() {
    try {
      const payload = {
        pagePath: `${window.location.pathname}${window.location.search || ""}`,
        pageTitle: document.title || "",
        sessionId: getSessionId(),
        visitorId: getVisitorId(),
        meta: {
          referrer: document.referrer ? document.referrer.slice(0, 300) : "",
          viewport: `${window.innerWidth || 0}x${window.innerHeight || 0}`
        }
      };
      await postJson("/api/track-page", payload);
    } catch (_error) {
      // Tracking stays silent on purpose.
    }
  }

  async function submitGameScore(payload) {
    try {
      const response = await postJson("/api/game-score", {
        ...payload,
        sessionId: getSessionId()
      }, { includeAuth: true });
      return response.ok;
    } catch (_error) {
      return false;
    }
  }

  window.DicoArchiMetrics = {
    getSessionId,
    trackPageView,
    submitGameScore
  };

  if (!document.body?.dataset?.disableTracking) {
    window.addEventListener("load", () => {
      window.setTimeout(() => {
        trackPageView();
      }, 0);
    }, { once: true });
  }
})();
