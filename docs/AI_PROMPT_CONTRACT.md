# AI Prompt Contract

This contract defines the first safe payload shape for AI-assisted interpretation. It is intentionally narrow: AI expands interpretation language only after `saju-core` has produced deterministic calculation and rules-only report structure.

No LLM API call is implemented by this document.

## Source Of Truth

The prompt builder must use:
- `saju-core` calculated pillars.
- rules-only `ReportV1` or `PaidReportV1` section summaries.
- confidence level.
- missing-data notes.
- transparency notes after removing any input-echo strings.
- disclaimers.

The prompt builder must not trust:
- arbitrary client prompts.
- client-supplied report summaries.
- client-supplied AI instructions.
- user-provided free-form chat.

## Sanitized Payload

Allowed fields:

| Field | Purpose |
| --- | --- |
| `pillars` | Provide calculated year, month, day, and optional time pillar labels. |
| `confidence` | Preserve uncertainty language. |
| `timeKnown` | Explain whether time-based interpretation is limited. |
| `reportSections` | Provide rules-only section summaries and action suggestions. |
| `missingDataNotes` | Prevent over-reading missing birth-time cases. |
| `transparencyNotes` | Separate certain calculation facts from inferred interpretation after removing input-echo strings such as raw birth date, raw birth time, sex, or raw timezone. |
| `disclaimers` | Keep informational and non-professional-advice framing. |
| `locale` | Keep Korean-first copy generation. |

Forbidden fields:
- raw birth date.
- raw birth time.
- sex.
- timezone as raw user input.
- name.
- email.
- phone number.
- direct PII.
- payment identifiers.
- support messages.
- local HTML or PDF-ready HTML body.
- arbitrary client prompt text.
- client-supplied report summary treated as trusted data.

Generated report fields are not automatically safe. If `ReportV1` or `PaidReportV1` transparency text echoes raw user input, such as `입력된 생년월일: ...`, the prompt projection must remove that entry before constructing the provider payload.

## Server Flow

1. Validate structured input.
2. Generate the rules-only report on the server with `saju-core`.
3. Create a sanitized prompt payload from the generated report.
4. Scrub generated strings, including transparency notes, so input echoes and forbidden fields are removed.
5. Assert that forbidden fields are absent.
6. Build the provider prompt from a fixed system instruction and the sanitized payload.
7. Call the LLM provider only if an API key is configured server-side.
8. Validate AI output against safety rules.
9. Return either AI-assisted interpretation or a rules-only fallback state.

## Output Shape

The first AI output should be structured, not free-form chat.

Suggested shape:

```ts
interface AiInterpretationV1 {
  label: "AI 보조 해석";
  generatedAt: string;
  source: "rules-only-report";
  sections: Array<{
    id: "overview" | "personality" | "career" | "finance" | "yearly" | "monthly" | "action" | "transparency";
    title: string;
    body: string;
    sourceRefs: string[];
  }>;
  safetyNotes: string[];
  fallbackUsed: boolean;
}
```

## Required Prompt Instructions

The provider prompt must say:
- do not calculate pillars or dates.
- do not infer unavailable birth-time details.
- do not provide medical, legal, investment, or crisis advice.
- do not make deterministic predictions.
- use clear Korean.
- explain uncertainty plainly.
- preserve the user-facing disclaimer.
- keep AI output separate from deterministic calculation facts.

## Test Requirements

Phase 6B implementation must add tests for:
- forbidden raw birth fields are omitted.
- generated transparency notes that echo raw input are scrubbed.
- prompt is generated server-side from `saju-core` output.
- client prompt text is ignored or rejected.
- API key is not bundled into browser code.
- fallback is returned when AI is disabled or provider output fails safety checks.
- output contains `AI 보조 해석` disclosure.
