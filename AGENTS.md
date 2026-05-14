# AGENTS

This repository is in an early planning and implementation phase. Agents working here should preserve the product direction: report-first Saju analysis, accurate calendrical calculation, careful uncertainty language, and Korean-first UX with future English expansion.

## Project Context

- Product: Saju Lab, a Four Pillars analysis app centered on structured explanation reports.
- Primary users: Korean-speaking general users who want self-understanding and career/finance-oriented decision support.
- Core promise: explain tendencies and uncertainty clearly; do not present deterministic predictions.
- Current branch context: `docs/plan-updates` contains planning docs that should be reconciled with `main` before implementation work expands.

## Source Of Truth

- Product requirements: `docs/PRD.md`
- Architecture direction: `docs/ARCHITECTURE.md`
- Calculation rules: `docs/algorithms/SOLAR_TERM_SPEC.md`
- Core interfaces: `docs/packages/saju-core/INTERFACE_SPEC.md`
- Report schema: `docs/REPORT_SCHEMA_V1.md`
- Tone policy: `docs/TONE_GUIDE.md`
- i18n keys: `docs/i18n/KEYS.md` and `docs/i18n/ko.json`
- UI structure: `docs/ui/IA.md` and `docs/ui/WIREFRAME.md`
- Roadmap: `docs/DEVELOPMENT_ROADMAP.md`

## Working Rules

1. Read the relevant docs before changing code or product behavior.
2. Keep calculation logic, report generation, UI, and translations separate.
3. Prefer deterministic `rules-only` behavior before adding AI-assisted interpretation.
4. Any generated report must include disclaimer and transparency information.
5. Never use deterministic fortune-telling language such as guaranteed success, unavoidable failure, or medical/financial/legal certainty.
6. When source data is missing, especially birth time, lower confidence and explain the impact.
7. Do not mark unverified fixtures as confirmed.
8. Keep Korean copy primary. Add English only through the same i18n structure.
9. Add tests around calendrical boundaries before broad UI polish.
10. Avoid broad refactors while the repository is still stabilizing.

## Implementation Preferences

- Suggested monorepo shape:
  - `apps/web`: user-facing web app
  - `packages/saju-core`: calculation, schema, rules-based report generation
  - `packages/saju-i18n`: translations and formatting helpers
  - `packages/saju-types`: shared TypeScript types
  - `packages/saju-ui`: shared UI components, once duplication appears
- Public APIs should align with `calculatePillars(input)` and `generateReportV1(input)`.
- Tests should cover:
  - 입춘 before/at/after boundary
  - solar term boundary before/at/after
  - birth time known vs unknown
  - report schema snapshots
  - Korean translation key coverage

## Review Checklist

- Does this change improve the report-first experience?
- Are calendrical assumptions documented and tested?
- Are confidence, missing data, and inferred/certain information visible?
- Does the copy follow `docs/TONE_GUIDE.md`?
- Does the change avoid implying professional investment, medical, or legal advice?
- Are Korean i18n keys updated when UI/report text changes?
- Is the MVP still small enough to ship?
