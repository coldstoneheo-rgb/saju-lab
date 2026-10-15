import type Anthropic from "@anthropic-ai/sdk";
import { describe, expect, it } from "vitest";
import {
  LIST_PROMPT_LAYER,
  SchemaTranslationError,
  fromAnthropicMessage,
  orderingHint,
  toAnthropicParams,
  toJsonSchema
} from "./claude-adapter.js";
import { validateGenerateContentRequest, type ProxyRequest } from "./gemini-request.js";
import { babyLetterRequest, babyNamingRequest, babyNamingSchema } from "./baby-request-fixtures.js";

function narrowed(body: Record<string, unknown>): ProxyRequest {
  const outcome = validateGenerateContentRequest(body);
  if (!outcome.ok) {
    throw new Error(outcome.message);
  }
  return outcome.request;
}

const OPTIONS = { model: "claude-sonnet-5-5", effort: "medium", maxTokens: 16_000 } as const;

function message(content: unknown[], overrides: Partial<Anthropic.Message> = {}): Anthropic.Message {
  return {
    id: "msg_test",
    type: "message",
    role: "assistant",
    model: "claude-sonnet-5-5",
    content,
    stop_reason: "end_turn",
    stop_details: null,
    stop_sequence: null,
    usage: { input_tokens: 4000, output_tokens: 3000 },
    ...overrides
  } as unknown as Anthropic.Message;
}

function nameItem(i: number): Record<string, unknown> {
  // Keys deliberately out of propertyOrdering order — the adapter must restore it.
  return {
    structural_check: {
      stroke_yinyang: "8획(음) - 13획(양) - 15획(양) - 음양의 균형",
      pronunciation_ohaeng: "토금토 (土金土) - 상생 흐름",
      jawon_ohaeng: "수목 (水木) - 목을 채움"
    },
    hanja_meanings: "상서로운 기운(瑞)을 품는다",
    name_hanja: "金瑞娥",
    name_korean: `김서${i}`
  };
}

function expandedNames(count: number): Record<string, unknown> {
  return Object.fromEntries(Array.from({ length: count }, (_, i) => [`item_${i + 1}`, nameItem(i)]));
}

const SUMMARY = {
  remedy_strategy: "부족한 물의 기운을 이름에 담았습니다.",
  lacking_element: "水",
  birth_eight_characters: "丙午(병오)年 甲午(갑오)月 庚辰(경진)日 壬午(임오)時"
};

function collectKeys(node: unknown, keys: Set<string>): Set<string> {
  if (Array.isArray(node)) {
    node.forEach((entry) => collectKeys(entry, keys));
  } else if (typeof node === "object" && node !== null) {
    for (const [key, value] of Object.entries(node)) {
      keys.add(key);
      collectKeys(value, keys);
    }
  }
  return keys;
}

describe("toJsonSchema — count guarantee by expansion", () => {
  it("turns PREMIUM's 10-name array into exactly ten required item slots sharing one $def", () => {
    const schema = toJsonSchema(babyNamingSchema(10));
    const names = (schema["properties"] as Record<string, Record<string, unknown>>)["recommended_names"];
    expect(names).toMatchObject({ type: "object", additionalProperties: false });
    expect(names?.["required"]).toEqual(Array.from({ length: 10 }, (_, i) => `item_${i + 1}`));
    expect(Object.values(names?.["properties"] as object)).toEqual(
      Array.from({ length: 10 }, () => ({ $ref: "#/$defs/recommended_names_item" }))
    );
    expect(Object.keys(schema["$defs"] as object)).toEqual(["recommended_names_item"]);
  });

  it("gives FREE three slots", () => {
    const schema = toJsonSchema(babyNamingSchema(3));
    const names = (schema["properties"] as Record<string, Record<string, unknown>>)["recommended_names"];
    expect(names?.["required"]).toEqual(["item_1", "item_2", "item_3"]);
  });

  it("leaves no Gemini-only keys and closes every object", () => {
    const schema = toJsonSchema(babyNamingSchema(10));
    const keys = collectKeys(schema, new Set());
    for (const geminiOnly of ["propertyOrdering", "minItems", "maxItems", "nullable"]) {
      expect(keys.has(geminiOnly)).toBe(false);
    }
    const objects: Record<string, unknown>[] = [];
    (function walk(node: unknown): void {
      if (typeof node === "object" && node !== null) {
        if ((node as Record<string, unknown>)["type"] === "object") {
          objects.push(node as Record<string, unknown>);
        }
        Object.values(node).forEach(walk);
      }
    })(schema);
    expect(objects.length).toBeGreaterThan(3);
    for (const object of objects) {
      expect(object["additionalProperties"]).toBe(false);
    }
  });

  it("keeps the Korean descriptions — they carry the output-language mandate", () => {
    const serialized = JSON.stringify(toJsonSchema(babyNamingSchema(10)));
    expect(serialized).toContain("영어 단어를 쓰지 말 것");
    expect(serialized).toContain("반드시 한국어 문장으로 작성");
  });

  it("declares properties in propertyOrdering order even when the source map is ordered differently", () => {
    const schema = toJsonSchema({
      type: "OBJECT",
      properties: { b: { type: "STRING" }, a: { type: "STRING" } },
      propertyOrdering: ["a", "b"]
    });
    expect(Object.keys(schema["properties"] as object)).toEqual(["a", "b"]);
  });

  it("keeps an unpinned array as an array without count keywords", () => {
    expect(toJsonSchema({ type: "ARRAY", minItems: 1, maxItems: 5, items: { type: "STRING" } })).toEqual({
      type: "array",
      items: { type: "string" }
    });
  });

  it("maps nullable to anyOf null and drops unsupported formats", () => {
    expect(toJsonSchema({ type: "STRING", nullable: true, format: "enum" })).toEqual({
      anyOf: [{ type: "string" }, { type: "null" }]
    });
    expect(toJsonSchema({ type: "STRING", format: "date" })).toEqual({ type: "string", format: "date" });
  });

  it("keeps separate $defs when two pinned arrays share a property name but not an item shape", () => {
    const schema = toJsonSchema({
      type: "OBJECT",
      properties: {
        a: { type: "OBJECT", properties: { list: { type: "ARRAY", minItems: 2, maxItems: 2, items: { type: "STRING" } } } },
        b: { type: "OBJECT", properties: { list: { type: "ARRAY", minItems: 2, maxItems: 2, items: { type: "INTEGER" } } } }
      }
    });
    expect(schema["$defs"]).toEqual({ list_item: { type: "string" }, list_item_2: { type: "integer" } });
  });

  it("does not mistake inherited object members for answer keys", () => {
    const out = fromAnthropicMessage(
      message([{ type: "text", text: JSON.stringify({ saju_analysis_summary: SUMMARY }) }]),
      narrowed({
        contents: [{ parts: [{ text: "x" }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: { saju_analysis_summary: { type: "OBJECT" }, constructor: { type: "STRING" } },
            required: ["saju_analysis_summary", "constructor"]
          }
        }
      })
    );
    expect(out).toEqual({ ok: false, reason: expect.stringContaining("constructor: missing required property") });
  });

  it("refuses a type it cannot translate", () => {
    expect(() => toJsonSchema({ type: "TUPLE" })).toThrow(SchemaTranslationError);
  });
});

describe("toAnthropicParams", () => {
  it("maps the naming request: system blocks + order hint, user message, schema format, no temperature", () => {
    const request = narrowed(babyNamingRequest("PREMIUM"));
    const params = toAnthropicParams(request, OPTIONS);

    expect(params.model).toBe("claude-sonnet-5-5");
    expect(params.max_tokens).toBe(16_000);
    expect(params).not.toHaveProperty("temperature");
    expect(params).not.toHaveProperty("tool_choice");
    expect(params.output_config?.effort).toBe("medium");
    expect(params.output_config?.format?.type).toBe("json_schema");
    expect(params.messages).toEqual([{ role: "user", content: [{ type: "text", text: request.contents[0]?.parts[0]?.text }] }]);

    const system = params.system as Anthropic.TextBlockParam[];
    expect(system).toHaveLength(2);
    expect(system[0]?.text).toBe(request.systemInstruction?.parts[0]?.text);
    expect(system[1]?.text).toContain("saju_analysis_summary → recommended_names");
  });

  it("maps the letter request 1:1 as plain text — no format, no extra system block", () => {
    const request = narrowed(babyLetterRequest());
    const params = toAnthropicParams(request, OPTIONS);

    expect(params.output_config).toEqual({ effort: "medium" });
    expect(params).not.toHaveProperty("temperature");
    expect(params.system).toEqual([{ type: "text", text: request.systemInstruction?.parts[0]?.text }]);
    expect(params.messages).toHaveLength(1);
  });

  it("appends the list layer as one more system block when on, and nothing else changes", () => {
    for (const tier of ["FREE", "PREMIUM"] as const) {
      const request = narrowed(babyNamingRequest(tier));
      const off = toAnthropicParams(request, OPTIONS);
      const on = toAnthropicParams(request, { ...OPTIONS, listLayer: true });

      const onSystem = on.system as Anthropic.TextBlockParam[];
      expect(onSystem).toHaveLength(3);
      expect(onSystem[2]).toEqual({ type: "text", text: LIST_PROMPT_LAYER });
      // Byte difference is exactly the appended block: same schema, messages, effort, first two blocks.
      expect({ ...on, system: onSystem.slice(0, 2) }).toEqual(off);
      expect(JSON.stringify(on).length - JSON.stringify(off).length).toBe(
        JSON.stringify({ type: "text", text: LIST_PROMPT_LAYER }).length + 1
      );
    }
  });

  it("leaves the letter request untouched even when the list layer is on", () => {
    const request = narrowed(babyLetterRequest());
    expect(toAnthropicParams(request, { ...OPTIONS, listLayer: true })).toEqual(toAnthropicParams(request, OPTIONS));
  });

  it("copies the initial-consonant table verbatim from the app's naming prompt", () => {
    // baby-naming-ai app/src/main/java/com/example/data/repository/NamingRepository.kt:225 (rule 2).
    const appTable = "Wood (木): ㄱ, ㅋ / Fire (火): ㄴ, ㄷ, ㄹ, ㅌ / Earth (土): ㅇ, ㅎ / Metal (金): ㅅ, ㅈ, ㅊ / Water (水): ㅁ, ㅂ, ㅍ";
    expect(LIST_PROMPT_LAYER).toContain(appTable);
  });

  it("orders the hint the way the app's schema pins it", () => {
    expect(orderingHint(babyNamingSchema(3))).toBe(
      [
        "Write the JSON object's fields in exactly this order:",
        "- top level: saju_analysis_summary → recommended_names",
        "- saju_analysis_summary: birth_eight_characters → lacking_element → remedy_strategy",
        "- recommended_names (each item): name_korean → name_hanja → hanja_meanings → structural_check",
        "- structural_check: pronunciation_ohaeng → jawon_ohaeng → stroke_yinyang"
      ].join("\n")
    );
  });
});

describe("fromAnthropicMessage — Gemini-shaped answer", () => {
  const premium = narrowed(babyNamingRequest("PREMIUM"));

  it("folds the slots back into a 10-name array, restores key order and drops thinking", () => {
    const raw = JSON.stringify({ recommended_names: expandedNames(10), saju_analysis_summary: SUMMARY });
    const out = fromAnthropicMessage(
      message([
        { type: "thinking", thinking: "", signature: "sig" },
        { type: "text", text: raw }
      ]),
      premium
    );
    expect(out.ok).toBe(true);
    if (!out.ok) return;

    const candidates = out.body["candidates"] as Array<{ content: { parts: Array<{ text: string }> } }>;
    const text = candidates[0]?.content.parts[0]?.text ?? "";
    const parsed = JSON.parse(text) as Record<string, unknown>;
    expect(Object.keys(parsed)).toEqual(["saju_analysis_summary", "recommended_names"]);
    expect(Object.keys(parsed["saju_analysis_summary"] as object)).toEqual([
      "birth_eight_characters",
      "lacking_element",
      "remedy_strategy"
    ]);
    const names = parsed["recommended_names"] as Array<Record<string, unknown>>;
    expect(names).toHaveLength(10);
    expect(names.map((name) => name["name_korean"])).toEqual(Array.from({ length: 10 }, (_, i) => `김서${i}`));
    expect(Object.keys(names[0] ?? {})).toEqual(["name_korean", "name_hanja", "hanja_meanings", "structural_check"]);
    expect(Object.keys(names[0]?.["structural_check"] as object)).toEqual([
      "pronunciation_ohaeng",
      "jawon_ohaeng",
      "stroke_yinyang"
    ]);
    // No code fence, no prefix — the app's cleanJson only trims.
    expect(text.startsWith("{")).toBe(true);
    expect(out.body).toMatchObject({
      candidates: [{ finishReason: "STOP", content: { role: "model" } }],
      usageMetadata: { promptTokenCount: 4000, candidatesTokenCount: 3000, totalTokenCount: 7000 },
      modelVersion: "claude-sonnet-5-5",
      responseId: "msg_test"
    });
  });

  it("rejects nine names where ten are required", () => {
    const raw = JSON.stringify({ saju_analysis_summary: SUMMARY, recommended_names: expandedNames(9) });
    const out = fromAnthropicMessage(message([{ type: "text", text: raw }]), premium);
    expect(out).toEqual({ ok: false, reason: expect.stringContaining("expected exactly 10 items") });
  });

  it("rejects a missing field and an undeclared one", () => {
    const missing = { saju_analysis_summary: { lacking_element: "水" }, recommended_names: expandedNames(10) };
    const extra = { saju_analysis_summary: SUMMARY, recommended_names: expandedNames(10), easy_explanation: "편지" };
    for (const body of [missing, extra]) {
      const out = fromAnthropicMessage(message([{ type: "text", text: JSON.stringify(body) }]), premium);
      expect(out.ok).toBe(false);
    }
  });

  it("refuses to pass on a truncated, refused, empty or non-JSON answer", () => {
    const cases: Array<[Anthropic.Message, string]> = [
      [message([{ type: "text", text: '{"saju' }], { stop_reason: "max_tokens" }), "stop_reason=max_tokens"],
      [
        message([], { stop_reason: "refusal", stop_details: { type: "refusal", category: "cyber", explanation: null } as never }),
        "stop_reason=refusal category=cyber"
      ],
      [message([{ type: "text", text: "  " }]), "empty text"],
      [message([{ type: "text", text: "이름은 김서아입니다" }]), "invalid JSON"]
    ];
    for (const [input, reason] of cases) {
      expect(fromAnthropicMessage(input, premium)).toEqual({ ok: false, reason });
    }
  });

  it("passes the letter through as plain text, untouched", () => {
    const letter = "사랑하는 부모님께,\n\n서아라는 이름에는 맑은 물의 기운이 담겨 있습니다.";
    const out = fromAnthropicMessage(message([{ type: "text", text: letter }]), narrowed(babyLetterRequest()));
    expect(out.ok).toBe(true);
    if (out.ok) {
      const candidates = out.body["candidates"] as Array<{ content: { parts: Array<{ text: string }> } }>;
      expect(candidates[0]?.content.parts[0]?.text).toBe(letter);
    }
  });
});
