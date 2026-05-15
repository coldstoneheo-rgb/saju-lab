# i18n Key Structure (Draft)

## 원칙
- 한국어 우선(KR) → 영어(EN) 확장
- Report 텍스트는 key 기반으로 관리
- 값은 UI/리포트 공용으로 재사용 가능

## 키 네임 규칙
- `scope.section.item`
- 예: `report.overview.title`, `report.disclaimer.finance`

## 예시 키 목록

### Common
- `app.title`
- `app.subtitle`

### Report Overview
- `report.overview.title`
- `report.overview.summary`
- `report.overview.disclaimer`

### Personality
- `report.personality.title`
- `report.personality.strengths`
- `report.personality.blindSpots`

### Career & Finance
- `report.career.title`
- `report.career.trends`
- `report.career.risks`
- `report.career.actions`
- `report.finance.title`
- `report.finance.trends`
- `report.finance.risks`
- `report.finance.actions`

### Outlook
- `report.yearly.title`
- `report.yearly.highlights`
- `report.yearly.cautions`
- `report.monthly.title`
- `report.monthly.goodMonths`
- `report.monthly.cautionMonths`

### Actions
- `report.actions.title`
- `report.actions.habits`
- `report.actions.planning`
- `report.actions.riskManagement`
- `report.actions.habits.detail`
- `report.actions.planning.detail`
- `report.actions.riskManagement.detail`

### Transparency
- `report.transparency.title`
- `report.transparency.certain`
- `report.transparency.inferred`
- `report.transparency.missingData`
- `report.transparency.certain.detail`
- `report.transparency.inferred.detail`
- `report.transparency.missingData.detail`

### Rules-Only Report Copy
- `report.rules.overview.*`
- `report.rules.personality.*`
- `report.rules.career.*`
- `report.rules.finance.*`
- `report.rules.yearly.*`
- `report.rules.actions.*`
- `report.rules.transparency.*`
- `report.rules.tone.{stem}.label`
- `report.rules.tone.{stem}.summary`
- `report.rules.tone.{stem}.strength`
- `report.rules.tone.{stem}.blindSpot`
- `report.rules.tone.{stem}.career`
- `report.rules.tone.{stem}.finance`
- `report.rules.tone.{stem}.action`
- `report.rules.month.cautionNote`
- `report.rules.month.{branch}.goodMonths`
- `report.rules.month.{branch}.cautionMonths`
- `report.rules.month.{branch}.note`

### Terminology
- `report.terms.yearPillar.label`
- `report.terms.yearPillar.short`
- `report.terms.yearPillar.description`
- `report.terms.monthPillar.label`
- `report.terms.monthPillar.short`
- `report.terms.monthPillar.description`
- `report.terms.dayPillar.label`
- `report.terms.dayPillar.short`
- `report.terms.dayPillar.description`
- `report.terms.timePillar.label`
- `report.terms.timePillar.short`
- `report.terms.timePillar.description`
- `report.terms.heavenlyStem.label`
- `report.terms.heavenlyStem.short`
- `report.terms.heavenlyStem.description`
- `report.terms.earthlyBranch.label`
- `report.terms.earthlyBranch.short`
- `report.terms.earthlyBranch.description`
- `report.terms.solarTerm.label`
- `report.terms.solarTerm.short`
- `report.terms.solarTerm.description`

The runtime source for rule copy and terminology is `packages/saju-core/src/report-copy.ts`.
`docs/i18n/ko.json` mirrors these keys so report copy can be audited before full app-level i18n extraction.

## KR 기본 번역 파일 구조
- 위치: `docs/i18n/ko.json`
- 형식: key-value JSON
- 예: `"report.overview.title": "개요"`
