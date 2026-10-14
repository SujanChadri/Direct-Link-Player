export const config = { runtime: "edge" };
const blocked = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|0\.|\[?::1\]?|\[?f[cd])/i;
const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "range", "access-control-allow-methods": "GET, HEAD, OPTIONS", "access-control-expose-headers": "content-length, content-range, accept-ranges" };
export default async function handler(req) {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  let u; try { u = new URL(new URL(req.url).searchParams.get("url") || ""); } catch { return new Response("Bad url", { status: 400, headers: cors }); }
  if (!/^https?:$/.test(u.protocol) || blocked.test(u.hostname)) return new Response("Forbidden", { status: 403, headers: cors });
  const h = new Headers({ "user-agent": "Mozilla/5.0 ReelPlayer" });
  const r = req.headers.get("range"); if (r) h.set("range", r);
  const up = await fetch(u.toString(), { method: req.method, headers: h, redirect: "follow" });
  const out = new Headers(cors);
  for (const k of ["content-type","content-length","content-range","accept-ranges","last-modified","etag"]) { const v = up.headers.get(k); if (v) out.set(k, v); }
  return new Response(req.method === "HEAD" ? null : up.body, { status: up.status, headers: out });
}
