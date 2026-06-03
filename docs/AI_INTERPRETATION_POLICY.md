# AI Interpretation Policy

Saju Lab may add AI-assisted interpretation after the controlled beta, but AI must be an interpretation layer on top of deterministic calculation. It must not replace the `saju-core` calculation engine or weaken uncertainty, privacy, and safety boundaries.

This policy is a prerequisite for any LLM API implementation. It does not configure an LLM provider, add an API key, open checkout, add account storage, or introduce server-side report storage.

## Product Role

AI is allowed to:
- expand rules-only report language into clearer Korean explanations.
- make the report feel more personal and conversational.
- help users compare themes, risks, and action suggestions already present in the rules-only report.
- improve readability for users who do not know Saju terminology.

AI is not allowed to:
- calculate pillars, solar terms, date boundaries, or confidence.
- override `saju-core` output.
- produce deterministic predictions, guaranteed outcomes, fear-based claims, or professional advice.
- provide investment, medical, legal, diagnosis, treatment, or crisis guidance.
- act as open-ended chat in the first AI pass.

## Disclosure

AI-assisted sections must be visibly labeled in Korean.

Required label:
- `AI 보조 해석`

Required user-facing meaning:
- the base calculation and rules-only report come from deterministic logic.
- AI helps with explanation and wording only.
- AI text may be imperfect and should be read as informational/entertainment-oriented interpretation.
- users should not treat AI output as professional investment, medical, or legal advice.

## Privacy And Retention

The first AI pass must follow minimum-necessary data sharing.

Do not transmit to the LLM provider:
- raw birth date.
- raw birth time.
- sex.
- name, email, phone number, or other direct PII.
- free-form user messages.
- client-supplied prompt text.
- client-supplied report summaries treated as trusted data.

Do not store server-side by default:
- birth input.
- calculated pillars.
- rules-only report body.
- AI output.
- PDF-ready HTML.

Any server-side retention requires a separate data-retention decision and policy update before implementation.

## Prompt Control

The client must not send arbitrary prompts to the LLM route.

The server-side route should:
1. receive only structured, validated input needed to regenerate the report.
2. run `saju-core` statelessly on the server.
3. build a sanitized prompt payload from calculated pillars, rules-only report sections, confidence, missing-data notes, transparency notes, and disclaimers.
4. exclude raw birth date, raw birth time, sex, and direct PII before the LLM provider call.
5. apply output safety checks before returning AI text to the UI.

## Fallback

Rules-only report generation must remain available.

Fallback is required when:
- no AI API key is configured.
- the AI request times out.
- the AI provider returns an error.
- the sanitized prompt contract cannot be satisfied.
- the AI output violates safety checks.
- the user or operator disables AI.

The fallback state should keep the base report readable and explain that AI-assisted interpretation is unavailable.

## Safety Review

AI output must be rejected or regenerated if it contains:
- guaranteed success or guaranteed failure.
- guaranteed profit or loss.
- investment recommendations.
- medical diagnosis or treatment.
- legal certainty.
- fear-based pressure.
- claims that contradict missing-data or confidence notes.
- claims that imply unsupported broad date coverage.

## Phase 6A Exit Criteria

- AI disclosure, privacy, prompt, fallback, and safety rules are documented.
- Prompt contract excludes raw birth input and direct PII.
- Guard tests protect AI-disabled default, no client API key exposure, no client-controlled prompts, and required fallback.
- No LLM API key, provider SDK, network call, checkout, login, account storage, server report storage, analytics, subscription, or PDF library is introduced.
