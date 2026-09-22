# 골든 합충표 (검산 대상)

`docs/golden/GOLDEN-PILLARS.md`의 명식 11건에 대해 코어가 산출한 합충형(合沖刑) 관계 전부다. `packages/saju-core/src/l2/golden-interactions.test.ts`가 이 표를 직접 파싱해 코어 산출과 대조한다(열 이름 매핑). 규칙 정본은 `docs/rules/INTERACTIONS.md`(6단계 v1: 간합·육합·삼합·방합·지지충·형. 파·해·천간충·化 판정·가중은 범위 밖).

- **상태 열** `pending` = 코어 산출값, 역술가 검산 대기(LC가 전통·현대 페르소나 2인 검산 라운드를 돌린 뒤 기입). `confirmed` = 검산 통과, 이후 값이 고정된다(코어가 달라지면 테스트 실패). `pending` 행도 코어 현재 산출과 같아야 한다 — 코어를 바꾸면 이 표를 다시 생성해야 한다.
- **출처 열 빈칸 = 파서 실패**(골든 표 규칙 동일). `pending` 행의 출처는 「코어 산출 <일자>, 검산 대기」.
- **셀 형식** `글자-글자:기둥-기둥`, 관계가 여럿이면 공백 구분, 없으면 `-`. 글자·기둥은 명식 순서(연→월→일→시). 기둥은 `year month day time`. 3자 관계(삼합·방합 완전, 삼형 완전)는 글자 3개·기둥 3개, 2자는 2개(삼합 2자 = 반합, 삼형 2자 = 부분 형). `adjacent`·`shared`·`complete`는 기둥 수와 위치에서 유도되므로 셀에 적지 않는다.
- **명식 열**은 대조 편의용(`천간-지지` 기둥 순). 파서는 `GOLDEN-PILLARS.md` 입력으로 코어를 다시 돌려 이 열과 관계 열을 함께 대조한다.
- 관계 0 명식: 골든 11건에는 없다(전부 1건 이상). 관계 0 케이스는 `l2/interactions.test.ts`의 합성 명식으로 고정.

## 표

| id | 명식 | 간합 | 육합 | 삼합 | 방합 | 충 | 형 | 상태 | 출처 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| g-1990-01-01-1030 | gi-sa byeong-ja byeong-in gye-sa | - | - | - | - | - | sa-in:year-day in-sa:day-time | pending | 코어 산출 2026-09-22, 검산 대기 | 巳巳는 자형 아님(자형은 辰午酉亥만). 寅巳 = 寅巳申 삼형의 2자 부분 형 |
| g-2000-02-04-1200 | gi-myo jeong-chuk im-jin byeong-o | jeong-im:month-day | - | - | - | - | - | pending | 코어 산출 2026-09-22, 검산 대기 |  |
| g-2010-06-21-2359 | gyeong-in im-o im-in gyeong-ja | - | - | in-o:year-month o-in:month-day | - | o-ja:month-time | - | pending | 코어 산출 2026-09-22, 검산 대기 | 야자시 정책 종속(시주 庚子). 寅午 반합 2건은 같은 午를 공유(shared) |
| g-2015-12-22-0030 | eul-mi mu-ja im-sin gyeong-ja | eul-gyeong:year-time | - | ja-sin:month-day sin-ja:day-time | - | - | - | pending | 코어 산출 2026-09-22, 검산 대기 | 子子는 자형 아님. 申子 반합 2건은 같은 申을 공유(shared) |
| g-2024-02-04-1727 | gap-jin byeong-in mu-sul sin-yu | byeong-sin:month-time | jin-yu:year-time | - | - | jin-sul:year-day | - | pending | 코어 산출 2026-09-22, 검산 대기 | 寅戌은 왕지 午 없는 2자(공협) → 산출 안 함 |
| g-2011-11-08-0334 | sin-myo mu-sul jeong-myo im-in | jeong-im:day-time | myo-sul:year-month sul-myo:month-day | - | - | - | - | pending | 코어 산출 2026-09-22, 검산 대기 |  |
| g-2011-11-08-0335 | sin-myo gi-hae jeong-myo im-in | jeong-im:day-time | hae-in:month-time | myo-hae:year-month hae-myo:month-day | - | - | - | pending | 코어 산출 2026-09-22, 검산 대기 |  |
| g-2011-11-08-0925 | sin-myo gi-hae jeong-myo eul-sa | - | - | myo-hae:year-month hae-myo:month-day | - | hae-sa:month-time | - | pending | 코어 산출 2026-09-22, 검산 대기 |  |
| g-1955-02-04-2247 | gap-o jeong-chuk byeong-sin mu-ja | - | chuk-ja:month-time | sin-ja:day-time | - | o-ja:year-time | - | pending | 코어 산출 2026-09-22, 검산 대기 |  |
| g-1955-02-04-2248 | eul-mi mu-in byeong-sin mu-ja | - | - | sin-ja:day-time | - | in-sin:month-day | in-sin:month-day | pending | 코어 산출 2026-09-22, 검산 대기 | 寅申 = 충 + 부분 삼형 중복 산출(둘 다 기록) |
| g-1988-10-09-0230 | mu-jin im-sul jeong-yu sin-chuk | im-jeong:month-day | jin-yu:year-day | yu-chuk:day-time | - | jin-sul:year-month | sul-chuk:month-time | pending | 코어 산출 2026-09-22, 검산 대기 | 戌丑 = 丑戌未 삼형의 2자 부분 형 |
