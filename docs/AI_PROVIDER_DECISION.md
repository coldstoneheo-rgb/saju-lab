# AI Provider Decision Draft

This document records the initial provider decision criteria for Phase 6A. It does not select or configure a provider yet.

## Candidate Providers

| Provider | Candidate Use | Notes |
| --- | --- | --- |
| OpenAI | First prototype for structured AI-assisted report expansion | Strong structured-output and prompt-control fit. |
| Google Gemini | Alternative prototype or comparison provider | Useful if Korean output quality or cost profile is better. |
| Anthropic Claude | Alternative for long-form Korean tone review | Useful for report-style prose, but provider choice should consider cost and latency. |

## Selection Criteria

- Korean explanation quality.
- structured output reliability.
- cost per generated report.
- latency for mobile users.
- provider privacy terms and data-retention controls.
- support for disabling training or retention where available.
- ease of server-side environment variable configuration.
- ability to enforce timeout and fallback.

## Required Before Implementation

- choose one provider for Phase 6B prototype.
- define model name and maximum token budget.
- define timeout and retry behavior.
- define no-storage or data-retention expectation.
- document whether any provider-side logging or retention remains.
- confirm raw birth date, birth time, sex, and direct PII are excluded from the provider payload.

## Current Recommendation

Start Phase 6B with one provider only. Prefer the provider that best supports structured output, low-latency Korean generation, clear privacy settings, and simple server-side key management.

Do not add multiple provider SDKs in the first prototype.
