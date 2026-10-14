/**
 * Validation + narrowing for the app-facing Gemini route.
 *
 * The route holds the upstream API key, so anyone who finds the URL can spend the
 * project's quota. The defence that costs nothing is **shape**: rebuild the request
 * from an allowlist instead of forwarding what the caller sent. A caller cannot pick
 * the model (the route fixes it), cannot attach tools or files, cannot stream, and
 * cannot send a prompt larger than the naming prompt needs. What is left is a
 * bounded text-in / JSON-out endpoint, which is a far less attractive thing to steal
 * than a general-purpose LLM proxy.
 */

export const LIMITS = {
  /** The naming flow sends one user block; the letter flow sends one. Four is slack, not a use case. */
  maxContents: 4,
  maxPartsPerContent: 4,
  /** The longest real user block (PREMIUM input JSON + wishes) measured well under 12k characters. */
  maxPartTextChars: 12_000,
  /** buildNamingSystemInstruction() renders ~6k characters; 24k leaves room without inviting essays. */
  maxSystemInstructionChars: 24_000,
  /** Whole-payload ceiling, checked after narrowing so a huge responseSchema cannot slip past the per-field caps. */
  maxSerializedBytes: 96 * 1024,
  /** responseSchema shape caps. The naming schema is 3 levels deep with ~25 nodes. */
  maxSchemaDepth: 8,
  maxSchemaNodes: 300,
  maxSchemaStringChars: 2_000
} as const;

export interface ProxyPart {
  text: string;
}

export interface ProxyContent {
  parts: ProxyPart[];
}

export interface ProxyGenerationConfig {
  responseMimeType?: string;
  temperature?: number;
  responseSchema?: Record<string, unknown>;
}

export interface ProxyRequest {
  contents: ProxyContent[];
  generationConfig?: ProxyGenerationConfig;
  systemInstruction?: ProxyContent;
}

/**
 * Which upstream answers. Returned **beside** the request, never inside it: the
 * Gemini path forwards `JSON.stringify(request)` as-is, so a field added there would
 * change the bytes Gemini receives (docs/DESIGN-dualllm-saju-baby.md §1).
 */
export type Provider = "gemini" | "claude";

/** Effort a caller may ask of the Claude path. Lower-or-equal to the default only (design §7-1 R3). */
export type ClaudeEffort = "low" | "medium";

export type ValidationOutcome =
  | {
      ok: true;
      request: ProxyRequest;
      provider: Provider;
      claudeEffort?: ClaudeEffort;
      /** The caller named a provider (debug toggle, evaluation harness) — routing and fallback never apply. */
      providerExplicit: boolean;
      /** 2 = the app's single list retry; routing sends it to the sub engine (llm-routing.ts). */
      attempt?: 2;
      /** The app may be routed to Claude (llm-routing.ts gate 1). Release builds never send it. */
      claudeRoutingOptIn: boolean;
    }
  | { ok: false; code: "INVALID_BODY" | "PAYLOAD_TOO_LARGE"; message: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function fail(code: "INVALID_BODY" | "PAYLOAD_TOO_LARGE", message: string): ValidationOutcome {
  return { ok: false, code, message };
}

/** Keys a schema node may carry. Anything else is dropped rather than rejected — Gemini's schema dialect grows. */
const SCHEMA_KEYS = new Set([
  "type",
  "description",
  "properties",
  "items",
  "required",
  "propertyOrdering",
  "minItems",
  "maxItems",
  "enum",
  "nullable",
  "format"
]);

interface SchemaBudget {
  nodes: number;
}

function narrowSchema(value: unknown, depth: number, budget: SchemaBudget): Record<string, unknown> | null {
  if (!isRecord(value) || depth > LIMITS.maxSchemaDepth) {
    return null;
  }
  budget.nodes += 1;
  if (budget.nodes > LIMITS.maxSchemaNodes) {
    return null;
  }

  const out: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(value)) {
    if (!SCHEMA_KEYS.has(key)) {
      continue;
    }
    if (key === "properties") {
      if (!isRecord(raw)) {
        return null;
      }
      const properties: Record<string, unknown> = {};
      for (const [propName, propValue] of Object.entries(raw)) {
        const narrowed = narrowSchema(propValue, depth + 1, budget);
        if (narrowed === null) {
          return null;
        }
        properties[propName] = narrowed;
      }
      out[key] = properties;
      continue;
    }
    if (key === "items") {
      const narrowed = narrowSchema(raw, depth + 1, budget);
      if (narrowed === null) {
        return null;
      }
      out[key] = narrowed;
      continue;
    }
    if (key === "required" || key === "propertyOrdering" || key === "enum") {
      if (!Array.isArray(raw) || raw.some((entry) => typeof entry !== "string")) {
        return null;
      }
      out[key] = raw;
      continue;
    }
    if (typeof raw === "string") {
      if (raw.length > LIMITS.maxSchemaStringChars) {
        return null;
      }
      out[key] = raw;
      continue;
    }
    if (typeof raw === "number" || typeof raw === "boolean") {
      out[key] = raw;
      continue;
    }
    return null;
  }
  return out;
}

function narrowContent(value: unknown, maxChars: number): ProxyContent | null {
  if (!isRecord(value) || !Array.isArray(value["parts"])) {
    return null;
  }
  const rawParts = value["parts"];
  if (rawParts.length === 0 || rawParts.length > LIMITS.maxPartsPerContent) {
    return null;
  }
  const parts: ProxyPart[] = [];
  let total = 0;
  for (const rawPart of rawParts) {
    if (!isRecord(rawPart) || typeof rawPart["text"] !== "string") {
      return null;
    }
    const text = rawPart["text"];
    total += text.length;
    if (text.length > maxChars || total > maxChars) {
      return null;
    }
    parts.push({ text });
  }
  return { parts };
}

/**
 * Rebuilds a `generateContent` request from an allowlist. Returns the narrowed
 * request — never the caller's object — so unknown fields cannot reach the upstream.
 */
export function validateGenerateContentRequest(body: unknown): ValidationOutcome {
  if (!isRecord(body)) {
    return fail("INVALID_BODY", "Request body must be a JSON object.");
  }

  // Absent means Gemini, so every existing caller is unaffected. Anything other than
  // the two names is refused rather than defaulted: a typo silently landing on Gemini
  // would mislabel a provider comparison.
  const rawProvider = body["provider"];
  if (rawProvider !== undefined && rawProvider !== "gemini" && rawProvider !== "claude") {
    return fail("INVALID_BODY", '`provider` must be "gemini" or "claude".');
  }
  const provider: Provider = rawProvider ?? "gemini";
  const providerExplicit = rawProvider !== undefined;

  // Routing fields (llm-routing.ts). Like `provider`, a malformed value is refused rather than
  // ignored: a typo silently dropping the opt-in or the retry marker would hide a client bug.
  const rawAttempt = body["attempt"];
  if (rawAttempt !== undefined && rawAttempt !== 1 && rawAttempt !== 2) {
    return fail("INVALID_BODY", "`attempt` must be 1 or 2.");
  }
  const rawOptIn = body["claudeRoutingOptIn"];
  if (rawOptIn !== undefined && typeof rawOptIn !== "boolean") {
    return fail("INVALID_BODY", "`claudeRoutingOptIn` must be a boolean.");
  }

  // Claude-only knob. The route is unauthenticated, so a caller may move spend down
  // (low) but never up — "high" and above are refused. On the Gemini path the field
  // is ignored like any other unknown top-level key, so those bytes do not change.
  const rawEffort = body["claudeEffort"];
  let claudeEffort: ClaudeEffort | undefined;
  if (provider === "claude" && rawEffort !== undefined) {
    if (rawEffort !== "low" && rawEffort !== "medium") {
      return fail("INVALID_BODY", '`claudeEffort` must be "low" or "medium".');
    }
    claudeEffort = rawEffort;
  }

  const rawContents = body["contents"];
  if (!Array.isArray(rawContents) || rawContents.length === 0 || rawContents.length > LIMITS.maxContents) {
    return fail("INVALID_BODY", "`contents` must be an array of 1 to " + LIMITS.maxContents + " entries.");
  }

  const contents: ProxyContent[] = [];
  for (const rawContent of rawContents) {
    const narrowed = narrowContent(rawContent, LIMITS.maxPartTextChars);
    if (narrowed === null) {
      return fail("INVALID_BODY", "Each `contents` entry must hold short text parts only.");
    }
    contents.push(narrowed);
  }

  const request: ProxyRequest = { contents };

  const rawSystemInstruction = body["systemInstruction"];
  if (rawSystemInstruction !== undefined) {
    const narrowed = narrowContent(rawSystemInstruction, LIMITS.maxSystemInstructionChars);
    if (narrowed === null) {
      return fail("INVALID_BODY", "`systemInstruction` must hold text parts within the size limit.");
    }
    request.systemInstruction = narrowed;
  }

  const rawConfig = body["generationConfig"];
  if (rawConfig !== undefined) {
    if (!isRecord(rawConfig)) {
      return fail("INVALID_BODY", "`generationConfig` must be an object.");
    }
    const config: ProxyGenerationConfig = {};

    const mimeType = rawConfig["responseMimeType"];
    if (mimeType !== undefined) {
      if (mimeType !== "application/json" && mimeType !== "text/plain") {
        return fail("INVALID_BODY", "`responseMimeType` must be application/json or text/plain.");
      }
      config.responseMimeType = mimeType;
    }

    const temperature = rawConfig["temperature"];
    if (temperature !== undefined) {
      if (typeof temperature !== "number" || !Number.isFinite(temperature) || temperature < 0 || temperature > 2) {
        return fail("INVALID_BODY", "`temperature` must be a number between 0 and 2.");
      }
      config.temperature = temperature;
    }

    const schema = rawConfig["responseSchema"];
    if (schema !== undefined) {
      const narrowed = narrowSchema(schema, 1, { nodes: 0 });
      if (narrowed === null) {
        return fail("INVALID_BODY", "`responseSchema` is not a supported schema shape.");
      }
      config.responseSchema = narrowed;
    }

    request.generationConfig = config;
  }

  const serialized = JSON.stringify(request);
  if (Buffer.byteLength(serialized, "utf8") > LIMITS.maxSerializedBytes) {
    return fail("PAYLOAD_TOO_LARGE", "Request exceeds the size limit.");
  }

  return {
    ok: true,
    request,
    provider,
    ...(claudeEffort === undefined ? {} : { claudeEffort }),
    providerExplicit,
    ...(rawAttempt === 2 ? { attempt: 2 as const } : {}),
    claudeRoutingOptIn: rawOptIn === true
  };
}
