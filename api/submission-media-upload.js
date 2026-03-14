const { createServerSupabaseClient } = require("./_supabase");

function getBearerToken(req) {
  const authHeader = String(req.headers.authorization || "").trim();
  if (!authHeader.startsWith("Bearer ")) return "";
  return authHeader.slice(7).trim();
}

function sanitizeStorageSegment(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "method_not_allowed" }));
    return;
  }

  const serverSupabase = createServerSupabaseClient();
  if (serverSupabase.error) {
    res.statusCode = 503;
    res.end(JSON.stringify({ error: serverSupabase.error }));
    return;
  }

  const token = getBearerToken(req);
  if (!token) {
    res.statusCode = 401;
    res.end(JSON.stringify({ error: "missing_auth_token" }));
    return;
  }

  const authResult = await serverSupabase.client.auth.getUser(token);
  if (authResult.error || !authResult.data?.user) {
    res.statusCode = 401;
    res.end(JSON.stringify({ error: "invalid_auth_token" }));
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (_error) {
      body = {};
    }
  }

  const fileName = String(body?.fileName || "").trim();
  const fileType = String(body?.fileType || "").trim().toLowerCase();
  const ext = sanitizeStorageSegment(fileName.split(".").pop() || "");
  const baseName = sanitizeStorageSegment(fileName.replace(/\.[^.]+$/, "")) || "media";
  const allowedExt = new Set(["png", "jpg", "jpeg", "webp", "gif", "svg", "pdf"]);
  const isPdf = fileType === "application/pdf" || ext === "pdf";
  const isImage = fileType.startsWith("image/") || allowedExt.has(ext);

  if (!fileName || !allowedExt.has(ext) || (!isPdf && !isImage)) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "unsupported_file_type" }));
    return;
  }

  const path = `submissions/${authResult.data.user.id}/${Date.now()}-${Math.random().toString(16).slice(2)}-${baseName}.${ext}`;
  const signed = await serverSupabase.client.storage.from("term-images").createSignedUploadUrl(path);

  if (signed.error || !signed.data?.token) {
    res.statusCode = 502;
    res.end(JSON.stringify({ error: signed.error?.message || "signed_upload_url_failed" }));
    return;
  }

  const publicUrl = serverSupabase.client.storage.from("term-images").getPublicUrl(path);

  res.statusCode = 200;
  res.end(JSON.stringify({
    path,
    token: signed.data.token,
    publicUrl: publicUrl.data?.publicUrl || ""
  }));
};
