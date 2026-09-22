# 골든 십신표 (검산 대상)

`docs/golden/GOLDEN-PILLARS.md`의 명식 11건에 대해 코어가 산출한 십신(十神)표다. `packages/saju-core/src/l2/golden-tengods.test.ts`가 이 표를 직접 파싱해 코어 산출과 대조한다(열 이름 매핑).

- **상태 열** `pending` = 코어 산출값, 역술가 검산 대기(LC가 전통·현대 페르소나 2인 검산 라운드를 돌린 뒤 기입). `confirmed` = 검산 통과, 이후 값이 고정된다(코어가 달라지면 테스트 실패). `pending` 행도 코어 현재 산출과 같아야 한다 — 코어를 바꾸면 이 표를 다시 생성해야 한다.
- **출처 열 빈칸 = 파서 실패**(골든 표 규칙 동일). `pending` 행의 출처는 「코어 산출 <일자> (<학파>), 검산 대기」.
- 십신 코드: `bigyeon`(비견) `geopjae`(겁재) `siksin`(식신) `sanggwan`(상관) `pyeonjae`(편재) `jeongjae`(정재) `pyeongwan`(편관) `jeonggwan`(정관) `pyeonin`(편인) `jeongin`(정인). 배정 규칙: 일간 기준 같은 오행 = 비견/겁재, 내가 생 = 식신/상관, 내가 극 = 편재/정재, 나를 극 = 편관/정관, 나를 생 = 편인/정인 — 앞이 일간과 같은 음양, 뒤가 다른 음양.
- 열: `연간`·`월간`·`시간` = 그 기둥 천간의 십신(일간 자신은 `-`). `연지정기` 등 = 지지 정기 천간의 십신. `연지장간` 등 = 여기→중기→정기 순 `천간=십신` 나열. 지장간 표는 `docs/rules/HIDDEN-STEMS.md` 기본 학파(`yeonhae`).

## 표

| id | 일간 | 연간 | 연지정기 | 연지장간 | 월간 | 월지정기 | 월지장간 | 일간십신 | 일지정기 | 일지장간 | 시간 | 시지정기 | 시지장간 | 상태 | 출처 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| g-1990-01-01-1030 | byeong | sanggwan | bigyeon | mu=siksin gyeong=pyeonjae byeong=bigyeon | bigyeon | jeonggwan | im=pyeongwan gye=jeonggwan | - | pyeonin | mu=siksin byeong=bigyeon gap=pyeonin | jeonggwan | bigyeon | mu=siksin gyeong=pyeonjae byeong=bigyeon | pending | 코어 산출 2026-09-22 (yeonhae), 검산 대기 |  |
| g-2000-02-04-1200 | im | jeonggwan | sanggwan | gap=siksin eul=sanggwan | jeongjae | jeonggwan | gye=geopjae sin=jeongin gi=jeonggwan | - | pyeongwan | eul=sanggwan gye=geopjae mu=pyeongwan | pyeonjae | jeongjae | byeong=pyeonjae gi=jeonggwan jeong=jeongjae | pending | 코어 산출 2026-09-22 (yeonhae), 검산 대기 |  |
| g-2010-06-21-2359 | im | pyeonin | siksin | mu=pyeongwan byeong=pyeonjae gap=siksin | bigyeon | jeongjae | byeong=pyeonjae gi=jeonggwan jeong=jeongjae | - | siksin | mu=pyeongwan byeong=pyeonjae gap=siksin | pyeonin | geopjae | im=bigyeon gye=geopjae | pending | 코어 산출 2026-09-22 (yeonhae), 검산 대기 |  |
| g-2015-12-22-0030 | im | sanggwan | jeonggwan | jeong=jeongjae eul=sanggwan gi=jeonggwan | pyeongwan | geopjae | im=bigyeon gye=geopjae | - | pyeonin | mu=pyeongwan im=bigyeon gyeong=pyeonin | pyeonin | geopjae | im=bigyeon gye=geopjae | pending | 코어 산출 2026-09-22 (yeonhae), 검산 대기 |  |
| g-2024-02-04-1727 | mu | pyeongwan | bigyeon | eul=jeonggwan gye=jeongjae mu=bigyeon | pyeonin | pyeongwan | mu=bigyeon byeong=pyeonin gap=pyeongwan | - | bigyeon | sin=sanggwan jeong=jeongin mu=bigyeon | sanggwan | sanggwan | gyeong=siksin sin=sanggwan | pending | 코어 산출 2026-09-22 (yeonhae), 검산 대기 |  |
| g-2011-11-08-0334 | jeong | pyeonjae | pyeonin | gap=jeongin eul=pyeonin | sanggwan | sanggwan | sin=pyeonjae jeong=bigyeon mu=sanggwan | - | pyeonin | gap=jeongin eul=pyeonin | jeonggwan | jeongin | mu=sanggwan byeong=geopjae gap=jeongin | pending | 코어 산출 2026-09-22 (yeonhae), 검산 대기 |  |
| g-2011-11-08-0335 | jeong | pyeonjae | pyeonin | gap=jeongin eul=pyeonin | siksin | jeonggwan | mu=sanggwan gap=jeongin im=jeonggwan | - | pyeonin | gap=jeongin eul=pyeonin | jeonggwan | jeongin | mu=sanggwan byeong=geopjae gap=jeongin | pending | 코어 산출 2026-09-22 (yeonhae), 검산 대기 |  |
| g-2011-11-08-0925 | jeong | pyeonjae | pyeonin | gap=jeongin eul=pyeonin | siksin | jeonggwan | mu=sanggwan gap=jeongin im=jeonggwan | - | pyeonin | gap=jeongin eul=pyeonin | pyeonin | geopjae | mu=sanggwan gyeong=jeongjae byeong=geopjae | pending | 코어 산출 2026-09-22 (yeonhae), 검산 대기 |  |
| g-1955-02-04-2247 | byeong | pyeonin | geopjae | byeong=bigyeon gi=sanggwan jeong=geopjae | geopjae | sanggwan | gye=jeonggwan sin=jeongjae gi=sanggwan | - | pyeonjae | mu=siksin im=pyeongwan gyeong=pyeonjae | siksin | jeonggwan | im=pyeongwan gye=jeonggwan | pending | 코어 산출 2026-09-22 (yeonhae), 검산 대기 |  |
| g-1955-02-04-2248 | byeong | jeongin | sanggwan | jeong=geopjae eul=jeongin gi=sanggwan | siksin | pyeonin | mu=siksin byeong=bigyeon gap=pyeonin | - | pyeonjae | mu=siksin im=pyeongwan gyeong=pyeonjae | siksin | jeonggwan | im=pyeongwan gye=jeonggwan | pending | 코어 산출 2026-09-22 (yeonhae), 검산 대기 |  |
| g-1988-10-09-0230 | jeong | sanggwan | sanggwan | eul=pyeonin gye=pyeongwan mu=sanggwan | jeonggwan | sanggwan | sin=pyeonjae jeong=bigyeon mu=sanggwan | - | pyeonjae | gyeong=jeongjae sin=pyeonjae | pyeonjae | siksin | gye=pyeongwan sin=pyeonjae gi=siksin | pending | 코어 산출 2026-09-22 (yeonhae), 검산 대기 |  |
