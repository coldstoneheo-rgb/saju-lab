# Beta Manual QA Results

Date: 2026-05-17

## Metadata

- Branch: `codex/phase4f-beta-qa-evidence`
- Base commit at QA start: `c8100f9`
- Dev server URL: `http://127.0.0.1:5173`
- Node: `v22.18.0`
- npm: `10.9.3`
- Browser surface: Codex in-app browser
- Viewports:
  - mobile narrow: `360 x 780`
  - mobile wide: `430 x 932`
  - desktop: `1280 x 800`

## Summary

Manual browser QA covered the current MVP report flow, time-unknown behavior, policy draft routes, paid readiness copy, and basic responsive overflow checks.

Result:
- PASS: known-time report rendering.
- PASS: time-unknown report rendering and lower-confidence state.
- PASS: policy draft routes and no placeholder support exposure.
- PASS: paid readiness copy remains pre-checkout and metadata-only.
- PASS: no horizontal overflow detected in tested mobile and desktop viewports.
- PARTIAL: boundary-date error UI could not be fully exercised through the in-app browser because the native `type=date` field did not accept automation-set values in this environment. The underlying core boundary behavior is covered by tests, and the friendly error mapping was code-inspected.
- PARTIAL: free HTML export button was present, but the Codex in-app browser does not support download events, so local file-open behavior still needs a human-controlled browser pass.

This QA pass does not mark the app as public-beta ready. Owner/business gates and KASI source revalidation remain open.

## Browser QA Results

| Flow | Viewport | Input | Expected | Actual | Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| Known-time report | `360 x 780` | `1990-01-01`, `10:30`, `Asia/Seoul` | Full report renders with confidence badge and four-pillar summary | Report rendered with `신뢰도 보통`, section navigation, disclaimer, and four-pillar summary | PASS | DOM text contained `1990.01.01 기준 분석`; width `345/345` |
| Mobile overflow | `360 x 780` | default report | No horizontal overflow | `scrollWidth=345`, `clientWidth=345` | PASS | Browser layout metrics |
| Local/privacy note | `360 x 780` | default report | Timezone and local processing note visible | `Asia/Seoul` and no server sync/account storage copy visible | PASS | DOM text check |
| Safety placement | `360 x 780` | default report | Disclaimer appears before detailed sections | Disclaimer appeared before `전체 요약` | PASS | DOM order check |
| Section navigation | `360 x 780` | default report | Overview, career, finance, monthly, paid preview, transparency links visible | All expected section links were present | PASS | DOM text check |
| Time unknown | `360 x 780` | time unknown enabled, `1990-01-01` | Report generates, confidence lowers, time pillar is unknown | Report showed `신뢰도 낮음`, `출생시간 미상`, and `시주` as `미상` | PASS | Browser interaction |
| Time unknown overflow | `360 x 780` | time unknown report | No horizontal overflow | `scrollWidth=345`, `clientWidth=345` | PASS | Browser layout metrics |
| Boundary-date error | `360 x 780` | attempted `2024-02-04` without time | Friendly Korean boundary-date error | Could not complete through browser automation because native date input value did not change from the default | PARTIAL | Automation limitation; see Boundary-Date Follow-Up |
| Mobile wide overflow | `430 x 932` | default report | No horizontal overflow | `scrollWidth=415`, `clientWidth=415` | PASS | Browser layout metrics |
| Free HTML export | `1280 x 800` | default report, save button | Downloaded HTML opens locally with safe filename and required notices | Save button was present, but the in-app browser reported that downloads are not supported | PARTIAL | Existing export tests cover filename and HTML content; human-controlled browser download still required |
| Privacy policy route | `430 x 932` | `/policies/privacy` | Route reachable, draft/pre-checkout status visible, no placeholder support | Route was reachable, draft status visible, no `support@example.com` | PASS | DOM text check |
| Refund/support policy route | `430 x 932` | `/policies/refund-support` | Route reachable, draft/pre-checkout status visible, no placeholder support | Route was reachable, draft status visible, no `support@example.com` | PASS | DOM text check |
| Usage caution policy route | `430 x 932` | `/policies/usage-caution` | Route reachable, draft/pre-checkout status visible, no placeholder support | Route was reachable, draft status visible, no `support@example.com` | PASS | DOM text check |
| Desktop report | `1280 x 800` | default report | Report renders without horizontal overflow | Report rendered; `scrollWidth=1265`, `clientWidth=1265` | PASS | Browser layout metrics |
| Paid readiness copy | `1280 x 800` | default report | Copy is preview/pre-checkout, not live purchase | Copy included preparation language and did not include live purchase CTA text | PASS | DOM text check |
| Paid data boundary | `1280 x 800` | default report | Report data is not provider/server payload | Copy stated birth information and report body are not sent to the payment provider or stored server-side | PASS | DOM text check |
| Console errors | `1280 x 800` | full QA pass | No browser console errors | No captured browser console errors | PASS | Browser console log check |

## Boundary-Date Follow-Up

The runbook asks for `2024-02-04` without birth time. During automated browser QA, the in-app browser could focus the native date field, but `fill`, keyboard typing, and native date-string typing did not update the `type=date` value. The field remained at the default `1990-01-01`, so the browser step could not reach the boundary-date error state.

Supporting evidence already present in the codebase:
- `packages/saju-core/src/index.test.ts` rejects date-only inputs on `2024-02-04` and expanded 2024 solar-term boundary dates.
- `apps/web/src/main.tsx` maps `birthTime is required` errors to the friendly Korean message: `절기 경계일에는 출생시간이 필요합니다.`

Follow-up:
- Re-run this specific manual step in a human-controlled browser before beta distribution.
- Do not mark the boundary-date UI item complete in the beta checklist until that manual step is confirmed.

## Free HTML Export Follow-Up

The free report save button was present with the expected accessible name. The Codex in-app browser reported that downloads are not supported, so this pass could not open the downloaded HTML file locally.

Supporting evidence already present in the codebase:
- `apps/web/src/export-html.test.ts` covers required paid export HTML content.
- `apps/web/src/report-filenames.test.ts` protects personal-data-safe report filenames.

Follow-up:
- Re-run the free HTML export download and local-open check in a human-controlled browser before beta distribution.
- Do not mark the HTML export manual QA item complete until the downloaded file is opened and inspected.

## Objective Fixes

None applied in this pass.

No broken route, overflow, placeholder support exposure, live checkout language, account/server-storage claim, deterministic prediction claim, or browser console error was found in the tested flows.

## Owner Decisions Still Required

- Choose a real support email or support form before live checkout.
- Choose the final payment provider after settlement, receipt, refund, and support needs are clear.
- Final legal/user-facing policy review before checkout opens.
- Explicitly approve any future account, saved report storage, or subscription scope.

## External Source Gates Still Required

- Revalidate embedded solar-term times against KASI source data before broad public beta or wider date-range support.
- Keep fixture-limited date coverage visible as an MVP limitation until broader source-backed coverage exists.

## Commands

Executed during this QA pass:

```powershell
npm.cmd --workspace @saju-lab/web test
npm.cmd run verify
```

Final verification after this evidence file, roadmap, and checklist updates:

```powershell
npm.cmd run verify
```

Result: PASS.
