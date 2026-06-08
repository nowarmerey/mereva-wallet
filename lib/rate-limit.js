// Lightweight in-memory rate limiter (per process). Good for a single server /
// basic abuse protection on sensitive endpoints. For multi-instance production,
// swap the store for Redis/Upstash.
const hits = new Map(); // key -> { count, resetAt }

export function rateLimit(key, { limit = 5, windowMs = 60_000 } = {}) {
  const now = Date.now();
  const rec = hits.get(key);
  if (!rec || now > rec.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  rec.count += 1;
  if (rec.count > limit) {
    return { ok: false, retryAfter: Math.ceil((rec.resetAt - now) / 1000) };
  }
  return { ok: true, remaining: limit - rec.count };
}

// Best-effort client IP from request headers.
export function clientIp(request) {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

// Occasionally clear old entries to avoid unbounded growth.
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of hits) if (now > v.resetAt) hits.delete(k);
  }, 5 * 60_000).unref?.();
}
