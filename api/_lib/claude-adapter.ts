import type Anthropic from "@anthropic-ai/sdk";
import type { ProxyContent, ProxyRequest } from "./gemini-request.js";

/**
 * Pure translation between the gateway's narrowed Gemini request and the Anthropic
 * Messages API (docs/DESIGN-dualllm-saju-baby.md §2–§3). No I/O here — the call
 * itself lives in `claude-generate.ts`.
 *
 * Two facts shape this file:
 * - Claude structured outputs (`output_config.format`) take JSON Schema but do not
 *   enforce array length. The naming flow's FREE 3 / PREMIUM 10 guarantee came from
 *   Gemini's `minItems`/`maxItems` (baby HO-2026-0803 §2.6: the schema beats the
 *   prompt), so an array whose min and max agree is sent as an object with exactly
 *   that many required `item_N` keys, and folded back into an array on the way out.
 * - Forced tool choice is rejected by the Opus/Sonnet 5.5 models, so tool use is not
 *   the vehicle for structured output here.
 */

/** Arrays up to this length are expanded into fixed-key objects. Above it the count is only checked afterwards. */
const MAX_EXPANDED_ITEMS = 20;

/** String formats Claude structured outputs accept; any other Gemini `format` is dropped. */
const SUPPORTED_FORMATS = new Set([
  "date-time",
  "time",
  "date",
  "duration",
  "email",
  "hostname",
  "uri",
  "ipv4",
  "ipv6",
  "uuid"
]);

const TYPE_MAP: Record<string, string> = {
  OBJECT: "object",
  ARRAY: "array",
  STRING: "string",
  INTEGER: "integer",
  NUMBER: "number",
  BOOLEAN: "boolean"
};

export class SchemaTranslationError extends Error {}

type SchemaNode = Record<string, unknown>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
}

function geminiType(node: SchemaNode): string {
  const raw = node["type"];
  const mapped = typeof raw === "string" ? TYPE_MAP[raw.toUpperCase()] : undefined;
  if (!mapped) {
    throw new SchemaTranslationError(`unsupported schema type: ${String(raw)}`);
  }
  return mapped;
}

/** Property names in `propertyOrdering` order first, then any remaining declared ones in their original order. */
export function orderedKeys(node: SchemaNode): string[] {
  const properties = isRecord(node["properties"]) ? Object.keys(node["properties"]) : [];
  const ordering = stringList(node["propertyOrdering"]).filter((key) => properties.includes(key));
  return [...ordering, ...properties.filter((key) => !ordering.includes(key))];
}

/** The fixed length an array must have, when its schema pins one that we expand. */
export function expandedLength(node: SchemaNode): number | null {
  const min = node["minItems"];
  const max = node["maxItems"];
  if (typeof min === "number" && min === max && Number.isInteger(min) && min >= 1 && min <= MAX_EXPANDED_ITEMS) {
    return min;
  }
  return null;
}

export function itemKey(index: number): string {
  return `item_${index + 1}`;
}

/**
 * Gemini `responseSchema` (already narrowed) → JSON Schema for `output_config.format`.
 * An expanded array's item schema goes into `$defs` once and each `item_N` refers to
 * it, so PREMIUM's ten slots do not repeat the Korean descriptions ten times.
 */
export function toJsonSchema(node: unknown): SchemaNode {
  const defs: SchemaNode = {};
  const root = translateNode(node, defs, "root");
  return Object.keys(defs).length > 0 ? { ...root, $defs: defs } : root;
}

function translateNode(node: unknown, defs: SchemaNode, name: string): SchemaNode {
  if (!isRecord(node)) {
    throw new SchemaTranslationError("schema node is not an object");
  }
  const type = geminiType(node);
  let out: SchemaNode;

  if (type === "object") {
    const rawProperties = isRecord(node["properties"]) ? node["properties"] : {};
    const properties: SchemaNode = {};
    for (const key of orderedKeys(node)) {
      properties[key] = translateNode(rawProperties[key], defs, key);
    }
    out = { type, properties, additionalProperties: false };
    const required = stringList(node["required"]);
    if (required.length > 0) {
      out["required"] = required;
    }
  } else if (type === "array") {
    const items = translateNode(node["items"], defs, `${name}_item`);
    const length = expandedLength(node);
    if (length !== null) {
      // Two pinned arrays under the same property name with different item shapes
      // must not overwrite each other's definition.
      let defName = `${name}_item`;
      for (let suffix = 2; Object.hasOwn(defs, defName) && JSON.stringify(defs[defName]) !== JSON.stringify(items); suffix += 1) {
        defName = `${name}_item_${suffix}`;
      }
      defs[defName] = items;
      const properties: SchemaNode = {};
      const required: string[] = [];
      for (let i = 0; i < length; i += 1) {
        properties[itemKey(i)] = { $ref: `#/$defs/${defName}` };
        required.push(itemKey(i));
      }
      out = { type: "object", properties, required, additionalProperties: false };
    } else {
      out = { type, items };
    }
  } else {
    out = { type };
    const format = node["format"];
    if (typeof format === "string" && SUPPORTED_FORMATS.has(format)) {
      out["format"] = format;
    }
  }

  if (typeof node["description"] === "string") {
    out["description"] = node["description"];
  }
  if (Array.isArray(node["enum"])) {
    out["enum"] = node["enum"];
  }
  if (node["nullable"] === true) {
    return { anyOf: [out, { type: "null" }] };
  }
  return out;
}

/**
 * One line per object that pins an order, e.g. «a → b» and «b (each item): x → y».
 * Sent as a Claude-only system block so the generation order (summary before names)
 * does not rest on how the output grammar orders keys.
 */
export function orderingHint(schema: SchemaNode): string | null {
  const lines: string[] = [];
  function walk(node: unknown, label: string): void {
    if (!isRecord(node)) {
      return;
    }
    const type = TYPE_MAP[String(node["type"]).toUpperCase()];
    if (type === "array") {
      walk(node["items"], `${label} (each item)`);
      return;
    }
    if (type !== "object" || !isRecord(node["properties"])) {
      return;
    }
    const keys = orderedKeys(node);
    if (stringList(node["propertyOrdering"]).length > 0 && keys.length > 1) {
      lines.push(`- ${label}: ${keys.join(" → ")}`);
    }
    for (const key of keys) {
      walk(node["properties"][key], key);
    }
  }
  walk(schema, "top level");
  if (lines.length === 0) {
    return null;
  }
  return ["Write the JSON object's fields in exactly this order:", ...lines].join("\n");
}

/**
 * Claude-only system block for the naming **list** (a request with a response schema; the
 * letter has none). One sentence per error type the two LLM judges found in Claude's v2
 * lists (baby `docs/eval/2026-10-15-dualllm-judge.md` §1-4): reading ↔ Hanja mismatch,
 * surname pronunciation element, source element ↔ Hanja mismatch, forced stroke «harmony»,
 * overstatement. The initial-consonant table is copied verbatim from the app's naming prompt
 * (baby `NamingRepository.kt` namingSystemInstructionBase, rule 2); a test pins the copy.
 * It runs alongside the app's ClaudeOutputFilter (duplicate readings,
 * 30-char clamp), which covers other error types and stays as the safety net.
 */
export const LIST_PROMPT_LAYER = [
  "추천 이름 목록을 쓸 때 아래 다섯 가지를 지킨다.",
  "- name_korean의 각 음절은 name_hanja의 같은 자리 한자의 표준 한국어 독음과 정확히 같아야 한다. 맞지 않으면 독음이 맞는 다른 한자를 고른다.",
  "- pronunciation_ohaeng은 성씨 음절까지 포함해 모든 음절을 초성으로 판정한다 — Wood (木): ㄱ, ㅋ / Fire (火): ㄴ, ㄷ, ㄹ, ㅌ / Earth (土): ㅇ, ㅎ / Metal (金): ㅅ, ㅈ, ㅊ / Water (水): ㅁ, ㅂ, ㅍ",
  "- jawon_ohaeng에는 각 한자의 실제 자원오행을 적고, 부족 오행은 입력에 주어진 값을 그대로 쓰며, 그 오행을 가진 한자가 이름에 실제로 있을 때만 «보완한다»고 쓴다.",
  "- stroke_yinyang에서 획수의 음양이 한쪽으로 치우치면 «조화»라고 쓰지 말고 있는 그대로 적는다.",
  "- «완벽하게», «반드시», «최고의» 같은 단정·과장 표현을 쓰지 않는다."
].join("\n");

export interface ClaudeCallOptions {
  model: string;
  effort: "low" | "medium" | "high";
  maxTokens: number;
  /** Append [LIST_PROMPT_LAYER] to list requests. Off reproduces the v2 evaluation bytes. */
  listLayer?: boolean;
}

function textBlocks(content: ProxyContent): Anthropic.TextBlockParam[] {
  return content.parts.map((part) => ({ type: "text", text: part.text }));
}

/**
 * Narrowed Gemini request → Messages API params. `temperature` is deliberately not
 * carried over: the 5.5 models reject non-default sampling values.
 */
export function toAnthropicParams(
  request: ProxyRequest,
  options: ClaudeCallOptions
): Anthropic.MessageCreateParamsNonStreaming {
  const schema = request.generationConfig?.responseSchema;
  const system = request.systemInstruction ? textBlocks(request.systemInstruction) : [];
  const outputConfig: Anthropic.OutputConfig = { effort: options.effort };

  if (schema !== undefined) {
    outputConfig.format = { type: "json_schema", schema: toJsonSchema(schema) };
    const hint = orderingHint(schema);
    if (hint !== null) {
      system.push({ type: "text", text: hint });
    }
    if (options.listLayer === true) {
      system.push({ type: "text", text: LIST_PROMPT_LAYER });
    }
  }

  const params: Anthropic.MessageCreateParamsNonStreaming = {
    model: options.model,
    max_tokens: options.maxTokens,
    messages: request.contents.map((content) => ({ role: "user", content: textBlocks(content) })),
    output_config: outputConfig
  };
  if (system.length > 0) {
    params.system = system;
  }
  return params;
}

export class SchemaViolation extends Error {}

/**
 * Checks a parsed Claude value against the original Gemini schema, folds expanded
 * arrays back, and rebuilds every object in `propertyOrdering` order — so the text
 * the app receives has the same keys, counts and order the Gemini contract gives.
 */
export function conformToSchema(value: unknown, node: SchemaNode, path = "$"): unknown {
  if (value === null && node["nullable"] === true) {
    return null;
  }
  const type = geminiType(node);
  const enumValues = node["enum"];
  if (Array.isArray(enumValues) && !enumValues.includes(value)) {
    throw new SchemaViolation(`${path}: value outside enum`);
  }

  switch (type) {
    case "object": {
      if (!isRecord(value)) {
        throw new SchemaViolation(`${path}: expected object`);
      }
      const properties = isRecord(node["properties"]) ? node["properties"] : {};
      const declared = orderedKeys(node);
      for (const key of Object.keys(value)) {
        if (!declared.includes(key)) {
          throw new SchemaViolation(`${path}.${key}: undeclared property`);
        }
      }
      for (const key of stringList(node["required"])) {
        if (!Object.hasOwn(value, key)) {
          throw new SchemaViolation(`${path}.${key}: missing required property`);
        }
      }
      const out: Record<string, unknown> = {};
      for (const key of declared) {
        if (Object.hasOwn(value, key)) {
          out[key] = conformToSchema(value[key], properties[key] as SchemaNode, `${path}.${key}`);
        }
      }
      return out;
    }
    case "array": {
      const items = node["items"] as SchemaNode;
      const length = expandedLength(node);
      let entries: unknown[];
      if (length !== null) {
        if (!isRecord(value)) {
          throw new SchemaViolation(`${path}: expected ${length} items`);
        }
        const keys = Array.from({ length }, (_, i) => itemKey(i));
        if (Object.keys(value).length !== length || keys.some((key) => !Object.hasOwn(value, key))) {
          throw new SchemaViolation(`${path}: expected exactly ${length} items`);
        }
        entries = keys.map((key) => value[key]);
      } else {
        if (!Array.isArray(value)) {
          throw new SchemaViolation(`${path}: expected array`);
        }
        entries = value;
      }
      const min = node["minItems"];
      const max = node["maxItems"];
      if ((typeof min === "number" && entries.length < min) || (typeof max === "number" && entries.length > max)) {
        throw new SchemaViolation(`${path}: ${entries.length} items outside [${String(min)}, ${String(max)}]`);
      }
      return entries.map((entry, i) => conformToSchema(entry, items, `${path}[${i}]`));
    }
    case "string":
      if (typeof value !== "string") {
        throw new SchemaViolation(`${path}: expected string`);
      }
      return value;
    case "integer":
      if (typeof value !== "number" || !Number.isInteger(value)) {
        throw new SchemaViolation(`${path}: expected integer`);
      }
      return value;
    case "number":
      if (typeof value !== "number") {
        throw new SchemaViolation(`${path}: expected number`);
      }
      return value;
    default:
      if (typeof value !== "boolean") {
        throw new SchemaViolation(`${path}: expected boolean`);
      }
      return value;
  }
}

export type TranslatedResponse =
  | { ok: true; body: Record<string, unknown> }
  | { ok: false; reason: string };

/** Messages API response → the Gemini `generateContent` shape the app already parses. */
export function fromAnthropicMessage(message: Anthropic.Message, request: ProxyRequest): TranslatedResponse {
  if (message.stop_reason !== "end_turn") {
    const category = message.stop_details?.category;
    return { ok: false, reason: `stop_reason=${String(message.stop_reason)}${category ? ` category=${category}` : ""}` };
  }

  // Thinking blocks (adaptive thinking is on by default) are dropped; only text is the answer.
  let text = message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");
  if (text.trim() === "") {
    return { ok: false, reason: "empty text" };
  }

  const schema = request.generationConfig?.responseSchema;
  if (schema !== undefined) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return { ok: false, reason: "invalid JSON" };
    }
    try {
      text = JSON.stringify(conformToSchema(parsed, schema));
    } catch (error) {
      if (error instanceof SchemaViolation) {
        return { ok: false, reason: `schema-violation ${error.message}` };
      }
      throw error;
    }
  }

  const promptTokenCount = message.usage.input_tokens;
  const candidatesTokenCount = message.usage.output_tokens;
  return {
    ok: true,
    body: {
      candidates: [{ content: { parts: [{ text }], role: "model" }, finishReason: "STOP" }],
      usageMetadata: {
        promptTokenCount,
        candidatesTokenCount,
        totalTokenCount: promptTokenCount + candidatesTokenCount
      },
      modelVersion: message.model,
      responseId: message.id
    }
  };
}
