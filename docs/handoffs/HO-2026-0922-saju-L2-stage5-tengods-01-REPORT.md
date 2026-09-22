# HO-2026-0922-saju-L2-stage5-tengods-01 — REPORT

- 발주서: life-coordinator `handoffs/HO-2026-0922-saju-L2-stage5-tengods-01.md` (LC `9a7b140`). 착수 시점 main `a1b9882`. 브랜치 `feat/l2-stage5-tengods`, PR 1개.
- §6 3건 LC 수용: 학파 2개 이름(`yeonhae`/`japyeong`) · 십신 배정 규칙 ⓐ~ⓔ 고정 · 응답 형태와 `pending`/`confirmed` 파서 규칙.

## 구현
| 파일 | 내용 |
| --- | --- |
| `docs/rules/HIDDEN-STEMS.md` (신규, 정본) | 표 1 `yeonhae`(『연해자평』 월률분야 일수, 발주서 §2 12행 그대로) · 표 2 `japyeong`(『자평진전』 인원용사, 일수 없음) · 갈림 5칸 대안 값·출처·십신 영향 표 |
| `packages/saju-core/src/l2/hidden-stems.data.ts` (신규) | 두 학파 테이블, `hiddenStemsOf`, `hiddenStemList`(여기→중기→정기). 가중 산식 없음 |
| `l2/ten-gods.ts` (신규) | `tenGodOf(dayStem, other)`(오행 5관계 × 음양 동이), `tenGodsOfChart(pillars, school)`, 10코드·한글·한자 라벨 |
| `l2/hidden-stems.test.ts` (신규) | **md 직접 파싱 ↔ ts 동일성**(학파별 12지), md에만 있는 학파 검출, 일수 합 30, 갈림 칸 실측, **100조합 전수 표**, 코드 10개 각 1회, 골든 1990 명식·시각 미상·학파 옵션 |
| `docs/golden/GOLDEN-TENGODS.md` (신규) + `l2/golden-tengods.test.ts` | 골든 11건 십신표(코어 생성, 전부 `pending`, 출처 「코어 산출 2026-09-22 (yeonhae), 검산 대기」). 파서는 출처 빈칸·상태값 검사 + 코어 현재 산출과 대조 |
| `types.ts` · `saju-pillars-v1.ts` | `options.include?: ("hiddenStems"\|"tenGods")[]`, `options.hiddenStemSchool?`. 응답 `hiddenStems`·`tenGods` — include 요청분만 |
| 웹 `main.tsx` · `styles.css` | 기둥 카드에 십신 1줄(천간 십신 · 지지 정기 십신, 일주는 「일간 · …」) + 접힘 「지장간 보기」 표(여기·중기·정기 × 4지, 천간·십신·일수). 통변 없음 |
| `docs/SAJU_PILLARS_API_V1.md` · `SOLAR_TERM_SPEC.md` | 「L2 블록」 절 + 십신 코드표(한자·한글·로마자·정의) |

## C1 — md ↔ ts 동일성 + 학파 옵션
`hidden-stems.test.ts`: `HIDDEN-STEMS.md`의 「## 표 N — `school`」 절을 열 이름으로 파싱해 `HIDDEN_STEM_TABLES[school]`와 12지 전부 `toEqual`; md에 코드가 모르는 학파가 있으면 실패. `yeonhae` 일수 합 = 30/지. 갈림 실측: 亥 여기 戊(yeonhae) vs null(japyeong), 午 중기 己 유지, 子 `[im, gye]` vs `[gye]`, 寅·申은 두 학파 모두 戊(己 대안은 md 기록만).

## C2 — 100조합
규칙 ⓐ~ⓔ에서 만든 10×10 표(甲 행 = 발주서 예시)와 `tenGodOf` 전수 일치, 일간마다 10코드 각 1회.

## C3 — 골든 십신표
`GOLDEN-TENGODS.md` 11행 생성(예: g-1990-01-01-1030 일간 丙 — 연간 己 상관·연지 巳 비견·월간 丙 비견·월지 子 정관·일지 寅 편인(戊식신·丙비견·甲편인)·시간 癸 정관·시지 巳 비견). 전부 `pending` → LC 페르소나 검산 뒤 `confirmed`로 기입하면 값 고정(코어 변경 시 실패).

## C4 — 라이브(keyless, 머지·배포 후 실측)
`POST /api/app/saju-pillars {"birthDate":"1990-01-01","birthTime":"10:30","calendar":"solar","sex":"other","options":{"include":["tenGods","hiddenStems"]}}` → `tenGods.dayMaster byeong`, `tenGods.year.stem sanggwan`, `hiddenStems.day {mu7, byeong7, gap16}`. include 없이 → `tenGods`·`hiddenStems` 키 없음(4단계 응답과 동일). 실측 결과는 REPORT 송신 시 기재.

## C5 — 웹 스크린샷 (`docs/evidence/2026-09-22-stage5-tengods/`)
| 파일 | 상태 |
| --- | --- |
| `1-tengod-labels.jpg` | 기본 명식(1990-01-01 10:30) 카드 4장에 「상관 · 비견」「비견 · 정관」「일간 · 편인」「정관 · 비견」 + 접힘 「지장간 보기」 |
| `2-hidden-stems-open.jpg` | 접힘 열림: 연지 巳 무 식신(7일)·경 편재(7일)·병 비견(16일) … 시지 巳 |

## C6 — 게이트
`npm run verify` exit 0 — test **285**(api 17 + saju-core 231 + web 37). include 없는 응답의 기존 필드 불변(게이트·골든·3·4단계 테스트 통과). baby 소비 필드 불변(미소비 블록).

## 하지 않은 것
합충(6단계) · 대운(7) · 강약·용신(8) · 지장간 가중 · 격국 · 신살 · 삼명통회 일수 학파(요청 시).
