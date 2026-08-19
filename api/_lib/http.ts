// Minimal request/response shapes compatible with Vercel's Node serverless runtime.
// Kept local so handlers need no extra dependency and stay portable — same choice
// api/saju-pillars.ts made; this file is the shared home for it now that more than
// one route needs it.

export interface ApiRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
}

export interface ApiResponse {
  status(code: number): ApiResponse;
  json(payload: unknown): void;
  setHeader(name: string, value: string): void;
}

export function header(req: ApiRequest, name: string): string | undefined {
  const value = req.headers[name];
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Best-effort caller identity for rate limiting. Vercel puts the real client IP in
 * `x-forwarded-for` (first entry) and mirrors it in `x-real-ip`. Callers behind the
 * same NAT share a bucket — accepted: this layer bounds hammering, it does not
 * authenticate anyone.
 */
export function clientIp(req: ApiRequest): string {
  const forwarded = header(req, "x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  if (first) {
    return first;
  }
  return header(req, "x-real-ip")?.trim() || "unknown";
}

/** Parses a JSON body that the runtime may hand over as an already-parsed value or as text. */
export function parseJsonBody(body: unknown): { ok: true; value: unknown } | { ok: false } {
  if (typeof body !== "string") {
    return { ok: true, value: body };
  }
  try {
    return { ok: true, value: JSON.parse(body) };
  } catch {
    return { ok: false };
  }
}
