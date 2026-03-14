const { createClient } = require("@supabase/supabase-js");

function getServerSupabaseConfig({ publicOnly = false } = {}) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const publicKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || "";

  if (!supabaseUrl) {
    return { error: "missing_supabase_url" };
  }

  if (publicOnly) {
    const key = publicKey || serviceRoleKey;
    if (!key) {
      return { error: "missing_supabase_public_env" };
    }
    return {
      supabaseUrl,
      key,
      usingServiceRoleFallback: !publicKey && Boolean(serviceRoleKey)
    };
  }

  if (!serviceRoleKey) {
    return { error: "missing_supabase_server_env" };
  }

  return {
    supabaseUrl,
    key: serviceRoleKey,
    usingServiceRoleFallback: false
  };
}

function createServerSupabaseClient(options = {}) {
  const config = getServerSupabaseConfig(options);
  if (config.error) return config;

  return {
    ...config,
    client: createClient(config.supabaseUrl, config.key, {
      auth: { persistSession: false }
    })
  };
}

module.exports = {
  createServerSupabaseClient
};
