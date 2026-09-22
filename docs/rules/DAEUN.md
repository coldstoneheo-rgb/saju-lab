# 대운(大運) 산식 — 정본 (7단계 v1)

`packages/saju-core/src/l2/daeun.ts`의 상수(순역행 4조합·12절 목록)는 이 표에서 생성된 것과 같아야 하며 `l2/daeun.test.ts`가 md를 직접 파싱해 동일성을 강제한다. 코어는 **분 단위 소수**를 계산해 그대로 돌려주고, 반올림·버림(「대운수 N」)은 관점·UI가 고른다(회의 2026-09-22 §3 7-1 · §4 A2-2 · DEC F10). 세운·월운은 v1 범위 밖.

## 표 1 — `direction` 순역행 4조합

| 연간 음양 | 성별 | 순역 |
| --- | --- | --- |
| yang | male | forward |
| yang | female | backward |
| yin | male | backward |
| yin | female | forward |

- 연간 양 = 甲丙戊庚壬(`gap byeong mu gyeong im`), 음 = 乙丁己辛癸.
- `sex: "other"` = 순역 **두 벌 모두** 반환(`forward`·`backward`), 기본 표시 없음 — 어느 쪽을 보일지는 관점층이 정한다.

## 표 2 — `terms` 12절(節) — 절입 거리에 쓰는 절만

| 순서 | 절 | 코드 | 월지 |
| --- | --- | --- | --- |
| 1 | 입춘 | ipchun | in |
| 2 | 경칩 | gyeongchip | myo |
| 3 | 청명 | cheongmyeong | jin |
| 4 | 입하 | ipha | sa |
| 5 | 망종 | mangjong | o |
| 6 | 소서 | soseo | mi |
| 7 | 입추 | ipchu | sin |
| 8 | 백로 | baengno | yu |
| 9 | 한로 | hallo | sul |
| 10 | 입동 | ipdong | hae |
| 11 | 대설 | daeseol | ja |
| 12 | 소한 | sohan | chuk |

중기(우수·춘분·곡우·소만·하지·대서·처서·추분·상강·소설·동지·대한)는 쓰지 않는다. 시각 = KASI 24기 입기 시각 표(`docs/fixtures/kasi-24-solar-terms-1920-2100_20260902.txt`, KST 분). 코어의 월 경계 표 `solar-terms.data.ts`가 곧 이 12절이다.

## 산식

- **출생 시각** = 정규화 KST 벽시계(2단계 `resolution`과 같은 시각. UTC+8:30·서머타임 이력 반영, 진태양시 보정 미적용 — 절입 거리에 진태양시를 쓰는 것은 v1.1 관점 옵션). 야자시 정책은 일주에만 영향, 대운 거리엔 무관.
- **시각 미상** = 정오(12:00) 대체 + `precision: "time-unknown"`(±12h = ±0.17년). 시각 있음 = `precision: "exact"`.
- **거리 D(분, 정수)** = 순행: (출생보다 **엄격히 뒤**인 첫 절 시각) − 출생 / 역행: 출생 − (출생 **이하**인 마지막 절 시각). 출생 = 절입 동시각이면 순행 D = 다음 절까지(≈30일), 역행 D = 0.
- **`startAgeExact`(년, 소수)** = D ÷ (3 × 1440). 3일 = 1년.
- **`startsAt`** = 출생일시 + `startAgeExact` × 365.2425일 → KST 날짜(YYYY-MM-DD). **`years`·`months`** = `startAgeExact`를 년·개월로 분해(개월은 버림 — 데이터 필드일 뿐 반올림 규칙이 아니다).
- **대운 간지** = 월주의 60갑자 인덱스에서 순행 +1씩, 역행 −1씩, **10주**(index 0~9). 주 i의 `startAge = startAgeExact + 10·i`, `startsAt` 같은 식, `endsAt` = 다음 주 `startsAt` − 1일.
- **십신 동봉** = 각 주 천간의 십신 + 지지 정기(지장간 표, `hiddenStemSchool` 기본 `yeonhae`)의 십신 — 일간 기준, 5단계 `tenGodOf`. 지장간 전부는 동봉하지 않는다.
- **범위** = 절기표 1920-01-06 23:41 ~ 2100-12-07 10:42. 주의 `startsAt`이 표 끝을 넘으면 그 주부터 잘라 반환 + `truncated: true`(검증된 범위 밖은 주장하지 않는다). 절단되면 **남은 마지막 주의 `endsAt`은 표 끝 날짜(2100-12-07)로 클램프**한다 — 그 주만 「다음 주 시작 − 1일」 규칙의 예외(D1). 출생이 표 끝에 가까워 첫 주부터 넘으면 `periods: []` + `truncated: true`. 거리 D의 기준 절이 표 밖이면 대운 전체 `null` + `reason: "OUT_OF_SOLAR_TERM_TABLE"`(에러 아님).
- **`current`** = `options.referenceDate`(YYYY-MM-DD, 기본 = 요청 처리일 KST)가 속한 주 `{ index, startsAt, endsAt }`. **`null` 조건**: 첫 주 `startsAt` 이전 · 남은 마지막 주 `endsAt` 이후(절단 포함) · `periods`가 비었을 때(D5). 「지금 어느 대운인가」만 — 세운 아님.
- **옵션 무영향**: `hiddenStemSchool`은 각 주 `tenGods.branchPrimary`(지지 정기 십신)만 바꾸고 간지·나이·날짜는 바꾸지 않는다(D2). `trueSolarTime`·`dayBoundary`·`jaHourPolicy`는 시주·일주 전용이라 대운 거리·간지·날짜에 영향이 없다(D4) — 단 이 옵션으로 **일주(일간)가 바뀌면** 동봉 십신(`tenGods`)은 그 일간을 따라 바뀐다(십신은 일간 기준 데이터). 시각 미상은 두 층(명식·대운) 모두 「정오, 시간대 오프셋 미적용」으로 같은 시계를 본다(D3).

## v1 제외 (사유)

| 항목 | 사유 | 예정 |
| --- | --- | --- |
| 세운·월운 | PLAN §8·F10 | 별도 단계 |
| 대운수 반올림/버림 확정 | 「정답 1개」 회피, 소수 그대로 | 관점·UI |
| 대운 ↔ 원국 합충 | 관점층이 6단계 함수를 대운 간지에 재적용 | v1.1 `include: "daeunInteractions"` 후보 |
| 절입 거리에 진태양시 | DEC C | v1.1 관점 옵션 |
| 강약·용신·격국 | 8단계 이후 | — |

출처: 『자평진전(子平眞詮)』 논대운(論大運) · 통용 명리 교재(3일 = 1년, 순역행 표) · 회의록 2026-09-22 §4 A2-2(개발자) · PLAN v1 §2 2-2·2-7 · 발주서 `HO-2026-0922-saju-L2-stage7-daeun-01` §1·§2.
