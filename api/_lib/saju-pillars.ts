// Import the core via a relative path rather than the "@saju-lab/saju-core"
// workspace specifier. Vercel's serverless bundler traces and compiles the
// referenced source into the function, but does NOT recreate the node_modules
// symlink for the workspace package — so a bare specifier throws
// "Cannot find module" at module load (FUNCTION_INVOCATION_FAILED). A relative
// import is bundled and resolves at runtime with no node_modules.
import { buildSajuPillarsV1Response, INCLUDE_BLOCKS } from "../../packages/saju-core/src/index.js";
import type { IncludeBlock } from "../../packages/saju-core/src/index.js";
import type { ApiResponse } from "./http.js";
import { parseJsonBody } from "./http.js";

/**
 * keyless 공개면(앱 라우트, 그리고 SAJU_API_KEY 미설정으로 열린 키 라우트)이 싣는 include 블록 — **허용 목록**.
 * 5~7단계 명식 사실 블록만 든다. 9단계 L2 판독 블록(2026-10-27)은 키가 걸린 호출에만 연다. 무료/유료 층 노출은
 * 사용자 결정 전이다(docs/design/l2-include-design.md §4 · HO-2026-1026-l2-include).
 */
export const KEYLESS_INCLUDE_BLOCKS: readonly IncludeBlock[] = ["hiddenStems", "tenGods", "interactions", "daeun"];

/**
 * 허용 목록 밖의 블록 = keyless 거절 목록. `INCLUDE_BLOCKS`에서 파생하므로 새 블록은 여기에 손대지 않아도
 * keyless에서 거절된다(fail-closed). keyless로 열려면 `KEYLESS_INCLUDE_BLOCKS`에 명시적으로 넣어야 한다.
 */
export function keylessDeniedIncludes(blocks: readonly string[] = INCLUDE_BLOCKS): string[] {
  return blocks.filter((block) => !(KEYLESS_INCLUDE_BLOCKS as readonly string[]).includes(block));
}

export const KEYLESS_DENIED_INCLUDES: readonly string[] = keylessDeniedIncludes();

/**
 * Shared body of the saju-pillars-v1 endpoint: parse, delegate to the pure contract
 * builder, answer. No engine logic here, and deliberately no auth — each route owns
 * its own gate (`api/saju-pillars.ts` keeps the x-api-key contract, `api/app/…` is
 * keyless and rate limited) so neither one's policy leaks into the other.
 *
 * `deniedIncludes`: include blocks this route refuses with INVALID_OPTIONS even though the
 * contract opens them — a route-level exposure policy, decided before the core runs.
 */
export function respondSajuPillars(rawBody: unknown, res: ApiResponse, deniedIncludes: readonly string[] = []): void {
  const parsed = parseJsonBody(rawBody);
  if (!parsed.ok) {
    res.status(400).json({
      contract: "saju-pillars-v1",
      error: { code: "INVALID_BODY", message: "Request body must be valid JSON." }
    });
    return;
  }

  const include = (parsed.value as { options?: { include?: unknown } } | null)?.options?.include;
  if (Array.isArray(include) && include.some((block) => deniedIncludes.includes(block as string))) {
    res.status(400).json({
      contract: "saju-pillars-v1",
      error: { code: "INVALID_OPTIONS", message: `This route does not serve the include blocks: ${deniedIncludes.join(", ")}.`, field: "options" }
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
