/**
 * Client IP helpers for rate-limit fallback when guest cookie is unavailable.
 */

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const cf = request.headers.get("cf-connecting-ip")?.trim();
  if (cf) return cf;

  const vercel = request.headers.get("x-vercel-forwarded-for")?.trim();
  if (vercel) {
    const first = vercel.split(",")[0]?.trim();
    if (first) return first;
  }

  return "unknown";
}
