# saju-lab

Saju Lab — Interpretation-first Four Pillars analysis for modern decision making.

---

## 🧭 Project Snapshot

```
┌────────────────────────────────────────────┐
│  사주 핵심 경험 = 설명형 리포트 (Report-first) │
│  목표: 오락 + 결정지원(커리어/재무)           │
│  KR-first → EN → KR/EN bilingual             │
└────────────────────────────────────────────┘
```

---

## 🌟 Repository Description (영문 · 기본)

Saju Lab is a Four Pillars (Saju) analysis application that combines traditional East Asian astrology with modern data-driven interpretation.

It provides clear, structured explanation reports designed for both entertainment and practical decision support, targeting the general public.
The app focuses on interpretation-first reports rather than simple fortune messages, helping users understand long-term trends in career, finance, and life direction.

### ✅ Key Features
- 📅 Automated Four Pillars calculation based on standard calendrical rules
- 🧠 AI-assisted interpretation with human-readable explanation reports
- 🎯 Free daily/monthly insights with premium subscription-based detailed reports
- 🌍 Scalable architecture for global (English/Korean) service expansion

Saju Lab is built to bridge traditional destiny analysis and modern decision-making tools.

---

## 🌿 Repository Description (한글 · 보조)

Saju Lab은 전통 명리학(사주)을 기반으로, 현대적인 데이터 해석 방식으로 풀어내는 사주 분석 애플리케이션입니다.

단순 운세 제공이 아닌 해설 중심 리포트를 핵심으로 하여,
일반 사용자가 자신의 성향·직업·금전 흐름을 구조적으로 이해하도록 돕습니다.

### ✅ 주요 특징
- 📅 표준 절기 기준 사주 계산
- 🧠 AI 기반 해설 보조 + 설명형 리포트 제공
- 🎯 무료 콘텐츠 + 구독형 프리미엄 리포트 모델
- 🌍 글로벌 서비스 확장을 고려한 설계

## Documentation
- Product requirements: `docs/PRD.md`
- Agent working guide: `AGENTS.md`
- Development roadmap: `docs/DEVELOPMENT_ROADMAP.md`
- Paid service roadmap: `docs/PAID_SERVICE_ROADMAP.md`
- Paid detailed report PRD: `docs/PAID_REPORT_PRD.md`
- Architecture & goals: `docs/ARCHITECTURE.md`
- Solar term calculation spec: `docs/algorithms/SOLAR_TERM_SPEC.md`
- Report tone guide: `docs/TONE_GUIDE.md`
- saju-core interface spec: `docs/packages/saju-core/INTERFACE_SPEC.md`
- Report schema v1: `docs/REPORT_SCHEMA_V1.md`
- Golden fixtures (draft): `docs/fixtures/GOLDEN_FIXTURES.md`
- i18n key structure: `docs/i18n/KEYS.md`
- MVP UI wireframe: `docs/ui/WIREFRAME.md`
- MVP IA draft: `docs/ui/IA.md`

## Local Development

```bash
npm install
npm run dev --workspace @saju-lab/web
```

Open `http://localhost:5173`.

## MVP Implementation

- `apps/web`: mobile-first report generation UI
- `packages/saju-core`: typed input, fixture-limited deterministic pillar calculation, rules-only report generator
- `docs/PAID_REPORT_PRD.md`: first paid detailed report scope and PDF requirements
- `docs/PAID_SERVICE_ROADMAP.md`: free-to-paid product ladder

Current MVP capabilities:
- Birth date/time input with time-unknown mode
- `Asia/Seoul` four-pillar calculation for the verified fixture range
- Confidence badge and transparency notes
- System/light/dark theme preference with storage fallback
- Login-free local HTML report download for basic reports
- Free-to-paid framing that keeps PDF export for paid detailed reports

Validation commands:

```bash
npm run typecheck
npm test
npm run build
npm audit --audit-level=moderate
```
