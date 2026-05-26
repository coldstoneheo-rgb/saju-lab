# Golden Fixtures (Draft)

## 목적
- 절기 기준 사주 계산의 정확성을 검증하기 위한 기준 데이터셋

## 선정 기준
- 공개적으로 검증 가능한 기준표/천문 데이터 기반
- 다양한 절기 경계 날짜 포함
- 출생시간 유/무 케이스 포함

## 구현된 Phase 2A 픽스처
- 1990-01-01 10:30 Asia/Seoul
- 2000-02-04 12:00 Asia/Seoul (입춘 이전)
- 2010-06-21 23:59 Asia/Seoul (망종 월 경계 이후)
- 2015-12-22 00:30 Asia/Seoul (대설 월 경계 이후)
- 2024-02-04 17:27 Asia/Seoul (입춘 동시각)

## 구현된 Phase 2D 경계 회귀 테스트
- 2024-02-04 17:26 Asia/Seoul: 입춘 1분 전, 이전 연주/월주 유지
- 2024-02-04 17:27 Asia/Seoul: 입춘 동시각, 새 연주/월주 적용
- 2024-02-04 17:28 Asia/Seoul: 입춘 1분 후, 새 연주/월주 유지
- 2024-03-05 11:22 Asia/Seoul: 경칩 1분 전, 이전 월주 유지
- 2024-03-05 11:23 Asia/Seoul: 경칩 동시각, 새 월주 적용
- 2024-03-05 11:24 Asia/Seoul: 경칩 1분 후, 새 월주 유지
- 2010-06-21 23:00 Asia/Seoul: 현재 MVP 정책상 다음 civil date 일주로 넘기지 않고 입력 날짜의 일주 유지

## 출처 상태
- 현재 내장 절기표는 fixture와 경계 테스트에 필요한 제한 범위만 포함한다.
- 2024년 확장 경계와 2025년 상한 경계는 Phase 4U에서 KASI 원자료 기준으로 맞춘다.
- 공개 베타 범위 확대 또는 넓은 날짜 지원 전에는 fixture-limited 과거 행과 새로 추가할 절기표를 `docs/SOLAR_TERM_SOURCE_AUDIT_2026-05-25.md`의 절차에 따라 다시 대조해야 한다.
- Phase 4V부터 과거 행 재검증은 KASI 웹 이미지 OCR이 아니라 data.go.kr `한국천문연구원_특일 정보` API 수집 결과를 기준으로 진행한다. 해당 API는 2000-2016 fixture를 생성했으며, 1989-1999는 정상 응답이지만 레코드가 없어 별도 승인 출처가 필요하다.

## 검증 절차
- 표준 절기표 및 외부 계산기 비교
- 일주/월주/연주 확인
- time 없는 입력에 대한 모드 확인

## 기록 템플릿(샘플)
- 입력: YYYY-MM-DD HH:mm TZ
- 기준 절기 데이터 출처 및 현재 검증 상태:
- 계산 결과(연/월/일/시주):
- 외부 검증 결과:
- 차이 발생 시 원인 추적:

## 확정 기록(Phase 2A)

> 참고: Phase 2A는 MVP 계산 코어를 테스트 가능하게 만들기 위한 제한 범위 구현이다.
> 절기 테이블은 아래 fixture 및 경계 테스트에 필요한 연도부터 내장하며, 전체 연도 범위는 이후 단계에서 확장한다.
> Phase 2D는 기존 fixture 범위 안에서 before/at/after 경계 회귀 테스트와 23:00 자시 정책 테스트를 추가했다.
> Phase 2E는 2024년 월주 변경 절기의 fixture matrix를 확장했다. Phase 4U는 KASI 2024/2025 역서 기준으로 내장 2024 matrix와 2025 상한 경계의 불일치 행을 맞췄다.

### Fixture 1
- 입력: 1990-01-01 10:30 Asia/Seoul
- 기준 절기 데이터 출처 및 현재 검증 상태: fixture-limited; KASI 원자료 재검증 필요
- 계산 결과(연/월/일/시주): 기사 / 병자 / 병인 / 계사
- 외부 검증 결과: 1990-01-01은 기사년 병자월 병인일로 공개 만세력 자료와 대조
- 차이 발생 시 원인 추적: 해당 없음

### Fixture 2
- 입력: 2000-02-04 12:00 Asia/Seoul (입춘 이전)
- 기준 절기 데이터 출처 및 현재 검증 상태: KASI revalidated for this row
- 계산 결과(연/월/일/시주): 기묘 / 정축 / 임진 / 병오
- 외부 검증 결과: 내장 입춘 경계 기준으로 테스트 고정
- 차이 발생 시 원인 추적: 전체 KASI 테이블 확장 시 재검증

### Fixture 3
- 입력: 2010-06-21 23:59 Asia/Seoul (하지 근접)
- 기준 절기 데이터 출처 및 현재 검증 상태: KASI revalidated for this row
- 계산 결과(연/월/일/시주): 경인 / 임오 / 임인 / 경자
- 외부 검증 결과: 망종 이후, 소서 이전 월 경계로 테스트 고정
- 차이 발생 시 원인 추적: 자시를 다음 날로 넘기는 유파는 별도 옵션으로 분리 필요

### Fixture 4
- 입력: 2015-12-22 00:30 Asia/Seoul (동지 근접)
- 기준 절기 데이터 출처 및 현재 검증 상태: KASI revalidated for this row
- 계산 결과(연/월/일/시주): 을미 / 무자 / 임신 / 경자
- 외부 검증 결과: 동지는 월주 경계가 아니며 대설 이후 자월로 테스트 고정
- 차이 발생 시 원인 추적: 해당 없음

### Fixture 5
- 입력: 2024-02-04 17:27 Asia/Seoul (입춘 경계)
- 기준 절기 데이터 출처 및 현재 검증 상태: KASI revalidated for this row
- 계산 결과(연/월/일/시주): 갑진 / 병인 / 무술 / 신유
- 외부 검증 결과: 2024-02-04는 무술일로 공개 만세력 자료와 대조, 입춘 동시각은 새 절기 적용
- 차이 발생 시 원인 추적: 해당 없음

## 확장 기록(Phase 2E)

> 참고: Phase 2E는 2024년 안에서 월주가 바뀌는 절기 경계를 넓게 고정하는 테스트 단계다.
> 각 경계는 1분 전, 경계 동시각, 1분 후를 테스트하며, 경계일에 출생시간이 없으면 월주를 임의 추정하지 않고 시간 입력 필요 에러를 유지한다.

| 절기 | 절입 시각(KST) | 경계 직전 월주 | 경계 동시각/직후 월주 | 검증 상태 |
| --- | --- | --- | --- | --- |
| 청명 | 2024-04-04 16:02 | 정묘 | 무진 | KASI revalidated for this row |
| 입하 | 2024-05-05 09:10 | 무진 | 기사 | KASI revalidated for this row |
| 망종 | 2024-06-05 13:10 | 기사 | 경오 | KASI revalidated for this row |
| 소서 | 2024-07-06 23:20 | 경오 | 신미 | KASI revalidated for this row |
| 입추 | 2024-08-07 09:09 | 신미 | 임신 | KASI revalidated for this row |
| 백로 | 2024-09-07 12:11 | 임신 | 계유 | KASI revalidated for this row |
| 한로 | 2024-10-08 04:00 | 계유 | 갑술 | KASI revalidated for this row |
| 입동 | 2024-11-07 07:20 | 갑술 | 을해 | KASI revalidated for this row |
| 대설 | 2024-12-07 00:17 | 을해 | 병자 | KASI revalidated for this row |

### Phase 2E 출처 메모
- Uncle Tools 2024년 24절기: https://uncle.tools/manse/solar-terms/2024
- Uncle Tools 2025년 24절기: https://uncle.tools/manse/solar-terms/2025
- 위 페이지는 NASA DE441 및 한국천문연구원 특일 정보 기반 계산이라고 밝힌다.
- 2025-01-05 11:33 소한과 2025-02-03 23:10 입춘은 2024년 12월/2025년 1월 경계 상한으로만 내장했다.

### Phase 4T KASI 대조 메모
- KASI 2024/2025 역서 PDF와 현재 내장 2024 경계 matrix 및 2025 상한 경계를 대조한 결과는 `docs/KASI_SOLAR_TERM_REVALIDATION_2026-05-25.md`에 기록한다.
- Phase 4U는 KASI 원문 기준으로 2024 경칩, 2024 망종, 2024 한로, 2025 소한의 1분 차이를 계산 데이터와 경계 테스트에 반영한다.
- 이 정리는 내장 2024 matrix와 2025 상한 경계에 한정되며, 넓은 연도 범위 지원을 의미하지 않는다.

### Phase 4V 공공데이터 API 수집 메모

- `docs/PUBLIC_DATA_SOLAR_TERM_COLLECTION.md`는 data.go.kr `get24DivisionsInfo` 수집 절차와 로컬 fixture 생성 방식을 기록한다.
- `docs/fixtures/kasi-special-days-solar-terms-2000-2016.json`은 2000-2016 API 제공 범위 안의 embedded comparison 일치를 기록한다.
- 1990 fixture는 API 미제공 범위에 있어 `fixture-limited; KASI 원자료 재검증 필요`로 유지한다.
