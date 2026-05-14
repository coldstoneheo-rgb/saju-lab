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

## KR 기본 번역 파일 구조
- 위치: `docs/i18n/ko.json`
- 형식: key-value JSON
- 예: `"report.overview.title": "개요"`
