import { describe, expect, it } from "vitest";
import { LIMITS, validateGenerateContentRequest } from "./gemini-request.js";

const namingRequest = {
  contents: [{ parts: [{ text: "Here is the input information block: {}" }] }],
  systemInstruction: { parts: [{ text: "You are a naming expert." }] },
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.8,
    responseSchema: {
      type: "OBJECT",
      properties: {
        recommended_names: {
          type: "ARRAY",
          minItems: 3,
          maxItems: 3,
          items: { type: "STRING", description: "한국어로 작성" }
        }
      },
      required: ["recommended_names"],
      propertyOrdering: ["recommended_names"]
    }
  }
};

describe("validateGenerateContentRequest", () => {
  it("accepts the shape the app actually sends", () => {
    const outcome = validateGenerateContentRequest(namingRequest);
    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      expect(outcome.request).toEqual(namingRequest);
    }
  });

  it("accepts the letter shape (no schema, plain text out)", () => {
    const outcome = validateGenerateContentRequest({
      contents: [{ parts: [{ text: "[이름] 김서아" }] }],
      systemInstruction: { parts: [{ text: "당신은 작명가입니다." }] },
      generationConfig: { temperature: 0.9 }
    });
    expect(outcome.ok).toBe(true);
  });

  it("drops fields that are not on the allowlist", () => {
    const outcome = validateGenerateContentRequest({
      ...namingRequest,
      tools: [{ googleSearch: {} }],
      safetySettings: [{ category: "HARM_CATEGORY_DANGEROUS", threshold: "BLOCK_NONE" }],
      cachedContent: "projects/x/cachedContents/y"
    });
    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      expect(Object.keys(outcome.request).sort()).toEqual([
        "contents",
        "generationConfig",
        "systemInstruction"
      ]);
    }
  });

  it("drops unknown generationConfig fields, including ones that would cost more", () => {
    const outcome = validateGenerateContentRequest({
      contents: [{ parts: [{ text: "hi" }] }],
      generationConfig: { temperature: 0.5, candidateCount: 8, maxOutputTokens: 1_000_000 }
    });
    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      expect(outcome.request.generationConfig).toEqual({ temperature: 0.5 });
    }
  });

  it("rejects a body that is not an object", () => {
    expect(validateGenerateContentRequest("hello").ok).toBe(false);
    expect(validateGenerateContentRequest(null).ok).toBe(false);
    expect(validateGenerateContentRequest([1, 2]).ok).toBe(false);
  });

  it("rejects missing or oversized contents", () => {
    expect(validateGenerateContentRequest({}).ok).toBe(false);
    expect(validateGenerateContentRequest({ contents: [] }).ok).toBe(false);
    const tooMany = { contents: Array.from({ length: LIMITS.maxContents + 1 }, () => ({ parts: [{ text: "x" }] })) };
    expect(validateGenerateContentRequest(tooMany).ok).toBe(false);
  });

  it("rejects a prompt longer than the naming flow can produce", () => {
    const outcome = validateGenerateContentRequest({
      contents: [{ parts: [{ text: "x".repeat(LIMITS.maxPartTextChars + 1) }] }]
    });
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) {
      expect(outcome.code).toBe("INVALID_BODY");
    }
  });

  it("rejects non-text parts (inline files, function calls)", () => {
    const outcome = validateGenerateContentRequest({
      contents: [{ parts: [{ inlineData: { mimeType: "image/png", data: "AAAA" } }] }]
    });
    expect(outcome.ok).toBe(false);
  });

  it("rejects a temperature outside the accepted range", () => {
    expect(
      validateGenerateContentRequest({
        contents: [{ parts: [{ text: "x" }] }],
        generationConfig: { temperature: 9 }
      }).ok
    ).toBe(false);
  });

  it("rejects a response mime type it does not serve", () => {
    expect(
      validateGenerateContentRequest({
        contents: [{ parts: [{ text: "x" }] }],
        generationConfig: { responseMimeType: "audio/wav" }
      }).ok
    ).toBe(false);
  });

  it("rejects a schema nested past the depth limit", () => {
    let schema: Record<string, unknown> = { type: "STRING" };
    for (let i = 0; i < LIMITS.maxSchemaDepth + 2; i += 1) {
      schema = { type: "OBJECT", properties: { child: schema } };
    }
    const outcome = validateGenerateContentRequest({
      contents: [{ parts: [{ text: "x" }] }],
      generationConfig: { responseSchema: schema }
    });
    expect(outcome.ok).toBe(false);
  });

  it("rejects a schema with more nodes than the naming schema needs", () => {
    const properties: Record<string, unknown> = {};
    for (let i = 0; i < LIMITS.maxSchemaNodes + 1; i += 1) {
      properties[`field_${i}`] = { type: "STRING" };
    }
    const outcome = validateGenerateContentRequest({
      contents: [{ parts: [{ text: "x" }] }],
      generationConfig: { responseSchema: { type: "OBJECT", properties } }
    });
    expect(outcome.ok).toBe(false);
  });
});
