// Import the core via a relative path rather than the "@saju-lab/saju-core"
// workspace specifier. Vercel's serverless bundler traces and compiles the
// referenced source into the function, but does NOT recreate the node_modules
// symlink for the workspace package — so a bare specifier throws
// "Cannot find module" at module load (FUNCTION_INVOCATION_FAILED). A relative
// import is bundled and resolves at runtime with no node_modules.
import { buildSajuPillarsV1Response } from "../../packages/saju-core/src/index.js";
import type { ApiResponse } from "./http.js";
import { parseJsonBody } from "./http.js";

/**
 * Shared body of the saju-pillars-v1 endpoint: parse, delegate to the pure contract
 * builder, answer. No engine logic here, and deliberately no auth — each route owns
 * its own gate (`api/saju-pillars.ts` keeps the x-api-key contract, `api/app/…` is
 * keyless and rate limited) so neither one's policy leaks into the other.
 */
export function respondSajuPillars(rawBody: unknown, res: ApiResponse): void {
  const parsed = parseJsonBody(rawBody);
  if (!parsed.ok) {
    res.status(400).json({
      contract: "saju-pillars-v1",
      error: { code: "INVALID_BODY", message: "Request body must be valid JSON." }
    });
    return;
  }

  // Narrow via the "data" property rather than the `ok` boolean discriminant:
  // Vercel's serverless TypeScript pass type-checks without strictNullChecks,
  // where boolean-discriminant narrowing fails to resolve the union. Property
  // narrowing works under both strict and non-strict, keeping the build clean.
  const result = buildSajuPillarsV1Response(parsed.value);
  if ("data" in result) {
    res.status(result.status).json(result.data);
  } else {
    res.status(result.status).json(result.error);
  }
}
