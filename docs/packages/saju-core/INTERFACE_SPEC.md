# saju-core Interface Spec (Draft)

## 1) 핵심 입력 모델

```ts
export type Sex = "male" | "female" | "other";

export interface BirthInput {
  birthDate: string; // YYYY-MM-DD (Gregorian)
  birthTime?: string; // HH:mm (optional)
  timezone: string; // e.g. "Asia/Seoul"
  sex: Sex;
}
```

## 2) 계산 결과 모델

```ts
export interface Pillar {
  stem: string; // 천간
  branch: string; // 지지
}

export interface PillarsResult {
  year: Pillar;
  month: Pillar; // 절기 기준
  day: Pillar;
  time?: Pillar; // birthTime 존재 시
}
```

## 3) 리포트 생성 API

```ts
export interface ReportMeta {
  version: "1.0";
  generatedAt: string; // ISO
  locale: "ko" | "en";
  timeKnown: boolean;
  confidence: "high" | "medium" | "low";
}

export interface ReportInput {
  input: BirthInput;
  pillars: PillarsResult;
}

export interface ReportV1 {
  meta: ReportMeta;
  input: BirthInput;
  pillars: PillarsResult;
  overview: {
    summary: string;
    toneGuidelines: string[];
    disclaimers: string[];
  };
  personality: {
    strengths: string[];
    blindSpots: string[];
  };
  career: {
    trends: string[];
    risks: string[];
    actions: string[];
  };
  finance: {
    trends: string[];
    risks: string[];
    actions: string[];
  };
  yearlyOutlook: {
    year: number;
    highlights: string[];
    cautions: string[];
  };
  monthly: {
    goodMonths: string[];
    cautionMonths: string[];
  };
  actionSuggestions: {
    habits: string[];
    planning: string[];
    riskManagement: string[];
  };
  transparency: {
    certain: string[];
    inferred: string[];
    missingDataNotes: string[];
  };
}
```

## 4) 함수 인터페이스

```ts
export function calculatePillars(input: BirthInput): PillarsResult;

export function generateReportV1(input: ReportInput): ReportV1;
```

## 5) 규칙 기반 모드

- AI 없이 동작하는 `rules-only` 모드를 기본 제공
- 규칙 테이블과 설명 텍스트는 분리하여 유지

