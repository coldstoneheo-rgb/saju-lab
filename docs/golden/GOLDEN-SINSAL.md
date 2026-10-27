# 골든 신살 표 (S3, confirmed)

`packages/saju-core/src/l2/golden-sinsal.test.ts`가 이 파일을 직접 파싱한다(열 이름 매핑). 규칙 정본 = `docs/rules/SINSAL.md`, 설계 = `docs/design/sinsal-design.md` §4.

- **행** = `GOLDEN-PILLARS.md` 50행(같은 id·순서). `명식` 열 = 그 표의 연·월·일·시주(시각 미상 3행은 세 기둥).
- **열** = `SINSAL.md` 표 1 변형 13개. 셀 = 걸린 기둥(연→시, `,` 구분) · `-` = 적중 없음. 한 변형이 여러 기둥에 걸리면 합집합(괴강 네 기둥·백호는 기둥마다 레코드 1개).
- **유도**: 셀은 `SINSAL.md` 표와 `명식` 글자만으로 만든다(코드 표 미참조). 테스트가 같은 유도(오라클)와 코어 `sinsalOf(calculatePillars(입력))`를 둘 다 이 셀과 대조한다.
- **출처 열**: 셀 유도 = 워커 2026-10-26(HO-2026-1026-sinsal #119). 행마다 `출처` 열에 LC 독립 재계산 파일을 적는다(#119 LC 관찰 ①).
- **상태 열** `pending` = 워커 유도, LC 독립 재계산 대기. `confirmed` = LC 재계산 일치, 이후 값 고정. 50행 전부 2026-10-26 LC 독립 재계산(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md` — `SINSAL.md` · `INTERACTIONS.md` 표 3 · `GOLDEN-PILLARS.md` · 설계 §2만, 코어 코드 미참조, 기준 SHA 9a4ae5c)으로 `confirmed`. 650셀 불일치 0 · 변형별 적중 수 13/13 같음 · 해석 변경 0. 이 표는 8a 골든과 무관하다(8a 셀을 읽지 않음).
- **학설 축**은 이 표에 없다. 표의 명리학적 타당성은 `doctrine: "unreviewed"`(G2-3 전).
- **보강 기준(변형별, 설계 §4 · LC 10-26)**: 각 변형 열의 적중 0 칸, 그리고 갈림 실측 5종 — 천을귀인 A만·B만 적중 행 · 괴강 `day-mu-sul`만 적중 행 · 괴강 `four-pillars`만 적중 행 · 화개 기준 기둥 자기 제외가 결과를 바꾼 행 · 시각 미상 행. 2026-10-26 실측 결과 전부 1행 이상이라 **보강 0행**(테스트가 분포와 함께 고정).

## 표

| id | 명식 | cheoneul.a | cheoneul.b | dohwa.year-basis | dohwa.day-basis | yeokma.year-basis | yeokma.day-basis | hwagae.year-basis | hwagae.day-basis | yangin.yang-only | goegang.day-four | goegang.day-mu-sul | goegang.four-pillars | baekho | 상태 | 출처 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| g-1990-01-01-1030 | gi-sa byeong-ja byeong-in gye-sa | - | - | - | - | - | - | - | - | - | - | - | - | - | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-2000-02-04-1200 | gi-myo jeong-chuk im-jin byeong-o | year | year | - | - | - | - | - | - | - | day | day | day | month | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-2010-06-21-2359 | gyeong-in im-o im-in gyeong-ja | - | - | - | - | - | - | - | - | time | - | - | - | - | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-2015-12-22-0030 | eul-mi mu-ja im-sin gyeong-ja | - | - | month,time | - | - | - | - | - | month,time | - | - | - | year | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-2024-02-04-1727 | gap-jin byeong-in mu-sul sin-yu | - | - | time | - | month | - | - | - | - | - | day | - | year | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-2011-11-08-0334 | sin-myo mu-sul jeong-myo im-in | - | - | - | - | - | - | - | - | - | - | - | - | - | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-2011-11-08-0335 | sin-myo gi-hae jeong-myo im-in | month | month | - | - | - | - | - | - | - | - | - | - | - | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-2011-11-08-0925 | sin-myo gi-hae jeong-myo eul-sa | month | month | - | - | time | time | - | - | - | - | - | - | - | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-1955-02-04-2247 | gap-o jeong-chuk byeong-sin mu-ja | - | - | - | - | day | - | - | - | year | - | - | - | month | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-1955-02-04-2248 | eul-mi mu-in byeong-sin mu-ja | - | - | time | - | - | month | - | - | - | - | - | - | year | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-1988-10-09-0230 | mu-jin im-sul jeong-yu sin-chuk | day | day | day | - | - | - | - | time | - | - | - | month | year,month | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-1927-08-20-0915 | jeong-myo mu-sin byeong-sul im-jin | - | - | - | year | - | month | - | - | - | - | - | time | day | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-1943-03-18-1320 | gye-mi eul-myo eul-hae im-o | - | - | - | - | - | - | - | year | - | - | - | - | - | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-1952-11-12-0510 | im-jin sin-hae im-sul im-in | - | - | - | - | time | - | - | - | - | day | day | year,day | day | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-1983-06-25-1525 | gye-hae mu-o gap-sin sin-mi | time | time | - | - | - | - | time | - | - | - | - | - | - | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-1994-09-14-0715 | gap-sul gye-yu gye-myo eul-myo | day,time | day,time | day,time | - | - | - | - | - | - | - | - | - | - | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-2005-04-22-0130 | eul-yu gyeong-jin byeong-ja mu-ja | year | year | - | year | - | - | - | month | - | - | - | month | - | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-1933-11-17-xxxx | gye-yu gye-hae jeong-hae | year,month,day | year,month,day | - | - | month,day | - | - | - | - | - | - | - | - | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-1972-03-14-xxxx | im-ja gye-myo gap-jin | - | - | - | - | - | - | day | - | month | - | - | - | day | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-1999-08-23-xxxx | gi-myo im-sin jeong-mi | - | - | - | - | - | - | day | - | - | - | - | - | - | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-1963-06-06-1000 | gye-myo jeong-sa gyeong-jin sin-sa | - | - | - | - | month,time | - | - | - | - | day | day | day | - | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-1971-07-02-1400 | sin-hae gap-o mu-ja gi-mi | time | time | day | - | - | - | time | - | month | - | - | - | - | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-1984-12-12-0600 | gap-ja byeong-ja gyeong-jin gi-myo | - | - | - | - | - | - | day | - | - | day | day | day | - | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-2020-05-27-2000 | gyeong-ja sin-sa gyeong-o byeong-sul | - | day | - | - | - | - | - | time | - | - | - | - | time | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-1975-02-04-1958 | gap-in jeong-chuk sin-sa mu-sul | year | year | - | - | - | - | time | month | - | - | - | - | month | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-1975-02-04-1959 | eul-myo mu-in sin-sa mu-sul | month | month | - | - | day | - | - | - | - | - | - | - | - | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-1975-02-04-2000 | eul-myo mu-in sin-sa mu-sul | month | month | - | - | day | - | - | - | - | - | - | - | - | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-1936-03-06-0248 | byeong-ja gyeong-in jeong-hae sin-chuk | day | day | - | year | month | - | - | - | - | - | - | - | - | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-1936-03-06-0249 | byeong-ja sin-myo jeong-hae sin-chuk | day | day | - | year | - | - | - | - | - | - | - | - | - | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-1936-03-06-0250 | byeong-ja sin-myo jeong-hae sin-chuk | day | day | - | year | - | - | - | - | - | - | - | - | - | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-1965-11-07-2300 | eul-sa byeong-sul eul-chuk byeong-ja | time | time | - | - | - | - | day | - | - | - | - | - | month | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-1946-05-19-2359 | byeong-sul gye-sa gye-sa im-ja | month,day | month,day | - | - | - | - | - | - | - | - | - | - | year | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-1965-11-08-0000 | eul-sa byeong-sul byeong-in mu-ja | - | - | - | - | - | - | - | month | - | - | - | - | month | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-1949-07-15-0920 | gi-chuk sin-mi byeong-o im-jin | - | - | day | - | - | - | - | - | day | - | - | time | - | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-1957-06-02-2320 | jeong-yu eul-sa eul-sa jeong-hae | - | - | - | - | time | time | - | - | - | - | - | - | - | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-1987-05-10-0230 | jeong-myo eul-sa gi-mi eul-chuk | - | - | - | - | month | month | day | - | - | - | - | - | - | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-1960-11-20-2235 | gyeong-ja jeong-hae im-ja gyeong-ja | - | - | - | - | - | - | - | - | year,day,time | - | - | - | - | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-1923-10-05-0840 | gye-hae sin-yu sin-hae im-jin | - | - | - | - | - | - | - | - | - | - | - | time | - | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-1953-04-27-1610 | gye-sa byeong-jin mu-sin gyeong-sin | - | - | - | - | - | - | - | month | - | - | - | - | - | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-1981-12-03-0520 | sin-yu gi-hae eul-myo gi-myo | - | - | - | - | month | - | - | - | - | - | - | - | - | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-1996-07-19-1145 | byeong-ja eul-mi jeong-sa byeong-o | - | - | - | time | - | - | - | - | - | - | - | - | month | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-2008-03-11-2115 | mu-ja eul-myo gyeong-sul jeong-hae | - | - | - | month | - | - | - | - | - | day | day | day | - | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-2017-09-30-1305 | jeong-yu gi-yu gyeong-sin gye-mi | time | - | - | year,month | - | - | - | - | year,month | - | - | - | - | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-2022-01-25-0350 | sin-chuk sin-chuk mu-in gap-in | year,month | year,month | - | - | - | - | month | - | - | - | - | - | - | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-1929-06-13-1730 | gi-sa gyeong-o gi-chuk gye-yu | - | - | month | month | - | - | day | - | - | - | - | - | - | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-1947-09-14-1930 | jeong-hae gi-yu byeong-sin mu-sul | year,month | year,month | - | month | - | - | - | - | - | - | - | - | - | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-1986-07-12-1530 | byeong-in eul-mi jeong-sa mu-sin | - | - | - | - | time | - | - | - | - | - | - | - | month | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-1992-10-02-2130 | im-sin gi-yu sin-hae gi-hae | - | - | month | - | - | - | - | - | - | - | - | - | - | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-2013-05-22-0530 | gye-sa jeong-sa mu-ja eul-myo | - | - | - | - | - | - | - | - | - | - | - | - | - | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
| g-1986-07-08-1900 | byeong-in eul-mi gye-chuk im-sul | - | - | - | - | - | - | time | - | - | - | - | time | month,day,time | confirmed | LC 재계산 2026-10-26(`life-coordinator/handoffs/LC-2026-1026-saju-sinsal-recalc.md`) |
