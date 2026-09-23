# 8a 강약 팩터 검증 팩 (골든 50 + YNY 후보 2) — LC 독립 재계산용

생성: `node scripts/strength_verify_pack.mjs` (코어 `strengthFactorsOf`, 학파 `yeonhae`). **손으로 고치지 않는다** — 재생성한다.
행마다 입력 → 정규화 KST → 명식 → 층 원본 → 팩터별 값과 유도 근거 → 골든 셀 대조를 적는다. 판결(신강/신약)은 없다.

## 재계산에 쓰는 정본

| 재료 | 파일 |
| --- | --- |
| 입력·명식(confirmed) | `docs/golden/GOLDEN-PILLARS.md` |
| 기대 셀(pending, 이 팩과 diff 0) | `docs/golden/GOLDEN-STRENGTH-FACTORS.md` |
| 팩터 정의 · 돕는 십신 · 계절 · 사령 경계 | `docs/rules/STRENGTH.md` 표 1~4 |
| 지장간 표(여기·중기·정기, 일수) | `docs/rules/HIDDEN-STEMS.md` |
| 합충 규칙 id | `docs/rules/INTERACTIONS.md` |
| 절입 시각(KST) | `docs/fixtures/kasi-24-solar-terms-1920-2100_20260902.txt` (코어 `SOLAR_MONTH_BOUNDARIES`) |
| 십신 | `docs/golden/GOLDEN-TENGODS.md` (confirmed — 득령·득지·득세의 독립 오라클) |

- 사령 경과분은 정규화 KST(시각 미상 = 12:00) 기준 **정수 분**이고 진태양시를 반영하지 않는다(STRENGTH.md `saryeong`).
- 득세 동률(n:n)은 득세로 본다(`deukse.surface-majority-ge`).
- 조후 fire/water는 일간을 **포함**한 표층, 십신·오행 개수는 일간 **제외**.

## 득령·득지·득세 8조합 × 골든 50

| 조합 | 행 수 |
| --- | --- |
| YYY | 9 |
| YYN | 8 |
| YNY | 0 |
| YNN | 4 |
| NYY | 12 |
| NYN | 11 |
| NNY | 2 |
| NNN | 4 |

골든 셀 대조: 50행 × 16셀 불일치 0.

## 골든 50행

### g-1990-01-01-1030 — 일간 丙byeong · 득령득지득세 NYY · pending

- 입력: 1990-01-01 10:30 · solar · other · 옵션 -
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 1990-01-01T10:30 · precision exact · 학파 yeonhae
- 명식: 연 己巳(gi-sa) · 월 丙子(byeong-ja) · 일 丙寅(byeong-in) · 시 癸巳(gye-sa) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 己gi=상관(sanggwan), 월 丙byeong=비견(bigyeon), 시 癸gye=정관(jeonggwan)
- 층 원본 (지지 정기): 연 巳→丙byeong=비견(bigyeon), 월 子→癸gye=정관(jeonggwan), 일 寅→甲gap=편인(pyeonin), 시 巳→丙byeong=비견(bigyeon)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 巳[戊7 庚7 丙16] · 월 子[壬10 癸20] · 일 寅[戊7 丙7 甲16] · 시 巳[戊7 庚7 丙16]
- 표층십신 bigyeon=3 sanggwan=1 jeonggwan=2 pyeonin=1 · 장간십신 bigyeon=4 siksin=3 sanggwan=1 pyeonjae=2 pyeongwan=1 jeonggwan=2 pyeonin=1 · 표층오행 wood=1 fire=3 earth=1 water=2 · 장간오행 wood=1 fire=4 earth=4 metal=2 water=3 (일간 제외)
- 득령 **N** — 월지 子 정기 癸gye → 정관(jeonggwan) ∉ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **Y** — 일지 寅 장간 戊=식신(siksin) 丙=비견(bigyeon) 甲=편인(pyeonin) → 돕는 것 丙 甲 [deukji.day-branch-support]
- 득세 **Y** 4:2 — 월지 제외 표층 [연간 己=상관, 월간 丙=비견, 시간 癸=정관, 연지정기 丙=비견, 일지정기 甲=편인, 시지정기 丙=비견] → 돕는 4 ≥ 나머지 2 [deukse.surface-majority-ge]
- 투간: 연지 정기 丙 → 월간,일간 · 월지 정기 癸 → 시간 · 일지 중기 丙 → 월간,일간 · 시지 정기 丙 → 월간,일간 (일간 포함 천간에 같은 글자)
- 통근: 연지 정기 丙 · 일지 중기 丙 · 시지 정기 丙 (일간 오행 火 장간)
- 사령: 대설(daeseol) 1989-12-07T12:21 KST → 출생 1990-01-01T10:30 = 35889분 = 24.923일 · 경계 [10]일 → **癸 정기** · 경계와 거리 [14.923]일 → 사령경계 N (≤ 1일)
- 일간합 - · 월지충 - · 일지관계 hyeong:in-sa-sin@year+day hyeong:in-sa-sin@day+time · 化재료 -
- 조후: 겨울(winter) fire=4 water=2 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-2000-02-04-1200 — 일간 壬im · 득령득지득세 NYN · pending

- 입력: 2000-02-04 12:00 · solar · other · 옵션 -
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 2000-02-04T12:00 · precision exact · 학파 yeonhae
- 명식: 연 己卯(gi-myo) · 월 丁丑(jeong-chuk) · 일 壬辰(im-jin) · 시 丙午(byeong-o) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 己gi=정관(jeonggwan), 월 丁jeong=정재(jeongjae), 시 丙byeong=편재(pyeonjae)
- 층 원본 (지지 정기): 연 卯→乙eul=상관(sanggwan), 월 丑→己gi=정관(jeonggwan), 일 辰→戊mu=편관(pyeongwan), 시 午→丁jeong=정재(jeongjae)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 卯[甲10 乙20] · 월 丑[癸9 辛3 己18] · 일 辰[乙9 癸3 戊18] · 시 午[丙10 己9 丁11]
- 표층십신 sanggwan=1 pyeonjae=1 jeongjae=2 pyeongwan=1 jeonggwan=2 · 장간십신 geopjae=2 siksin=1 sanggwan=2 pyeonjae=2 jeongjae=2 pyeongwan=1 jeonggwan=3 jeongin=1 · 표층오행 wood=1 fire=3 earth=3 · 장간오행 wood=3 fire=4 earth=4 metal=1 water=2 (일간 제외)
- 득령 **N** — 월지 丑 정기 己gi → 정관(jeonggwan) ∉ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **Y** — 일지 辰 장간 乙=상관(sanggwan) 癸=겁재(geopjae) 戊=편관(pyeongwan) → 돕는 것 癸 [deukji.day-branch-support]
- 득세 **N** 0:6 — 월지 제외 표층 [연간 己=정관, 월간 丁=정재, 시간 丙=편재, 연지정기 乙=상관, 일지정기 戊=편관, 시지정기 丁=정재] → 돕는 0 < 나머지 6 [deukse.surface-majority-ge]
- 투간: 월지 정기 己 → 연간 · 시지 여기 丙 → 시간 · 시지 중기 己 → 연간 · 시지 정기 丁 → 월간 (일간 포함 천간에 같은 글자)
- 통근: 월지 여기 癸 · 일지 중기 癸 (일간 오행 水 장간)
- 사령: 소한(sohan) 2000-01-06T10:01 KST → 출생 2000-02-04T12:00 = 41879분 = 29.083일 · 경계 [9, 12]일 → **己 정기** · 경계와 거리 [20.083, 17.083]일 → 사령경계 N (≤ 1일)
- 일간합 jeong-im@month · 월지충 - · 일지관계 - · 化재료 jeong-im@month+day:wood m=N x=N
- 조후: 겨울(winter) fire=3 water=1 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-2010-06-21-2359 — 일간 壬im · 득령득지득세 NNY · pending

- 입력: 2010-06-21 23:59 · solar · other · 옵션 -
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 2010-06-21T23:59 · precision exact · 학파 yeonhae
- 명식: 연 庚寅(gyeong-in) · 월 壬午(im-o) · 일 壬寅(im-in) · 시 庚子(gyeong-ja) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 庚gyeong=편인(pyeonin), 월 壬im=비견(bigyeon), 시 庚gyeong=편인(pyeonin)
- 층 원본 (지지 정기): 연 寅→甲gap=식신(siksin), 월 午→丁jeong=정재(jeongjae), 일 寅→甲gap=식신(siksin), 시 子→癸gye=겁재(geopjae)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 寅[戊7 丙7 甲16] · 월 午[丙10 己9 丁11] · 일 寅[戊7 丙7 甲16] · 시 子[壬10 癸20]
- 표층십신 bigyeon=1 geopjae=1 siksin=2 jeongjae=1 pyeonin=2 · 장간십신 bigyeon=2 geopjae=1 siksin=2 pyeonjae=3 jeongjae=1 pyeongwan=2 jeonggwan=1 pyeonin=2 · 표층오행 wood=2 fire=1 metal=2 water=2 · 장간오행 wood=2 fire=4 earth=3 metal=2 water=3 (일간 제외)
- 득령 **N** — 월지 午 정기 丁jeong → 정재(jeongjae) ∉ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **N** — 일지 寅 장간 戊=편관(pyeongwan) 丙=편재(pyeonjae) 甲=식신(siksin) → 돕는 것 없음 [deukji.day-branch-support]
- 득세 **Y** 4:2 — 월지 제외 표층 [연간 庚=편인, 월간 壬=비견, 시간 庚=편인, 연지정기 甲=식신, 일지정기 甲=식신, 시지정기 癸=겁재] → 돕는 4 ≥ 나머지 2 [deukse.surface-majority-ge]
- 투간: 시지 여기 壬 → 월간,일간 (일간 포함 천간에 같은 글자)
- 통근: 시지 여기 壬 · 시지 정기 癸 (일간 오행 水 장간)
- 사령: 망종(mangjong) 2010-06-06T03:49 KST → 출생 2010-06-21T23:59 = 22810분 = 15.840일 · 경계 [10, 19]일 → **己 중기** · 경계와 거리 [5.840, 3.160]일 → 사령경계 N (≤ 1일)
- 일간합 - · 월지충 ja-o@time · 일지관계 samhap:in-o-sul@month+day · 化재료 -
- 조후: 여름(summer) fire=1 water=3 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-2015-12-22-0030 — 일간 壬im · 득령득지득세 YYY · pending

- 입력: 2015-12-22 00:30 · solar · other · 옵션 -
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 2015-12-22T00:30 · precision exact · 학파 yeonhae
- 명식: 연 乙未(eul-mi) · 월 戊子(mu-ja) · 일 壬申(im-sin) · 시 庚子(gyeong-ja) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 乙eul=상관(sanggwan), 월 戊mu=편관(pyeongwan), 시 庚gyeong=편인(pyeonin)
- 층 원본 (지지 정기): 연 未→己gi=정관(jeonggwan), 월 子→癸gye=겁재(geopjae), 일 申→庚gyeong=편인(pyeonin), 시 子→癸gye=겁재(geopjae)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 未[丁9 乙3 己18] · 월 子[壬10 癸20] · 일 申[戊7 壬7 庚16] · 시 子[壬10 癸20]
- 표층십신 geopjae=2 sanggwan=1 pyeongwan=1 jeonggwan=1 pyeonin=2 · 장간십신 bigyeon=3 geopjae=2 sanggwan=2 jeongjae=1 pyeongwan=2 jeonggwan=1 pyeonin=2 · 표층오행 wood=1 earth=2 metal=2 water=2 · 장간오행 wood=2 fire=1 earth=3 metal=2 water=5 (일간 제외)
- 득령 **Y** — 월지 子 정기 癸gye → 겁재(geopjae) ∈ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **Y** — 일지 申 장간 戊=편관(pyeongwan) 壬=비견(bigyeon) 庚=편인(pyeonin) → 돕는 것 壬 庚 [deukji.day-branch-support]
- 득세 **Y** 3:3 — 월지 제외 표층 [연간 乙=상관, 월간 戊=편관, 시간 庚=편인, 연지정기 己=정관, 일지정기 庚=편인, 시지정기 癸=겁재] → 돕는 3 ≥ 나머지 3 (동률 = 득세) [deukse.surface-majority-ge]
- 투간: 연지 중기 乙 → 연간 · 월지 여기 壬 → 일간 · 일지 여기 戊 → 월간 · 일지 중기 壬 → 일간 · 일지 정기 庚 → 시간 · 시지 여기 壬 → 일간 (일간 포함 천간에 같은 글자)
- 통근: 월지 여기 壬 · 월지 정기 癸 · 일지 중기 壬 · 시지 여기 壬 · 시지 정기 癸 (일간 오행 水 장간)
- 사령: 대설(daeseol) 2015-12-07T19:53 KST → 출생 2015-12-22T00:30 = 20437분 = 14.192일 · 경계 [10]일 → **癸 정기** · 경계와 거리 [4.192]일 → 사령경계 N (≤ 1일)
- 일간합 - · 월지충 - · 일지관계 samhap:sin-ja-jin@month+day samhap:sin-ja-jin@day+time · 化재료 eul-gyeong@year+time:metal m=N x=N
- 조후: 겨울(winter) fire=0 water=3 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-2024-02-04-1727 — 일간 戊mu · 득령득지득세 NYY · pending

- 입력: 2024-02-04 17:27 · solar · other · 옵션 -
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 2024-02-04T17:27 · precision exact · 학파 yeonhae
- 명식: 연 甲辰(gap-jin) · 월 丙寅(byeong-in) · 일 戊戌(mu-sul) · 시 辛酉(sin-yu) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 甲gap=편관(pyeongwan), 월 丙byeong=편인(pyeonin), 시 辛sin=상관(sanggwan)
- 층 원본 (지지 정기): 연 辰→戊mu=비견(bigyeon), 월 寅→甲gap=편관(pyeongwan), 일 戌→戊mu=비견(bigyeon), 시 酉→辛sin=상관(sanggwan)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 辰[乙9 癸3 戊18] · 월 寅[戊7 丙7 甲16] · 일 戌[辛9 丁3 戊18] · 시 酉[庚10 辛20]
- 표층십신 bigyeon=2 sanggwan=2 pyeongwan=2 pyeonin=1 · 장간십신 bigyeon=3 siksin=1 sanggwan=3 jeongjae=1 pyeongwan=2 jeonggwan=1 pyeonin=2 jeongin=1 · 표층오행 wood=2 fire=1 earth=2 metal=2 · 장간오행 wood=3 fire=3 earth=3 metal=4 water=1 (일간 제외)
- 득령 **N** — 월지 寅 정기 甲gap → 편관(pyeongwan) ∉ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **Y** — 일지 戌 장간 辛=상관(sanggwan) 丁=정인(jeongin) 戊=비견(bigyeon) → 돕는 것 丁 戊 [deukji.day-branch-support]
- 득세 **Y** 3:3 — 월지 제외 표층 [연간 甲=편관, 월간 丙=편인, 시간 辛=상관, 연지정기 戊=비견, 일지정기 戊=비견, 시지정기 辛=상관] → 돕는 3 ≥ 나머지 3 (동률 = 득세) [deukse.surface-majority-ge]
- 투간: 연지 정기 戊 → 일간 · 월지 여기 戊 → 일간 · 월지 중기 丙 → 월간 · 월지 정기 甲 → 연간 · 일지 여기 辛 → 시간 · 일지 정기 戊 → 일간 · 시지 정기 辛 → 시간 (일간 포함 천간에 같은 글자)
- 통근: 연지 정기 戊 · 월지 여기 戊 · 일지 정기 戊 (일간 오행 土 장간)
- 사령: 입춘(ipchun) 2024-02-04T17:27 KST → 출생 2024-02-04T17:27 = 0분 = 0.000일 · 경계 [7, 14]일 → **戊 여기** · 경계와 거리 [7.000, 14.000]일 → 사령경계 N (≤ 1일)
- 일간합 - · 월지충 - · 일지관계 chung:jin-sul@year+day · 化재료 byeong-sin@month+time:water m=N x=N
- 조후: 봄(spring) fire=1 water=0 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-2011-11-08-0334 — 일간 丁jeong · 득령득지득세 NYY · pending

- 입력: 2011-11-08 03:34 · solar · female · 옵션 -
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 2011-11-08T03:34 · precision exact · 학파 yeonhae
- 명식: 연 辛卯(sin-myo) · 월 戊戌(mu-sul) · 일 丁卯(jeong-myo) · 시 壬寅(im-in) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 辛sin=편재(pyeonjae), 월 戊mu=상관(sanggwan), 시 壬im=정관(jeonggwan)
- 층 원본 (지지 정기): 연 卯→乙eul=편인(pyeonin), 월 戌→戊mu=상관(sanggwan), 일 卯→乙eul=편인(pyeonin), 시 寅→甲gap=정인(jeongin)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 卯[甲10 乙20] · 월 戌[辛9 丁3 戊18] · 일 卯[甲10 乙20] · 시 寅[戊7 丙7 甲16]
- 표층십신 sanggwan=2 pyeonjae=1 jeonggwan=1 pyeonin=2 jeongin=1 · 장간십신 bigyeon=1 geopjae=1 sanggwan=3 pyeonjae=2 jeonggwan=1 pyeonin=2 jeongin=3 · 표층오행 wood=3 earth=2 metal=1 water=1 · 장간오행 wood=5 fire=2 earth=3 metal=2 water=1 (일간 제외)
- 득령 **N** — 월지 戌 정기 戊mu → 상관(sanggwan) ∉ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **Y** — 일지 卯 장간 甲=정인(jeongin) 乙=편인(pyeonin) → 돕는 것 甲 乙 [deukji.day-branch-support]
- 득세 **Y** 3:3 — 월지 제외 표층 [연간 辛=편재, 월간 戊=상관, 시간 壬=정관, 연지정기 乙=편인, 일지정기 乙=편인, 시지정기 甲=정인] → 돕는 3 ≥ 나머지 3 (동률 = 득세) [deukse.surface-majority-ge]
- 투간: 월지 여기 辛 → 연간 · 월지 중기 丁 → 일간 · 월지 정기 戊 → 월간 · 시지 여기 戊 → 월간 (일간 포함 천간에 같은 글자)
- 통근: 월지 중기 丁 · 시지 중기 丙 (일간 오행 火 장간)
- 사령: 한로(hallo) 2011-10-09T00:19 KST → 출생 2011-11-08T03:34 = 43395분 = 30.135일 · 경계 [9, 12]일 → **戊 정기** · 경계와 거리 [21.135, 18.135]일 → 사령경계 N (≤ 1일)
- 일간합 jeong-im@time · 월지충 - · 일지관계 yukhap:myo-sul@month+day · 化재료 jeong-im@day+time:wood m=N x=N
- 조후: 가을(autumn) fire=1 water=1 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-2011-11-08-0335 — 일간 丁jeong · 득령득지득세 NYY · pending

- 입력: 2011-11-08 03:35 · solar · female · 옵션 -
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 2011-11-08T03:35 · precision exact · 학파 yeonhae
- 명식: 연 辛卯(sin-myo) · 월 己亥(gi-hae) · 일 丁卯(jeong-myo) · 시 壬寅(im-in) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 辛sin=편재(pyeonjae), 월 己gi=식신(siksin), 시 壬im=정관(jeonggwan)
- 층 원본 (지지 정기): 연 卯→乙eul=편인(pyeonin), 월 亥→壬im=정관(jeonggwan), 일 卯→乙eul=편인(pyeonin), 시 寅→甲gap=정인(jeongin)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 卯[甲10 乙20] · 월 亥[戊7 甲7 壬16] · 일 卯[甲10 乙20] · 시 寅[戊7 丙7 甲16]
- 표층십신 siksin=1 pyeonjae=1 jeonggwan=2 pyeonin=2 jeongin=1 · 장간십신 geopjae=1 siksin=1 sanggwan=2 pyeonjae=1 jeonggwan=2 pyeonin=2 jeongin=4 · 표층오행 wood=3 earth=1 metal=1 water=2 · 장간오행 wood=6 fire=1 earth=3 metal=1 water=2 (일간 제외)
- 득령 **N** — 월지 亥 정기 壬im → 정관(jeonggwan) ∉ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **Y** — 일지 卯 장간 甲=정인(jeongin) 乙=편인(pyeonin) → 돕는 것 甲 乙 [deukji.day-branch-support]
- 득세 **Y** 3:3 — 월지 제외 표층 [연간 辛=편재, 월간 己=식신, 시간 壬=정관, 연지정기 乙=편인, 일지정기 乙=편인, 시지정기 甲=정인] → 돕는 3 ≥ 나머지 3 (동률 = 득세) [deukse.surface-majority-ge]
- 투간: 월지 정기 壬 → 시간 (일간 포함 천간에 같은 글자)
- 통근: 시지 중기 丙 (일간 오행 火 장간)
- 사령: 입동(ipdong) 2011-11-08T03:35 KST → 출생 2011-11-08T03:35 = 0분 = 0.000일 · 경계 [7, 14]일 → **戊 여기** · 경계와 거리 [7.000, 14.000]일 → 사령경계 N (≤ 1일)
- 일간합 jeong-im@time · 월지충 - · 일지관계 samhap:hae-myo-mi@month+day · 化재료 jeong-im@day+time:wood m=N x=N
- 조후: 겨울(winter) fire=1 water=2 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-2011-11-08-0925 — 일간 丁jeong · 득령득지득세 NYY · pending

- 입력: 2011-11-08 09:25 · solar · female · 옵션 -
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 2011-11-08T09:25 · precision exact · 학파 yeonhae
- 명식: 연 辛卯(sin-myo) · 월 己亥(gi-hae) · 일 丁卯(jeong-myo) · 시 乙巳(eul-sa) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 辛sin=편재(pyeonjae), 월 己gi=식신(siksin), 시 乙eul=편인(pyeonin)
- 층 원본 (지지 정기): 연 卯→乙eul=편인(pyeonin), 월 亥→壬im=정관(jeonggwan), 일 卯→乙eul=편인(pyeonin), 시 巳→丙byeong=겁재(geopjae)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 卯[甲10 乙20] · 월 亥[戊7 甲7 壬16] · 일 卯[甲10 乙20] · 시 巳[戊7 庚7 丙16]
- 표층십신 geopjae=1 siksin=1 pyeonjae=1 jeonggwan=1 pyeonin=3 · 장간십신 geopjae=1 siksin=1 sanggwan=2 pyeonjae=1 jeongjae=1 jeonggwan=1 pyeonin=3 jeongin=3 · 표층오행 wood=3 fire=1 earth=1 metal=1 water=1 · 장간오행 wood=6 fire=1 earth=3 metal=2 water=1 (일간 제외)
- 득령 **N** — 월지 亥 정기 壬im → 정관(jeonggwan) ∉ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **Y** — 일지 卯 장간 甲=정인(jeongin) 乙=편인(pyeonin) → 돕는 것 甲 乙 [deukji.day-branch-support]
- 득세 **Y** 4:2 — 월지 제외 표층 [연간 辛=편재, 월간 己=식신, 시간 乙=편인, 연지정기 乙=편인, 일지정기 乙=편인, 시지정기 丙=겁재] → 돕는 4 ≥ 나머지 2 [deukse.surface-majority-ge]
- 투간: 연지 정기 乙 → 시간 · 일지 정기 乙 → 시간 (일간 포함 천간에 같은 글자)
- 통근: 시지 정기 丙 (일간 오행 火 장간)
- 사령: 입동(ipdong) 2011-11-08T03:35 KST → 출생 2011-11-08T09:25 = 350분 = 0.243일 · 경계 [7, 14]일 → **戊 여기** · 경계와 거리 [6.757, 13.757]일 → 사령경계 N (≤ 1일)
- 일간합 - · 월지충 sa-hae@time · 일지관계 samhap:hae-myo-mi@month+day · 化재료 -
- 조후: 겨울(winter) fire=2 water=1 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-1955-02-04-2247 — 일간 丙byeong · 득령득지득세 NNY · pending

- 입력: 1955-02-04 22:47 · solar · male · 옵션 -
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 1955-02-04T23:17 · precision exact · 학파 yeonhae
- 명식: 연 甲午(gap-o) · 월 丁丑(jeong-chuk) · 일 丙申(byeong-sin) · 시 戊子(mu-ja) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 甲gap=편인(pyeonin), 월 丁jeong=겁재(geopjae), 시 戊mu=식신(siksin)
- 층 원본 (지지 정기): 연 午→丁jeong=겁재(geopjae), 월 丑→己gi=상관(sanggwan), 일 申→庚gyeong=편재(pyeonjae), 시 子→癸gye=정관(jeonggwan)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 午[丙10 己9 丁11] · 월 丑[癸9 辛3 己18] · 일 申[戊7 壬7 庚16] · 시 子[壬10 癸20]
- 표층십신 geopjae=2 siksin=1 sanggwan=1 pyeonjae=1 jeonggwan=1 pyeonin=1 · 장간십신 bigyeon=1 geopjae=2 siksin=2 sanggwan=2 pyeonjae=1 jeongjae=1 pyeongwan=2 jeonggwan=2 pyeonin=1 · 표층오행 wood=1 fire=2 earth=2 metal=1 water=1 · 장간오행 wood=1 fire=3 earth=4 metal=2 water=4 (일간 제외)
- 득령 **N** — 월지 丑 정기 己gi → 상관(sanggwan) ∉ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **N** — 일지 申 장간 戊=식신(siksin) 壬=편관(pyeongwan) 庚=편재(pyeonjae) → 돕는 것 없음 [deukji.day-branch-support]
- 득세 **Y** 3:3 — 월지 제외 표층 [연간 甲=편인, 월간 丁=겁재, 시간 戊=식신, 연지정기 丁=겁재, 일지정기 庚=편재, 시지정기 癸=정관] → 돕는 3 ≥ 나머지 3 (동률 = 득세) [deukse.surface-majority-ge]
- 투간: 연지 여기 丙 → 일간 · 연지 정기 丁 → 월간 · 일지 여기 戊 → 시간 (일간 포함 천간에 같은 글자)
- 통근: 연지 여기 丙 · 연지 정기 丁 (일간 오행 火 장간)
- 사령: 소한(sohan) 1955-01-06T11:36 KST → 출생 1955-02-04T23:17 = 42461분 = 29.487일 · 경계 [9, 12]일 → **己 정기** · 경계와 거리 [20.487, 17.487]일 → 사령경계 N (≤ 1일)
- 일간합 - · 월지충 - · 일지관계 samhap:sin-ja-jin@day+time · 化재료 -
- 조후: 겨울(winter) fire=3 water=1 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-1955-02-04-2248 — 일간 丙byeong · 득령득지득세 YNN · pending

- 입력: 1955-02-04 22:48 · solar · male · 옵션 -
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 1955-02-04T23:18 · precision exact · 학파 yeonhae
- 명식: 연 乙未(eul-mi) · 월 戊寅(mu-in) · 일 丙申(byeong-sin) · 시 戊子(mu-ja) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 乙eul=정인(jeongin), 월 戊mu=식신(siksin), 시 戊mu=식신(siksin)
- 층 원본 (지지 정기): 연 未→己gi=상관(sanggwan), 월 寅→甲gap=편인(pyeonin), 일 申→庚gyeong=편재(pyeonjae), 시 子→癸gye=정관(jeonggwan)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 未[丁9 乙3 己18] · 월 寅[戊7 丙7 甲16] · 일 申[戊7 壬7 庚16] · 시 子[壬10 癸20]
- 표층십신 siksin=2 sanggwan=1 pyeonjae=1 jeonggwan=1 pyeonin=1 jeongin=1 · 장간십신 bigyeon=1 geopjae=1 siksin=4 sanggwan=1 pyeonjae=1 pyeongwan=2 jeonggwan=1 pyeonin=1 jeongin=2 · 표층오행 wood=2 earth=3 metal=1 water=1 · 장간오행 wood=3 fire=2 earth=5 metal=1 water=3 (일간 제외)
- 득령 **Y** — 월지 寅 정기 甲gap → 편인(pyeonin) ∈ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **N** — 일지 申 장간 戊=식신(siksin) 壬=편관(pyeongwan) 庚=편재(pyeonjae) → 돕는 것 없음 [deukji.day-branch-support]
- 득세 **N** 1:5 — 월지 제외 표층 [연간 乙=정인, 월간 戊=식신, 시간 戊=식신, 연지정기 己=상관, 일지정기 庚=편재, 시지정기 癸=정관] → 돕는 1 < 나머지 5 [deukse.surface-majority-ge]
- 투간: 연지 중기 乙 → 연간 · 월지 여기 戊 → 월간,시간 · 월지 중기 丙 → 일간 · 일지 여기 戊 → 월간,시간 (일간 포함 천간에 같은 글자)
- 통근: 연지 여기 丁 · 월지 중기 丙 (일간 오행 火 장간)
- 사령: 입춘(ipchun) 1955-02-04T23:18 KST → 출생 1955-02-04T23:18 = 0분 = 0.000일 · 경계 [7, 14]일 → **戊 여기** · 경계와 거리 [7.000, 14.000]일 → 사령경계 N (≤ 1일)
- 일간합 - · 월지충 in-sin@day · 일지관계 chung:in-sin@month+day hyeong:in-sa-sin@month+day samhap:sin-ja-jin@day+time · 化재료 -
- 조후: 봄(spring) fire=1 water=1 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-1988-10-09-0230 — 일간 丁jeong · 득령득지득세 NNN · pending

- 입력: 1988-10-09 02:30 · solar · male · 옵션 -
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 1988-10-09T01:30 · precision exact · 학파 yeonhae
- 명식: 연 戊辰(mu-jin) · 월 壬戌(im-sul) · 일 丁酉(jeong-yu) · 시 辛丑(sin-chuk) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 戊mu=상관(sanggwan), 월 壬im=정관(jeonggwan), 시 辛sin=편재(pyeonjae)
- 층 원본 (지지 정기): 연 辰→戊mu=상관(sanggwan), 월 戌→戊mu=상관(sanggwan), 일 酉→辛sin=편재(pyeonjae), 시 丑→己gi=식신(siksin)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 辰[乙9 癸3 戊18] · 월 戌[辛9 丁3 戊18] · 일 酉[庚10 辛20] · 시 丑[癸9 辛3 己18]
- 표층십신 siksin=1 sanggwan=3 pyeonjae=2 jeonggwan=1 · 장간십신 bigyeon=1 siksin=1 sanggwan=3 pyeonjae=4 jeongjae=1 pyeongwan=2 jeonggwan=1 pyeonin=1 · 표층오행 earth=4 metal=2 water=1 · 장간오행 wood=1 fire=1 earth=4 metal=5 water=3 (일간 제외)
- 득령 **N** — 월지 戌 정기 戊mu → 상관(sanggwan) ∉ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **N** — 일지 酉 장간 庚=정재(jeongjae) 辛=편재(pyeonjae) → 돕는 것 없음 [deukji.day-branch-support]
- 득세 **N** 0:6 — 월지 제외 표층 [연간 戊=상관, 월간 壬=정관, 시간 辛=편재, 연지정기 戊=상관, 일지정기 辛=편재, 시지정기 己=식신] → 돕는 0 < 나머지 6 [deukse.surface-majority-ge]
- 투간: 연지 정기 戊 → 연간 · 월지 여기 辛 → 시간 · 월지 중기 丁 → 일간 · 월지 정기 戊 → 연간 · 일지 정기 辛 → 시간 · 시지 중기 辛 → 시간 (일간 포함 천간에 같은 글자)
- 통근: 월지 중기 丁 (일간 오행 火 장간)
- 사령: 한로(hallo) 1988-10-08T10:44 KST → 출생 1988-10-09T01:30 = 886분 = 0.615일 · 경계 [9, 12]일 → **辛 여기** · 경계와 거리 [8.385, 11.385]일 → 사령경계 N (≤ 1일)
- 일간합 jeong-im@month · 월지충 jin-sul@year · 일지관계 yukhap:jin-yu@year+day samhap:sa-yu-chuk@day+time · 化재료 jeong-im@month+day:wood m=N x=N
- 조후: 가을(autumn) fire=1 water=1 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-1927-08-20-0915 — 일간 丙byeong · 득령득지득세 NYN · pending

- 입력: 1927-08-20 09:15 · solar · male · 옵션 출생지 busan · trueSolarTime · dayBoundary=midnight
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 1927-08-20T09:15 · precision exact · 학파 yeonhae
- 명식: 연 丁卯(jeong-myo) · 월 戊申(mu-sin) · 일 丙戌(byeong-sul) · 시 壬辰(im-jin) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 丁jeong=겁재(geopjae), 월 戊mu=식신(siksin), 시 壬im=편관(pyeongwan)
- 층 원본 (지지 정기): 연 卯→乙eul=정인(jeongin), 월 申→庚gyeong=편재(pyeonjae), 일 戌→戊mu=식신(siksin), 시 辰→戊mu=식신(siksin)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 卯[甲10 乙20] · 월 申[戊7 壬7 庚16] · 일 戌[辛9 丁3 戊18] · 시 辰[乙9 癸3 戊18]
- 표층십신 geopjae=1 siksin=3 pyeonjae=1 pyeongwan=1 jeongin=1 · 장간십신 geopjae=2 siksin=4 pyeonjae=1 jeongjae=1 pyeongwan=2 jeonggwan=1 pyeonin=1 jeongin=2 · 표층오행 wood=1 fire=1 earth=3 metal=1 water=1 · 장간오행 wood=3 fire=2 earth=4 metal=2 water=3 (일간 제외)
- 득령 **N** — 월지 申 정기 庚gyeong → 편재(pyeonjae) ∉ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **Y** — 일지 戌 장간 辛=정재(jeongjae) 丁=겁재(geopjae) 戊=식신(siksin) → 돕는 것 丁 [deukji.day-branch-support]
- 득세 **N** 2:4 — 월지 제외 표층 [연간 丁=겁재, 월간 戊=식신, 시간 壬=편관, 연지정기 乙=정인, 일지정기 戊=식신, 시지정기 戊=식신] → 돕는 2 < 나머지 4 [deukse.surface-majority-ge]
- 투간: 월지 여기 戊 → 월간 · 월지 중기 壬 → 시간 · 일지 중기 丁 → 연간 · 일지 정기 戊 → 월간 · 시지 정기 戊 → 월간 (일간 포함 천간에 같은 글자)
- 통근: 일지 중기 丁 (일간 오행 火 장간)
- 사령: 입추(ipchu) 1927-08-08T22:31 KST → 출생 1927-08-20T09:15 = 16484분 = 11.447일 · 경계 [7, 14]일 → **壬 중기** · 경계와 거리 [4.447, 2.553]일 → 사령경계 N (≤ 1일)
- 일간합 - · 월지충 - · 일지관계 yukhap:myo-sul@year+day chung:jin-sul@day+time · 化재료 jeong-im@year+time:wood m=N x=N
- 조후: 가을(autumn) fire=2 water=1 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-1943-03-18-1320 — 일간 乙eul · 득령득지득세 YYY · pending

- 입력: 1943-03-18 13:20 · solar · female · 옵션 출생지 jeju · trueSolarTime · dayBoundary=midnight
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 1943-03-18T13:20 · precision exact · 학파 yeonhae
- 명식: 연 癸未(gye-mi) · 월 乙卯(eul-myo) · 일 乙亥(eul-hae) · 시 壬午(im-o) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 癸gye=편인(pyeonin), 월 乙eul=비견(bigyeon), 시 壬im=정인(jeongin)
- 층 원본 (지지 정기): 연 未→己gi=편재(pyeonjae), 월 卯→乙eul=비견(bigyeon), 일 亥→壬im=정인(jeongin), 시 午→丁jeong=식신(siksin)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 未[丁9 乙3 己18] · 월 卯[甲10 乙20] · 일 亥[戊7 甲7 壬16] · 시 午[丙10 己9 丁11]
- 표층십신 bigyeon=2 siksin=1 pyeonjae=1 pyeonin=1 jeongin=2 · 장간십신 bigyeon=3 geopjae=2 siksin=2 sanggwan=1 pyeonjae=2 jeongjae=1 pyeonin=1 jeongin=2 · 표층오행 wood=2 fire=1 earth=1 water=3 · 장간오행 wood=5 fire=3 earth=3 water=3 (일간 제외)
- 득령 **Y** — 월지 卯 정기 乙eul → 비견(bigyeon) ∈ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **Y** — 일지 亥 장간 戊=정재(jeongjae) 甲=겁재(geopjae) 壬=정인(jeongin) → 돕는 것 甲 壬 [deukji.day-branch-support]
- 득세 **Y** 4:2 — 월지 제외 표층 [연간 癸=편인, 월간 乙=비견, 시간 壬=정인, 연지정기 己=편재, 일지정기 壬=정인, 시지정기 丁=식신] → 돕는 4 ≥ 나머지 2 [deukse.surface-majority-ge]
- 투간: 연지 중기 乙 → 월간,일간 · 월지 정기 乙 → 월간,일간 · 일지 정기 壬 → 시간 (일간 포함 천간에 같은 글자)
- 통근: 연지 중기 乙 · 월지 여기 甲 · 월지 정기 乙 · 일지 중기 甲 (일간 오행 木 장간)
- 사령: 경칩(gyeongchip) 1943-03-06T19:59 KST → 출생 1943-03-18T13:20 = 16881분 = 11.723일 · 경계 [10]일 → **乙 정기** · 경계와 거리 [1.723]일 → 사령경계 N (≤ 1일)
- 일간합 - · 월지충 - · 일지관계 samhap:hae-myo-mi@year+month+day · 化재료 -
- 조후: 봄(spring) fire=1 water=3 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-1952-11-12-0510 — 일간 壬im · 득령득지득세 YYY · pending

- 입력: 1952-11-12 05:10 · solar · male · 옵션 출생지 daegu · trueSolarTime · dayBoundary=midnight
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 1952-11-12T05:10 · precision exact · 학파 yeonhae
- 명식: 연 壬辰(im-jin) · 월 辛亥(sin-hae) · 일 壬戌(im-sul) · 시 壬寅(im-in) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 壬im=비견(bigyeon), 월 辛sin=정인(jeongin), 시 壬im=비견(bigyeon)
- 층 원본 (지지 정기): 연 辰→戊mu=편관(pyeongwan), 월 亥→壬im=비견(bigyeon), 일 戌→戊mu=편관(pyeongwan), 시 寅→甲gap=식신(siksin)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 辰[乙9 癸3 戊18] · 월 亥[戊7 甲7 壬16] · 일 戌[辛9 丁3 戊18] · 시 寅[戊7 丙7 甲16]
- 표층십신 bigyeon=3 siksin=1 pyeongwan=2 jeongin=1 · 장간십신 bigyeon=3 geopjae=1 siksin=2 sanggwan=1 pyeonjae=1 jeongjae=1 pyeongwan=4 jeongin=2 · 표층오행 wood=1 earth=2 metal=1 water=3 · 장간오행 wood=3 fire=2 earth=4 metal=2 water=4 (일간 제외)
- 득령 **Y** — 월지 亥 정기 壬im → 비견(bigyeon) ∈ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **Y** — 일지 戌 장간 辛=정인(jeongin) 丁=정재(jeongjae) 戊=편관(pyeongwan) → 돕는 것 辛 [deukji.day-branch-support]
- 득세 **Y** 3:3 — 월지 제외 표층 [연간 壬=비견, 월간 辛=정인, 시간 壬=비견, 연지정기 戊=편관, 일지정기 戊=편관, 시지정기 甲=식신] → 돕는 3 ≥ 나머지 3 (동률 = 득세) [deukse.surface-majority-ge]
- 투간: 월지 정기 壬 → 연간,일간,시간 · 일지 여기 辛 → 월간 (일간 포함 천간에 같은 글자)
- 통근: 연지 중기 癸 · 월지 정기 壬 (일간 오행 水 장간)
- 사령: 입동(ipdong) 1952-11-07T20:22 KST → 출생 1952-11-12T05:10 = 6288분 = 4.367일 · 경계 [7, 14]일 → **戊 여기** · 경계와 거리 [2.633, 9.633]일 → 사령경계 N (≤ 1일)
- 일간합 - · 월지충 - · 일지관계 chung:jin-sul@year+day · 化재료 -
- 조후: 겨울(winter) fire=0 water=4 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-1983-06-25-1525 — 일간 甲gap · 득령득지득세 NYN · pending

- 입력: 1983-06-25 15:25 · solar · female · 옵션 출생지 incheon · trueSolarTime · dayBoundary=midnight
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 1983-06-25T15:25 · precision exact · 학파 yeonhae
- 명식: 연 癸亥(gye-hae) · 월 戊午(mu-o) · 일 甲申(gap-sin) · 시 辛未(sin-mi) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 癸gye=정인(jeongin), 월 戊mu=편재(pyeonjae), 시 辛sin=정관(jeonggwan)
- 층 원본 (지지 정기): 연 亥→壬im=편인(pyeonin), 월 午→丁jeong=상관(sanggwan), 일 申→庚gyeong=편관(pyeongwan), 시 未→己gi=정재(jeongjae)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 亥[戊7 甲7 壬16] · 월 午[丙10 己9 丁11] · 일 申[戊7 壬7 庚16] · 시 未[丁9 乙3 己18]
- 표층십신 sanggwan=1 pyeonjae=1 jeongjae=1 pyeongwan=1 jeonggwan=1 pyeonin=1 jeongin=1 · 장간십신 bigyeon=1 geopjae=1 siksin=1 sanggwan=2 pyeonjae=3 jeongjae=2 pyeongwan=1 jeonggwan=1 pyeonin=2 jeongin=1 · 표층오행 fire=1 earth=2 metal=2 water=2 · 장간오행 wood=2 fire=3 earth=5 metal=2 water=3 (일간 제외)
- 득령 **N** — 월지 午 정기 丁jeong → 상관(sanggwan) ∉ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **Y** — 일지 申 장간 戊=편재(pyeonjae) 壬=편인(pyeonin) 庚=편관(pyeongwan) → 돕는 것 壬 [deukji.day-branch-support]
- 득세 **N** 2:4 — 월지 제외 표층 [연간 癸=정인, 월간 戊=편재, 시간 辛=정관, 연지정기 壬=편인, 일지정기 庚=편관, 시지정기 己=정재] → 돕는 2 < 나머지 4 [deukse.surface-majority-ge]
- 투간: 연지 여기 戊 → 월간 · 연지 중기 甲 → 일간 · 일지 여기 戊 → 월간 (일간 포함 천간에 같은 글자)
- 통근: 연지 중기 甲 · 시지 중기 乙 (일간 오행 木 장간)
- 사령: 망종(mangjong) 1983-06-06T15:26 KST → 출생 1983-06-25T15:25 = 27359분 = 18.999일 · 경계 [10, 19]일 → **己 중기** · 경계와 거리 [8.999, 0.001]일 → 사령경계 Y (≤ 1일)
- 일간합 - · 월지충 - · 일지관계 - · 化재료 mu-gye@year+month:fire m=Y x=N
- 조후: 여름(summer) fire=1 water=2 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-1994-09-14-0715 — 일간 癸gye · 득령득지득세 YNN · pending

- 입력: 1994-09-14 07:15 · solar · other · 옵션 출생지 gangwon · trueSolarTime · dayBoundary=midnight
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 1994-09-14T07:15 · precision exact · 학파 yeonhae
- 명식: 연 甲戌(gap-sul) · 월 癸酉(gye-yu) · 일 癸卯(gye-myo) · 시 乙卯(eul-myo) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 甲gap=상관(sanggwan), 월 癸gye=비견(bigyeon), 시 乙eul=식신(siksin)
- 층 원본 (지지 정기): 연 戌→戊mu=정관(jeonggwan), 월 酉→辛sin=편인(pyeonin), 일 卯→乙eul=식신(siksin), 시 卯→乙eul=식신(siksin)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 戌[辛9 丁3 戊18] · 월 酉[庚10 辛20] · 일 卯[甲10 乙20] · 시 卯[甲10 乙20]
- 표층십신 bigyeon=1 siksin=3 sanggwan=1 jeonggwan=1 pyeonin=1 · 장간십신 bigyeon=1 siksin=3 sanggwan=3 pyeonjae=1 jeonggwan=1 pyeonin=2 jeongin=1 · 표층오행 wood=4 earth=1 metal=1 water=1 · 장간오행 wood=6 fire=1 earth=1 metal=3 water=1 (일간 제외)
- 득령 **Y** — 월지 酉 정기 辛sin → 편인(pyeonin) ∈ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **N** — 일지 卯 장간 甲=상관(sanggwan) 乙=식신(siksin) → 돕는 것 없음 [deukji.day-branch-support]
- 득세 **N** 1:5 — 월지 제외 표층 [연간 甲=상관, 월간 癸=비견, 시간 乙=식신, 연지정기 戊=정관, 일지정기 乙=식신, 시지정기 乙=식신] → 돕는 1 < 나머지 5 [deukse.surface-majority-ge]
- 투간: 일지 여기 甲 → 연간 · 일지 정기 乙 → 시간 · 시지 여기 甲 → 연간 · 시지 정기 乙 → 시간 (일간 포함 천간에 같은 글자)
- 통근: 없음 (일간 오행 水 장간)
- 사령: 백로(baengno) 1994-09-08T05:55 KST → 출생 1994-09-14T07:15 = 8720분 = 6.056일 · 경계 [10]일 → **庚 여기** · 경계와 거리 [3.944]일 → 사령경계 N (≤ 1일)
- 일간합 - · 월지충 myo-yu@day myo-yu@time · 일지관계 yukhap:myo-sul@year+day chung:myo-yu@month+day · 化재료 -
- 조후: 가을(autumn) fire=0 water=2 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-2005-04-22-0130 — 일간 丙byeong · 득령득지득세 NNN · pending

- 입력: 2005-04-22 01:30 · solar · male · 옵션 출생지 jeonnam · trueSolarTime · dayBoundary=midnight
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 2005-04-22T01:30 · precision exact · 학파 yeonhae
- 명식: 연 乙酉(eul-yu) · 월 庚辰(gyeong-jin) · 일 丙子(byeong-ja) · 시 戊子(mu-ja) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 乙eul=정인(jeongin), 월 庚gyeong=편재(pyeonjae), 시 戊mu=식신(siksin)
- 층 원본 (지지 정기): 연 酉→辛sin=정재(jeongjae), 월 辰→戊mu=식신(siksin), 일 子→癸gye=정관(jeonggwan), 시 子→癸gye=정관(jeonggwan)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 酉[庚10 辛20] · 월 辰[乙9 癸3 戊18] · 일 子[壬10 癸20] · 시 子[壬10 癸20]
- 표층십신 siksin=2 pyeonjae=1 jeongjae=1 jeonggwan=2 jeongin=1 · 장간십신 siksin=2 pyeonjae=2 jeongjae=1 pyeongwan=2 jeonggwan=3 jeongin=2 · 표층오행 wood=1 earth=2 metal=2 water=2 · 장간오행 wood=2 earth=2 metal=3 water=5 (일간 제외)
- 득령 **N** — 월지 辰 정기 戊mu → 식신(siksin) ∉ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **N** — 일지 子 장간 壬=편관(pyeongwan) 癸=정관(jeonggwan) → 돕는 것 없음 [deukji.day-branch-support]
- 득세 **N** 1:5 — 월지 제외 표층 [연간 乙=정인, 월간 庚=편재, 시간 戊=식신, 연지정기 辛=정재, 일지정기 癸=정관, 시지정기 癸=정관] → 돕는 1 < 나머지 5 [deukse.surface-majority-ge]
- 투간: 연지 여기 庚 → 월간 · 월지 여기 乙 → 연간 · 월지 정기 戊 → 시간 (일간 포함 천간에 같은 글자)
- 통근: 없음 (일간 오행 火 장간)
- 사령: 청명(cheongmyeong) 2005-04-05T01:34 KST → 출생 2005-04-22T01:30 = 24476분 = 16.997일 · 경계 [9, 12]일 → **戊 정기** · 경계와 거리 [7.997, 4.997]일 → 사령경계 N (≤ 1일)
- 일간합 - · 월지충 - · 일지관계 samhap:sin-ja-jin@month+day · 化재료 eul-gyeong@year+month:metal m=N x=N
- 조후: 봄(spring) fire=1 water=2 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-1933-11-17-xxxx — 일간 丁jeong · 득령득지득세 NYN · pending

- 입력: 1933-11-17 시각 모름 · solar · female · 옵션 -
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 1933-11-17 시각 미상(12:00 대체) · precision time-unknown · 학파 yeonhae
- 명식: 연 癸酉(gye-yu) · 월 癸亥(gye-hae) · 일 丁亥(jeong-hae) · 시 미상 — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 癸gye=편관(pyeongwan), 월 癸gye=편관(pyeongwan)
- 층 원본 (지지 정기): 연 酉→辛sin=편재(pyeonjae), 월 亥→壬im=정관(jeonggwan), 일 亥→壬im=정관(jeonggwan)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 酉[庚10 辛20] · 월 亥[戊7 甲7 壬16] · 일 亥[戊7 甲7 壬16]
- 표층십신 pyeonjae=1 pyeongwan=2 jeonggwan=2 · 장간십신 sanggwan=2 pyeonjae=1 jeongjae=1 pyeongwan=2 jeonggwan=2 jeongin=2 · 표층오행 metal=1 water=4 · 장간오행 wood=2 earth=2 metal=2 water=4 (일간 제외)
- 득령 **N** — 월지 亥 정기 壬im → 정관(jeonggwan) ∉ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **Y** — 일지 亥 장간 戊=상관(sanggwan) 甲=정인(jeongin) 壬=정관(jeonggwan) → 돕는 것 甲 [deukji.day-branch-support]
- 득세 **N** 0:4 — 월지 제외 표층 [연간 癸=편관, 월간 癸=편관, 연지정기 辛=편재, 일지정기 壬=정관] → 돕는 0 < 나머지 4 [deukse.surface-majority-ge]
- 투간: 없음 (일간 포함 천간에 같은 글자)
- 통근: 없음 (일간 오행 火 장간)
- 사령: 입동(ipdong) 1933-11-08T05:43 KST → 출생 1933-11-17 시각 미상(12:00 대체) = 13337분 = 9.262일 · 경계 [7, 14]일 → **甲 중기** · 경계와 거리 [2.262, 4.738]일 → 사령경계 N (≤ 1일)
- 일간합 - · 월지충 - · 일지관계 hyeong:ja-hyeong@month+day · 化재료 -
- 조후: 겨울(winter) fire=1 water=4 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-1972-03-14-xxxx — 일간 甲gap · 득령득지득세 YYY · pending

- 입력: 1972-03-14 시각 모름 · solar · male · 옵션 -
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 1972-03-14 시각 미상(12:00 대체) · precision time-unknown · 학파 yeonhae
- 명식: 연 壬子(im-ja) · 월 癸卯(gye-myo) · 일 甲辰(gap-jin) · 시 미상 — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 壬im=편인(pyeonin), 월 癸gye=정인(jeongin)
- 층 원본 (지지 정기): 연 子→癸gye=정인(jeongin), 월 卯→乙eul=겁재(geopjae), 일 辰→戊mu=편재(pyeonjae)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 子[壬10 癸20] · 월 卯[甲10 乙20] · 일 辰[乙9 癸3 戊18]
- 표층십신 geopjae=1 pyeonjae=1 pyeonin=1 jeongin=2 · 장간십신 bigyeon=1 geopjae=2 pyeonjae=1 pyeonin=2 jeongin=3 · 표층오행 wood=1 earth=1 water=3 · 장간오행 wood=3 earth=1 water=5 (일간 제외)
- 득령 **Y** — 월지 卯 정기 乙eul → 겁재(geopjae) ∈ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **Y** — 일지 辰 장간 乙=겁재(geopjae) 癸=정인(jeongin) 戊=편재(pyeonjae) → 돕는 것 乙 癸 [deukji.day-branch-support]
- 득세 **Y** 3:1 — 월지 제외 표층 [연간 壬=편인, 월간 癸=정인, 연지정기 癸=정인, 일지정기 戊=편재] → 돕는 3 ≥ 나머지 1 [deukse.surface-majority-ge]
- 투간: 연지 여기 壬 → 연간 · 연지 정기 癸 → 월간 · 월지 여기 甲 → 일간 · 일지 중기 癸 → 월간 (일간 포함 천간에 같은 글자)
- 통근: 월지 여기 甲 · 월지 정기 乙 · 일지 여기 乙 (일간 오행 木 장간)
- 사령: 경칩(gyeongchip) 1972-03-05T20:28 KST → 출생 1972-03-14 시각 미상(12:00 대체) = 12452분 = 8.647일 · 경계 [10]일 → **甲 여기** · 경계와 거리 [1.353]일 → 사령경계 N (≤ 1일)
- 일간합 - · 월지충 - · 일지관계 samhap:sin-ja-jin@year+day · 化재료 -
- 조후: 봄(spring) fire=0 water=3 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-1999-08-23-xxxx — 일간 丁jeong · 득령득지득세 NYN · pending

- 입력: 1999-08-23 시각 모름 · solar · other · 옵션 -
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 1999-08-23 시각 미상(12:00 대체) · precision time-unknown · 학파 yeonhae
- 명식: 연 己卯(gi-myo) · 월 壬申(im-sin) · 일 丁未(jeong-mi) · 시 미상 — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 己gi=식신(siksin), 월 壬im=정관(jeonggwan)
- 층 원본 (지지 정기): 연 卯→乙eul=편인(pyeonin), 월 申→庚gyeong=정재(jeongjae), 일 未→己gi=식신(siksin)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 卯[甲10 乙20] · 월 申[戊7 壬7 庚16] · 일 未[丁9 乙3 己18]
- 표층십신 siksin=2 jeongjae=1 jeonggwan=1 pyeonin=1 · 장간십신 bigyeon=1 siksin=2 sanggwan=1 jeongjae=1 jeonggwan=2 pyeonin=2 jeongin=1 · 표층오행 wood=1 earth=2 metal=1 water=1 · 장간오행 wood=3 fire=1 earth=3 metal=1 water=2 (일간 제외)
- 득령 **N** — 월지 申 정기 庚gyeong → 정재(jeongjae) ∉ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **Y** — 일지 未 장간 丁=비견(bigyeon) 乙=편인(pyeonin) 己=식신(siksin) → 돕는 것 丁 乙 [deukji.day-branch-support]
- 득세 **N** 1:3 — 월지 제외 표층 [연간 己=식신, 월간 壬=정관, 연지정기 乙=편인, 일지정기 己=식신] → 돕는 1 < 나머지 3 [deukse.surface-majority-ge]
- 투간: 월지 중기 壬 → 월간 · 일지 여기 丁 → 일간 · 일지 정기 己 → 연간 (일간 포함 천간에 같은 글자)
- 통근: 일지 여기 丁 (일간 오행 火 장간)
- 사령: 입추(ipchu) 1999-08-08T08:14 KST → 출생 1999-08-23 시각 미상(12:00 대체) = 21826분 = 15.157일 · 경계 [7, 14]일 → **庚 정기** · 경계와 거리 [8.157, 1.157]일 → 사령경계 N (≤ 1일)
- 일간합 jeong-im@month · 월지충 - · 일지관계 samhap:hae-myo-mi@year+day · 化재료 jeong-im@month+day:wood m=N x=N
- 조후: 가을(autumn) fire=1 water=1 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-1963-06-06-1000 — 일간 庚gyeong · 득령득지득세 NYN · pending

- 입력: 1963-04-15 10:00 · lunar · male · 옵션 lunar 윤달
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 1963-06-06T10:00 · precision exact · 학파 yeonhae
- 명식: 연 癸卯(gye-myo) · 월 丁巳(jeong-sa) · 일 庚辰(gyeong-jin) · 시 辛巳(sin-sa) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 癸gye=상관(sanggwan), 월 丁jeong=정관(jeonggwan), 시 辛sin=겁재(geopjae)
- 층 원본 (지지 정기): 연 卯→乙eul=정재(jeongjae), 월 巳→丙byeong=편관(pyeongwan), 일 辰→戊mu=편인(pyeonin), 시 巳→丙byeong=편관(pyeongwan)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 卯[甲10 乙20] · 월 巳[戊7 庚7 丙16] · 일 辰[乙9 癸3 戊18] · 시 巳[戊7 庚7 丙16]
- 표층십신 geopjae=1 sanggwan=1 jeongjae=1 pyeongwan=2 jeonggwan=1 pyeonin=1 · 장간십신 bigyeon=2 geopjae=1 sanggwan=2 pyeonjae=1 jeongjae=2 pyeongwan=2 jeonggwan=1 pyeonin=3 · 표층오행 wood=1 fire=3 earth=1 metal=1 water=1 · 장간오행 wood=3 fire=3 earth=3 metal=3 water=2 (일간 제외)
- 득령 **N** — 월지 巳 정기 丙byeong → 편관(pyeongwan) ∉ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **Y** — 일지 辰 장간 乙=정재(jeongjae) 癸=상관(sanggwan) 戊=편인(pyeonin) → 돕는 것 戊 [deukji.day-branch-support]
- 득세 **N** 2:4 — 월지 제외 표층 [연간 癸=상관, 월간 丁=정관, 시간 辛=겁재, 연지정기 乙=정재, 일지정기 戊=편인, 시지정기 丙=편관] → 돕는 2 < 나머지 4 [deukse.surface-majority-ge]
- 투간: 월지 중기 庚 → 일간 · 일지 중기 癸 → 연간 · 시지 중기 庚 → 일간 (일간 포함 천간에 같은 글자)
- 통근: 월지 중기 庚 · 시지 중기 庚 (일간 오행 金 장간)
- 사령: 입하(ipha) 1963-05-06T14:52 KST → 출생 1963-06-06T10:00 = 44348분 = 30.797일 · 경계 [7, 14]일 → **丙 정기** · 경계와 거리 [23.797, 16.797]일 → 사령경계 N (≤ 1일)
- 일간합 - · 월지충 - · 일지관계 - · 化재료 -
- 조후: 여름(summer) fire=3 water=1 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-1971-07-02-1400 — 일간 戊mu · 득령득지득세 YNN · pending

- 입력: 1971-05-10 14:00 · lunar · female · 옵션 lunar 윤달
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 1971-07-02T14:00 · precision exact · 학파 yeonhae
- 명식: 연 辛亥(sin-hae) · 월 甲午(gap-o) · 일 戊子(mu-ja) · 시 己未(gi-mi) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 辛sin=상관(sanggwan), 월 甲gap=편관(pyeongwan), 시 己gi=겁재(geopjae)
- 층 원본 (지지 정기): 연 亥→壬im=편재(pyeonjae), 월 午→丁jeong=정인(jeongin), 일 子→癸gye=정재(jeongjae), 시 未→己gi=겁재(geopjae)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 亥[戊7 甲7 壬16] · 월 午[丙10 己9 丁11] · 일 子[壬10 癸20] · 시 未[丁9 乙3 己18]
- 표층십신 geopjae=2 sanggwan=1 pyeonjae=1 jeongjae=1 pyeongwan=1 jeongin=1 · 장간십신 bigyeon=1 geopjae=3 sanggwan=1 pyeonjae=2 jeongjae=1 pyeongwan=2 jeonggwan=1 pyeonin=1 jeongin=2 · 표층오행 wood=1 fire=1 earth=2 metal=1 water=2 · 장간오행 wood=3 fire=3 earth=4 metal=1 water=3 (일간 제외)
- 득령 **Y** — 월지 午 정기 丁jeong → 정인(jeongin) ∈ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **N** — 일지 子 장간 壬=편재(pyeonjae) 癸=정재(jeongjae) → 돕는 것 없음 [deukji.day-branch-support]
- 득세 **N** 2:4 — 월지 제외 표층 [연간 辛=상관, 월간 甲=편관, 시간 己=겁재, 연지정기 壬=편재, 일지정기 癸=정재, 시지정기 己=겁재] → 돕는 2 < 나머지 4 [deukse.surface-majority-ge]
- 투간: 연지 여기 戊 → 일간 · 연지 중기 甲 → 월간 · 월지 중기 己 → 시간 · 시지 정기 己 → 시간 (일간 포함 천간에 같은 글자)
- 통근: 연지 여기 戊 · 월지 중기 己 · 시지 정기 己 (일간 오행 土 장간)
- 사령: 망종(mangjong) 1971-06-06T17:29 KST → 출생 1971-07-02T14:00 = 37231분 = 25.855일 · 경계 [10, 19]일 → **丁 정기** · 경계와 거리 [15.855, 6.855]일 → 사령경계 N (≤ 1일)
- 일간합 - · 월지충 ja-o@day · 일지관계 chung:ja-o@month+day · 化재료 gap-gi@month+time:earth m=N x=Y
- 조후: 여름(summer) fire=1 water=2 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-1984-12-12-0600 — 일간 庚gyeong · 득령득지득세 NYN · pending

- 입력: 1984-10-20 06:00 · lunar · male · 옵션 lunar 윤달
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 1984-12-12T06:00 · precision exact · 학파 yeonhae
- 명식: 연 甲子(gap-ja) · 월 丙子(byeong-ja) · 일 庚辰(gyeong-jin) · 시 己卯(gi-myo) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 甲gap=편재(pyeonjae), 월 丙byeong=편관(pyeongwan), 시 己gi=정인(jeongin)
- 층 원본 (지지 정기): 연 子→癸gye=상관(sanggwan), 월 子→癸gye=상관(sanggwan), 일 辰→戊mu=편인(pyeonin), 시 卯→乙eul=정재(jeongjae)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 子[壬10 癸20] · 월 子[壬10 癸20] · 일 辰[乙9 癸3 戊18] · 시 卯[甲10 乙20]
- 표층십신 sanggwan=2 pyeonjae=1 jeongjae=1 pyeongwan=1 pyeonin=1 jeongin=1 · 장간십신 siksin=2 sanggwan=3 pyeonjae=2 jeongjae=2 pyeongwan=1 pyeonin=1 jeongin=1 · 표층오행 wood=2 fire=1 earth=2 water=2 · 장간오행 wood=4 fire=1 earth=2 water=5 (일간 제외)
- 득령 **N** — 월지 子 정기 癸gye → 상관(sanggwan) ∉ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **Y** — 일지 辰 장간 乙=정재(jeongjae) 癸=상관(sanggwan) 戊=편인(pyeonin) → 돕는 것 戊 [deukji.day-branch-support]
- 득세 **N** 2:4 — 월지 제외 표층 [연간 甲=편재, 월간 丙=편관, 시간 己=정인, 연지정기 癸=상관, 일지정기 戊=편인, 시지정기 乙=정재] → 돕는 2 < 나머지 4 [deukse.surface-majority-ge]
- 투간: 시지 여기 甲 → 연간 (일간 포함 천간에 같은 글자)
- 통근: 없음 (일간 오행 金 장간)
- 사령: 대설(daeseol) 1984-12-07T07:28 KST → 출생 1984-12-12T06:00 = 7112분 = 4.939일 · 경계 [10]일 → **壬 여기** · 경계와 거리 [5.061]일 → 사령경계 N (≤ 1일)
- 일간합 - · 월지충 - · 일지관계 samhap:sin-ja-jin@year+day samhap:sin-ja-jin@month+day · 化재료 gap-gi@year+time:earth m=N x=N
- 조후: 겨울(winter) fire=1 water=2 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-2020-05-27-2000 — 일간 庚gyeong · 득령득지득세 NYY · pending

- 입력: 2020-04-05 20:00 · lunar · female · 옵션 lunar 윤달
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 2020-05-27T20:00 · precision exact · 학파 yeonhae
- 명식: 연 庚子(gyeong-ja) · 월 辛巳(sin-sa) · 일 庚午(gyeong-o) · 시 丙戌(byeong-sul) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 庚gyeong=비견(bigyeon), 월 辛sin=겁재(geopjae), 시 丙byeong=편관(pyeongwan)
- 층 원본 (지지 정기): 연 子→癸gye=상관(sanggwan), 월 巳→丙byeong=편관(pyeongwan), 일 午→丁jeong=정관(jeonggwan), 시 戌→戊mu=편인(pyeonin)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 子[壬10 癸20] · 월 巳[戊7 庚7 丙16] · 일 午[丙10 己9 丁11] · 시 戌[辛9 丁3 戊18]
- 표층십신 bigyeon=1 geopjae=1 sanggwan=1 pyeongwan=2 jeonggwan=1 pyeonin=1 · 장간십신 bigyeon=2 geopjae=2 siksin=1 sanggwan=1 pyeongwan=3 jeonggwan=2 pyeonin=2 jeongin=1 · 표층오행 fire=3 earth=1 metal=2 water=1 · 장간오행 fire=5 earth=3 metal=4 water=2 (일간 제외)
- 득령 **N** — 월지 巳 정기 丙byeong → 편관(pyeongwan) ∉ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **Y** — 일지 午 장간 丙=편관(pyeongwan) 己=정인(jeongin) 丁=정관(jeonggwan) → 돕는 것 己 [deukji.day-branch-support]
- 득세 **Y** 3:3 — 월지 제외 표층 [연간 庚=비견, 월간 辛=겁재, 시간 丙=편관, 연지정기 癸=상관, 일지정기 丁=정관, 시지정기 戊=편인] → 돕는 3 ≥ 나머지 3 (동률 = 득세) [deukse.surface-majority-ge]
- 투간: 월지 중기 庚 → 연간,일간 · 월지 정기 丙 → 시간 · 일지 여기 丙 → 시간 · 시지 여기 辛 → 월간 (일간 포함 천간에 같은 글자)
- 통근: 월지 중기 庚 · 시지 여기 辛 (일간 오행 金 장간)
- 사령: 입하(ipha) 2020-05-05T09:51 KST → 출생 2020-05-27T20:00 = 32289분 = 22.423일 · 경계 [7, 14]일 → **丙 정기** · 경계와 거리 [15.423, 8.423]일 → 사령경계 N (≤ 1일)
- 일간합 - · 월지충 - · 일지관계 chung:ja-o@year+day samhap:in-o-sul@day+time · 化재료 byeong-sin@month+time:water m=N x=N
- 조후: 여름(summer) fire=3 water=1 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-1975-02-04-1958 — 일간 辛sin · 득령득지득세 YYN · pending

- 입력: 1975-02-04 19:58 · solar · male · 옵션 -
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 1975-02-04T19:58 · precision exact · 학파 yeonhae
- 명식: 연 甲寅(gap-in) · 월 丁丑(jeong-chuk) · 일 辛巳(sin-sa) · 시 戊戌(mu-sul) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 甲gap=정재(jeongjae), 월 丁jeong=편관(pyeongwan), 시 戊mu=정인(jeongin)
- 층 원본 (지지 정기): 연 寅→甲gap=정재(jeongjae), 월 丑→己gi=편인(pyeonin), 일 巳→丙byeong=정관(jeonggwan), 시 戌→戊mu=정인(jeongin)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 寅[戊7 丙7 甲16] · 월 丑[癸9 辛3 己18] · 일 巳[戊7 庚7 丙16] · 시 戌[辛9 丁3 戊18]
- 표층십신 jeongjae=2 pyeongwan=1 jeonggwan=1 pyeonin=1 jeongin=2 · 장간십신 bigyeon=2 geopjae=1 siksin=1 jeongjae=2 pyeongwan=2 jeonggwan=2 pyeonin=1 jeongin=4 · 표층오행 wood=2 fire=2 earth=3 · 장간오행 wood=2 fire=4 earth=5 metal=3 water=1 (일간 제외)
- 득령 **Y** — 월지 丑 정기 己gi → 편인(pyeonin) ∈ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **Y** — 일지 巳 장간 戊=정인(jeongin) 庚=겁재(geopjae) 丙=정관(jeonggwan) → 돕는 것 戊 庚 [deukji.day-branch-support]
- 득세 **N** 2:4 — 월지 제외 표층 [연간 甲=정재, 월간 丁=편관, 시간 戊=정인, 연지정기 甲=정재, 일지정기 丙=정관, 시지정기 戊=정인] → 돕는 2 < 나머지 4 [deukse.surface-majority-ge]
- 투간: 연지 여기 戊 → 시간 · 연지 정기 甲 → 연간 · 월지 중기 辛 → 일간 · 일지 여기 戊 → 시간 · 시지 여기 辛 → 일간 · 시지 중기 丁 → 월간 · 시지 정기 戊 → 시간 (일간 포함 천간에 같은 글자)
- 통근: 월지 중기 辛 · 일지 중기 庚 · 시지 여기 辛 (일간 오행 金 장간)
- 사령: 소한(sohan) 1975-01-06T08:18 KST → 출생 1975-02-04T19:58 = 42460분 = 29.486일 · 경계 [9, 12]일 → **己 정기** · 경계와 거리 [20.486, 17.486]일 → 사령경계 N (≤ 1일)
- 일간합 - · 월지충 - · 일지관계 hyeong:in-sa-sin@year+day · 化재료 -
- 조후: 겨울(winter) fire=2 water=0 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-1975-02-04-1959 — 일간 辛sin · 득령득지득세 NYY · pending

- 입력: 1975-02-04 19:59 · solar · male · 옵션 -
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 1975-02-04T19:59 · precision exact · 학파 yeonhae
- 명식: 연 乙卯(eul-myo) · 월 戊寅(mu-in) · 일 辛巳(sin-sa) · 시 戊戌(mu-sul) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 乙eul=편재(pyeonjae), 월 戊mu=정인(jeongin), 시 戊mu=정인(jeongin)
- 층 원본 (지지 정기): 연 卯→乙eul=편재(pyeonjae), 월 寅→甲gap=정재(jeongjae), 일 巳→丙byeong=정관(jeonggwan), 시 戌→戊mu=정인(jeongin)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 卯[甲10 乙20] · 월 寅[戊7 丙7 甲16] · 일 巳[戊7 庚7 丙16] · 시 戌[辛9 丁3 戊18]
- 표층십신 pyeonjae=2 jeongjae=1 jeonggwan=1 jeongin=3 · 장간십신 bigyeon=1 geopjae=1 pyeonjae=2 jeongjae=2 pyeongwan=1 jeonggwan=2 jeongin=5 · 표층오행 wood=3 fire=1 earth=3 · 장간오행 wood=4 fire=3 earth=5 metal=2 (일간 제외)
- 득령 **N** — 월지 寅 정기 甲gap → 정재(jeongjae) ∉ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **Y** — 일지 巳 장간 戊=정인(jeongin) 庚=겁재(geopjae) 丙=정관(jeonggwan) → 돕는 것 戊 庚 [deukji.day-branch-support]
- 득세 **Y** 3:3 — 월지 제외 표층 [연간 乙=편재, 월간 戊=정인, 시간 戊=정인, 연지정기 乙=편재, 일지정기 丙=정관, 시지정기 戊=정인] → 돕는 3 ≥ 나머지 3 (동률 = 득세) [deukse.surface-majority-ge]
- 투간: 연지 정기 乙 → 연간 · 월지 여기 戊 → 월간,시간 · 일지 여기 戊 → 월간,시간 · 시지 여기 辛 → 일간 · 시지 정기 戊 → 월간,시간 (일간 포함 천간에 같은 글자)
- 통근: 일지 중기 庚 · 시지 여기 辛 (일간 오행 金 장간)
- 사령: 입춘(ipchun) 1975-02-04T19:59 KST → 출생 1975-02-04T19:59 = 0분 = 0.000일 · 경계 [7, 14]일 → **戊 여기** · 경계와 거리 [7.000, 14.000]일 → 사령경계 N (≤ 1일)
- 일간합 - · 월지충 - · 일지관계 hyeong:in-sa-sin@month+day · 化재료 -
- 조후: 봄(spring) fire=1 water=0 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-1975-02-04-2000 — 일간 辛sin · 득령득지득세 NYY · pending

- 입력: 1975-02-04 20:00 · solar · male · 옵션 -
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 1975-02-04T20:00 · precision exact · 학파 yeonhae
- 명식: 연 乙卯(eul-myo) · 월 戊寅(mu-in) · 일 辛巳(sin-sa) · 시 戊戌(mu-sul) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 乙eul=편재(pyeonjae), 월 戊mu=정인(jeongin), 시 戊mu=정인(jeongin)
- 층 원본 (지지 정기): 연 卯→乙eul=편재(pyeonjae), 월 寅→甲gap=정재(jeongjae), 일 巳→丙byeong=정관(jeonggwan), 시 戌→戊mu=정인(jeongin)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 卯[甲10 乙20] · 월 寅[戊7 丙7 甲16] · 일 巳[戊7 庚7 丙16] · 시 戌[辛9 丁3 戊18]
- 표층십신 pyeonjae=2 jeongjae=1 jeonggwan=1 jeongin=3 · 장간십신 bigyeon=1 geopjae=1 pyeonjae=2 jeongjae=2 pyeongwan=1 jeonggwan=2 jeongin=5 · 표층오행 wood=3 fire=1 earth=3 · 장간오행 wood=4 fire=3 earth=5 metal=2 (일간 제외)
- 득령 **N** — 월지 寅 정기 甲gap → 정재(jeongjae) ∉ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **Y** — 일지 巳 장간 戊=정인(jeongin) 庚=겁재(geopjae) 丙=정관(jeonggwan) → 돕는 것 戊 庚 [deukji.day-branch-support]
- 득세 **Y** 3:3 — 월지 제외 표층 [연간 乙=편재, 월간 戊=정인, 시간 戊=정인, 연지정기 乙=편재, 일지정기 丙=정관, 시지정기 戊=정인] → 돕는 3 ≥ 나머지 3 (동률 = 득세) [deukse.surface-majority-ge]
- 투간: 연지 정기 乙 → 연간 · 월지 여기 戊 → 월간,시간 · 일지 여기 戊 → 월간,시간 · 시지 여기 辛 → 일간 · 시지 정기 戊 → 월간,시간 (일간 포함 천간에 같은 글자)
- 통근: 일지 중기 庚 · 시지 여기 辛 (일간 오행 金 장간)
- 사령: 입춘(ipchun) 1975-02-04T19:59 KST → 출생 1975-02-04T20:00 = 1분 = 0.001일 · 경계 [7, 14]일 → **戊 여기** · 경계와 거리 [6.999, 13.999]일 → 사령경계 N (≤ 1일)
- 일간합 - · 월지충 - · 일지관계 hyeong:in-sa-sin@month+day · 化재료 -
- 조후: 봄(spring) fire=1 water=0 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-1936-03-06-0248 — 일간 丁jeong · 득령득지득세 YYN · pending

- 입력: 1936-03-06 02:48 · solar · female · 옵션 -
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 1936-03-06T02:48 · precision exact · 학파 yeonhae
- 명식: 연 丙子(byeong-ja) · 월 庚寅(gyeong-in) · 일 丁亥(jeong-hae) · 시 辛丑(sin-chuk) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 丙byeong=겁재(geopjae), 월 庚gyeong=정재(jeongjae), 시 辛sin=편재(pyeonjae)
- 층 원본 (지지 정기): 연 子→癸gye=편관(pyeongwan), 월 寅→甲gap=정인(jeongin), 일 亥→壬im=정관(jeonggwan), 시 丑→己gi=식신(siksin)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 子[壬10 癸20] · 월 寅[戊7 丙7 甲16] · 일 亥[戊7 甲7 壬16] · 시 丑[癸9 辛3 己18]
- 표층십신 geopjae=1 siksin=1 pyeonjae=1 jeongjae=1 pyeongwan=1 jeonggwan=1 jeongin=1 · 장간십신 geopjae=2 siksin=1 sanggwan=2 pyeonjae=2 jeongjae=1 pyeongwan=2 jeonggwan=2 jeongin=2 · 표층오행 wood=1 fire=1 earth=1 metal=2 water=2 · 장간오행 wood=2 fire=2 earth=3 metal=3 water=4 (일간 제외)
- 득령 **Y** — 월지 寅 정기 甲gap → 정인(jeongin) ∈ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **Y** — 일지 亥 장간 戊=상관(sanggwan) 甲=정인(jeongin) 壬=정관(jeonggwan) → 돕는 것 甲 [deukji.day-branch-support]
- 득세 **N** 1:5 — 월지 제외 표층 [연간 丙=겁재, 월간 庚=정재, 시간 辛=편재, 연지정기 癸=편관, 일지정기 壬=정관, 시지정기 己=식신] → 돕는 1 < 나머지 5 [deukse.surface-majority-ge]
- 투간: 월지 중기 丙 → 연간 · 시지 중기 辛 → 시간 (일간 포함 천간에 같은 글자)
- 통근: 월지 중기 丙 (일간 오행 火 장간)
- 사령: 입춘(ipchun) 1936-02-05T08:29 KST → 출생 1936-03-06T02:48 = 42859분 = 29.763일 · 경계 [7, 14]일 → **甲 정기** · 경계와 거리 [22.763, 15.763]일 → 사령경계 N (≤ 1일)
- 일간합 - · 월지충 - · 일지관계 banghap:hae-ja-chuk@year+day+time yukhap:in-hae@month+day · 化재료 byeong-sin@year+time:water m=N x=N
- 조후: 봄(spring) fire=2 water=2 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-1936-03-06-0249 — 일간 丁jeong · 득령득지득세 YYN · pending

- 입력: 1936-03-06 02:49 · solar · female · 옵션 -
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 1936-03-06T02:49 · precision exact · 학파 yeonhae
- 명식: 연 丙子(byeong-ja) · 월 辛卯(sin-myo) · 일 丁亥(jeong-hae) · 시 辛丑(sin-chuk) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 丙byeong=겁재(geopjae), 월 辛sin=편재(pyeonjae), 시 辛sin=편재(pyeonjae)
- 층 원본 (지지 정기): 연 子→癸gye=편관(pyeongwan), 월 卯→乙eul=편인(pyeonin), 일 亥→壬im=정관(jeonggwan), 시 丑→己gi=식신(siksin)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 子[壬10 癸20] · 월 卯[甲10 乙20] · 일 亥[戊7 甲7 壬16] · 시 丑[癸9 辛3 己18]
- 표층십신 geopjae=1 siksin=1 pyeonjae=2 pyeongwan=1 jeonggwan=1 pyeonin=1 · 장간십신 geopjae=1 siksin=1 sanggwan=1 pyeonjae=3 pyeongwan=2 jeonggwan=2 pyeonin=1 jeongin=2 · 표층오행 wood=1 fire=1 earth=1 metal=2 water=2 · 장간오행 wood=3 fire=1 earth=2 metal=3 water=4 (일간 제외)
- 득령 **Y** — 월지 卯 정기 乙eul → 편인(pyeonin) ∈ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **Y** — 일지 亥 장간 戊=상관(sanggwan) 甲=정인(jeongin) 壬=정관(jeonggwan) → 돕는 것 甲 [deukji.day-branch-support]
- 득세 **N** 1:5 — 월지 제외 표층 [연간 丙=겁재, 월간 辛=편재, 시간 辛=편재, 연지정기 癸=편관, 일지정기 壬=정관, 시지정기 己=식신] → 돕는 1 < 나머지 5 [deukse.surface-majority-ge]
- 투간: 시지 중기 辛 → 월간,시간 (일간 포함 천간에 같은 글자)
- 통근: 없음 (일간 오행 火 장간)
- 사령: 경칩(gyeongchip) 1936-03-06T02:49 KST → 출생 1936-03-06T02:49 = 0분 = 0.000일 · 경계 [10]일 → **甲 여기** · 경계와 거리 [10.000]일 → 사령경계 N (≤ 1일)
- 일간합 - · 월지충 - · 일지관계 banghap:hae-ja-chuk@year+day+time samhap:hae-myo-mi@month+day · 化재료 byeong-sin@year+month:water m=N x=N byeong-sin@year+time:water m=N x=N
- 조후: 봄(spring) fire=2 water=2 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-1936-03-06-0250 — 일간 丁jeong · 득령득지득세 YYN · pending

- 입력: 1936-03-06 02:50 · solar · female · 옵션 -
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 1936-03-06T02:50 · precision exact · 학파 yeonhae
- 명식: 연 丙子(byeong-ja) · 월 辛卯(sin-myo) · 일 丁亥(jeong-hae) · 시 辛丑(sin-chuk) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 丙byeong=겁재(geopjae), 월 辛sin=편재(pyeonjae), 시 辛sin=편재(pyeonjae)
- 층 원본 (지지 정기): 연 子→癸gye=편관(pyeongwan), 월 卯→乙eul=편인(pyeonin), 일 亥→壬im=정관(jeonggwan), 시 丑→己gi=식신(siksin)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 子[壬10 癸20] · 월 卯[甲10 乙20] · 일 亥[戊7 甲7 壬16] · 시 丑[癸9 辛3 己18]
- 표층십신 geopjae=1 siksin=1 pyeonjae=2 pyeongwan=1 jeonggwan=1 pyeonin=1 · 장간십신 geopjae=1 siksin=1 sanggwan=1 pyeonjae=3 pyeongwan=2 jeonggwan=2 pyeonin=1 jeongin=2 · 표층오행 wood=1 fire=1 earth=1 metal=2 water=2 · 장간오행 wood=3 fire=1 earth=2 metal=3 water=4 (일간 제외)
- 득령 **Y** — 월지 卯 정기 乙eul → 편인(pyeonin) ∈ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **Y** — 일지 亥 장간 戊=상관(sanggwan) 甲=정인(jeongin) 壬=정관(jeonggwan) → 돕는 것 甲 [deukji.day-branch-support]
- 득세 **N** 1:5 — 월지 제외 표층 [연간 丙=겁재, 월간 辛=편재, 시간 辛=편재, 연지정기 癸=편관, 일지정기 壬=정관, 시지정기 己=식신] → 돕는 1 < 나머지 5 [deukse.surface-majority-ge]
- 투간: 시지 중기 辛 → 월간,시간 (일간 포함 천간에 같은 글자)
- 통근: 없음 (일간 오행 火 장간)
- 사령: 경칩(gyeongchip) 1936-03-06T02:49 KST → 출생 1936-03-06T02:50 = 1분 = 0.001일 · 경계 [10]일 → **甲 여기** · 경계와 거리 [9.999]일 → 사령경계 N (≤ 1일)
- 일간합 - · 월지충 - · 일지관계 banghap:hae-ja-chuk@year+day+time samhap:hae-myo-mi@month+day · 化재료 byeong-sin@year+month:water m=N x=N byeong-sin@year+time:water m=N x=N
- 조후: 봄(spring) fire=2 water=2 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-1965-11-07-2300 — 일간 乙eul · 득령득지득세 NYN · pending

- 입력: 1965-11-07 23:00 · solar · male · 옵션 -
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 1965-11-07T23:00 · precision exact · 학파 yeonhae
- 명식: 연 乙巳(eul-sa) · 월 丙戌(byeong-sul) · 일 乙丑(eul-chuk) · 시 丙子(byeong-ja) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 乙eul=비견(bigyeon), 월 丙byeong=상관(sanggwan), 시 丙byeong=상관(sanggwan)
- 층 원본 (지지 정기): 연 巳→丙byeong=상관(sanggwan), 월 戌→戊mu=정재(jeongjae), 일 丑→己gi=편재(pyeonjae), 시 子→癸gye=편인(pyeonin)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 巳[戊7 庚7 丙16] · 월 戌[辛9 丁3 戊18] · 일 丑[癸9 辛3 己18] · 시 子[壬10 癸20]
- 표층십신 bigyeon=1 sanggwan=3 pyeonjae=1 jeongjae=1 pyeonin=1 · 장간십신 bigyeon=1 siksin=1 sanggwan=3 pyeonjae=1 jeongjae=2 pyeongwan=2 jeonggwan=1 pyeonin=2 jeongin=1 · 표층오행 wood=1 fire=3 earth=2 water=1 · 장간오행 wood=1 fire=4 earth=3 metal=3 water=3 (일간 제외)
- 득령 **N** — 월지 戌 정기 戊mu → 정재(jeongjae) ∉ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **Y** — 일지 丑 장간 癸=편인(pyeonin) 辛=편관(pyeongwan) 己=편재(pyeonjae) → 돕는 것 癸 [deukji.day-branch-support]
- 득세 **N** 2:4 — 월지 제외 표층 [연간 乙=비견, 월간 丙=상관, 시간 丙=상관, 연지정기 丙=상관, 일지정기 己=편재, 시지정기 癸=편인] → 돕는 2 < 나머지 4 [deukse.surface-majority-ge]
- 투간: 연지 정기 丙 → 월간,시간 (일간 포함 천간에 같은 글자)
- 통근: 없음 (일간 오행 木 장간)
- 사령: 한로(hallo) 1965-10-08T21:11 KST → 출생 1965-11-07T23:00 = 43309분 = 30.076일 · 경계 [9, 12]일 → **戊 정기** · 경계와 거리 [21.076, 18.076]일 → 사령경계 N (≤ 1일)
- 일간합 - · 월지충 - · 일지관계 hyeong:chuk-sul-mi@month+day yukhap:ja-chuk@day+time · 化재료 -
- 조후: 가을(autumn) fire=3 water=1 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-1946-05-19-2359 — 일간 癸gye · 득령득지득세 NYY · pending

- 입력: 1946-05-19 23:59 · solar · female · 옵션 -
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 1946-05-19T23:59 · precision exact · 학파 yeonhae
- 명식: 연 丙戌(byeong-sul) · 월 癸巳(gye-sa) · 일 癸巳(gye-sa) · 시 壬子(im-ja) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 丙byeong=정재(jeongjae), 월 癸gye=비견(bigyeon), 시 壬im=겁재(geopjae)
- 층 원본 (지지 정기): 연 戌→戊mu=정관(jeonggwan), 월 巳→丙byeong=정재(jeongjae), 일 巳→丙byeong=정재(jeongjae), 시 子→癸gye=비견(bigyeon)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 戌[辛9 丁3 戊18] · 월 巳[戊7 庚7 丙16] · 일 巳[戊7 庚7 丙16] · 시 子[壬10 癸20]
- 표층십신 bigyeon=2 geopjae=1 jeongjae=3 jeonggwan=1 · 장간십신 bigyeon=2 geopjae=2 pyeonjae=1 jeongjae=3 jeonggwan=3 pyeonin=1 jeongin=2 · 표층오행 fire=3 earth=1 water=3 · 장간오행 fire=4 earth=3 metal=3 water=4 (일간 제외)
- 득령 **N** — 월지 巳 정기 丙byeong → 정재(jeongjae) ∉ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **Y** — 일지 巳 장간 戊=정관(jeonggwan) 庚=정인(jeongin) 丙=정재(jeongjae) → 돕는 것 庚 [deukji.day-branch-support]
- 득세 **Y** 3:3 — 월지 제외 표층 [연간 丙=정재, 월간 癸=비견, 시간 壬=겁재, 연지정기 戊=정관, 일지정기 丙=정재, 시지정기 癸=비견] → 돕는 3 ≥ 나머지 3 (동률 = 득세) [deukse.surface-majority-ge]
- 투간: 월지 정기 丙 → 연간 · 일지 정기 丙 → 연간 · 시지 여기 壬 → 시간 · 시지 정기 癸 → 월간,일간 (일간 포함 천간에 같은 글자)
- 통근: 시지 여기 壬 · 시지 정기 癸 (일간 오행 水 장간)
- 사령: 입하(ipha) 1946-05-06T12:21 KST → 출생 1946-05-19T23:59 = 19418분 = 13.485일 · 경계 [7, 14]일 → **庚 중기** · 경계와 거리 [6.485, 0.515]일 → 사령경계 Y (≤ 1일)
- 일간합 - · 월지충 - · 일지관계 - · 化재료 -
- 조후: 여름(summer) fire=3 water=4 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-1965-11-08-0000 — 일간 丙byeong · 득령득지득세 NYY · pending

- 입력: 1965-11-08 00:00 · solar · male · 옵션 -
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 1965-11-08T00:00 · precision exact · 학파 yeonhae
- 명식: 연 乙巳(eul-sa) · 월 丙戌(byeong-sul) · 일 丙寅(byeong-in) · 시 戊子(mu-ja) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 乙eul=정인(jeongin), 월 丙byeong=비견(bigyeon), 시 戊mu=식신(siksin)
- 층 원본 (지지 정기): 연 巳→丙byeong=비견(bigyeon), 월 戌→戊mu=식신(siksin), 일 寅→甲gap=편인(pyeonin), 시 子→癸gye=정관(jeonggwan)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 巳[戊7 庚7 丙16] · 월 戌[辛9 丁3 戊18] · 일 寅[戊7 丙7 甲16] · 시 子[壬10 癸20]
- 표층십신 bigyeon=2 siksin=2 jeonggwan=1 pyeonin=1 jeongin=1 · 장간십신 bigyeon=3 geopjae=1 siksin=4 pyeonjae=1 jeongjae=1 pyeongwan=1 jeonggwan=1 pyeonin=1 jeongin=1 · 표층오행 wood=2 fire=2 earth=2 water=1 · 장간오행 wood=2 fire=4 earth=4 metal=2 water=2 (일간 제외)
- 득령 **N** — 월지 戌 정기 戊mu → 식신(siksin) ∉ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **Y** — 일지 寅 장간 戊=식신(siksin) 丙=비견(bigyeon) 甲=편인(pyeonin) → 돕는 것 丙 甲 [deukji.day-branch-support]
- 득세 **Y** 4:2 — 월지 제외 표층 [연간 乙=정인, 월간 丙=비견, 시간 戊=식신, 연지정기 丙=비견, 일지정기 甲=편인, 시지정기 癸=정관] → 돕는 4 ≥ 나머지 2 [deukse.surface-majority-ge]
- 투간: 연지 여기 戊 → 시간 · 연지 정기 丙 → 월간,일간 · 월지 정기 戊 → 시간 · 일지 여기 戊 → 시간 · 일지 중기 丙 → 월간,일간 (일간 포함 천간에 같은 글자)
- 통근: 연지 정기 丙 · 월지 중기 丁 · 일지 중기 丙 (일간 오행 火 장간)
- 사령: 한로(hallo) 1965-10-08T21:11 KST → 출생 1965-11-08T00:00 = 43369분 = 30.117일 · 경계 [9, 12]일 → **戊 정기** · 경계와 거리 [21.117, 18.117]일 → 사령경계 N (≤ 1일)
- 일간합 - · 월지충 - · 일지관계 hyeong:in-sa-sin@year+day · 化재료 -
- 조후: 가을(autumn) fire=3 water=1 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-1949-07-15-0920 — 일간 丙byeong · 득령득지득세 NYN · pending

- 입력: 1949-07-15 09:20 · solar · male · 옵션 -
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 1949-07-15T08:20 · precision exact · 학파 yeonhae
- 명식: 연 己丑(gi-chuk) · 월 辛未(sin-mi) · 일 丙午(byeong-o) · 시 壬辰(im-jin) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 己gi=상관(sanggwan), 월 辛sin=정재(jeongjae), 시 壬im=편관(pyeongwan)
- 층 원본 (지지 정기): 연 丑→己gi=상관(sanggwan), 월 未→己gi=상관(sanggwan), 일 午→丁jeong=겁재(geopjae), 시 辰→戊mu=식신(siksin)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 丑[癸9 辛3 己18] · 월 未[丁9 乙3 己18] · 일 午[丙10 己9 丁11] · 시 辰[乙9 癸3 戊18]
- 표층십신 geopjae=1 siksin=1 sanggwan=3 jeongjae=1 pyeongwan=1 · 장간십신 bigyeon=1 geopjae=2 siksin=1 sanggwan=4 jeongjae=2 pyeongwan=1 jeonggwan=2 jeongin=2 · 표층오행 fire=1 earth=4 metal=1 water=1 · 장간오행 wood=2 fire=3 earth=5 metal=2 water=3 (일간 제외)
- 득령 **N** — 월지 未 정기 己gi → 상관(sanggwan) ∉ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **Y** — 일지 午 장간 丙=비견(bigyeon) 己=상관(sanggwan) 丁=겁재(geopjae) → 돕는 것 丙 丁 [deukji.day-branch-support]
- 득세 **N** 1:5 — 월지 제외 표층 [연간 己=상관, 월간 辛=정재, 시간 壬=편관, 연지정기 己=상관, 일지정기 丁=겁재, 시지정기 戊=식신] → 돕는 1 < 나머지 5 [deukse.surface-majority-ge]
- 투간: 연지 중기 辛 → 월간 · 연지 정기 己 → 연간 · 월지 정기 己 → 연간 · 일지 여기 丙 → 일간 · 일지 중기 己 → 연간 (일간 포함 천간에 같은 글자)
- 통근: 월지 여기 丁 · 일지 여기 丙 · 일지 정기 丁 (일간 오행 火 장간)
- 사령: 소서(soseo) 1949-07-07T20:32 KST → 출생 1949-07-15T08:20 = 10788분 = 7.492일 · 경계 [9, 12]일 → **丁 여기** · 경계와 거리 [1.508, 4.508]일 → 사령경계 N (≤ 1일)
- 일간합 byeong-sin@month · 월지충 chuk-mi@year · 일지관계 yukhap:o-mi@month+day · 化재료 byeong-sin@month+day:water m=N x=Y
- 조후: 여름(summer) fire=2 water=1 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-1957-06-02-2320 — 일간 乙eul · 득령득지득세 NNN · pending

- 입력: 1957-06-02 23:20 · solar · female · 옵션 -
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 1957-06-02T22:50 · precision exact · 학파 yeonhae
- 명식: 연 丁酉(jeong-yu) · 월 乙巳(eul-sa) · 일 乙巳(eul-sa) · 시 丁亥(jeong-hae) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 丁jeong=식신(siksin), 월 乙eul=비견(bigyeon), 시 丁jeong=식신(siksin)
- 층 원본 (지지 정기): 연 酉→辛sin=편관(pyeongwan), 월 巳→丙byeong=상관(sanggwan), 일 巳→丙byeong=상관(sanggwan), 시 亥→壬im=정인(jeongin)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 酉[庚10 辛20] · 월 巳[戊7 庚7 丙16] · 일 巳[戊7 庚7 丙16] · 시 亥[戊7 甲7 壬16]
- 표층십신 bigyeon=1 siksin=2 sanggwan=2 pyeongwan=1 jeongin=1 · 장간십신 bigyeon=1 geopjae=1 siksin=2 sanggwan=2 jeongjae=3 pyeongwan=1 jeonggwan=3 jeongin=1 · 표층오행 wood=1 fire=4 metal=1 water=1 · 장간오행 wood=2 fire=4 earth=3 metal=4 water=1 (일간 제외)
- 득령 **N** — 월지 巳 정기 丙byeong → 상관(sanggwan) ∉ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **N** — 일지 巳 장간 戊=정재(jeongjae) 庚=정관(jeonggwan) 丙=상관(sanggwan) → 돕는 것 없음 [deukji.day-branch-support]
- 득세 **N** 2:4 — 월지 제외 표층 [연간 丁=식신, 월간 乙=비견, 시간 丁=식신, 연지정기 辛=편관, 일지정기 丙=상관, 시지정기 壬=정인] → 돕는 2 < 나머지 4 [deukse.surface-majority-ge]
- 투간: 없음 (일간 포함 천간에 같은 글자)
- 통근: 시지 중기 甲 (일간 오행 木 장간)
- 사령: 입하(ipha) 1957-05-06T03:58 KST → 출생 1957-06-02T22:50 = 40012분 = 27.786일 · 경계 [7, 14]일 → **丙 정기** · 경계와 거리 [20.786, 13.786]일 → 사령경계 N (≤ 1일)
- 일간합 - · 월지충 sa-hae@time · 일지관계 samhap:sa-yu-chuk@year+day chung:sa-hae@day+time · 化재료 -
- 조후: 여름(summer) fire=4 water=1 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-1987-05-10-0230 — 일간 己gi · 득령득지득세 YYY · pending

- 입력: 1987-05-10 02:30 · solar · male · 옵션 -
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 1987-05-10T02:30 · precision exact · 학파 yeonhae
- 명식: 연 丁卯(jeong-myo) · 월 乙巳(eul-sa) · 일 己未(gi-mi) · 시 乙丑(eul-chuk) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 丁jeong=편인(pyeonin), 월 乙eul=편관(pyeongwan), 시 乙eul=편관(pyeongwan)
- 층 원본 (지지 정기): 연 卯→乙eul=편관(pyeongwan), 월 巳→丙byeong=정인(jeongin), 일 未→己gi=비견(bigyeon), 시 丑→己gi=비견(bigyeon)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 卯[甲10 乙20] · 월 巳[戊7 庚7 丙16] · 일 未[丁9 乙3 己18] · 시 丑[癸9 辛3 己18]
- 표층십신 bigyeon=2 pyeongwan=3 pyeonin=1 jeongin=1 · 장간십신 bigyeon=2 geopjae=1 siksin=1 sanggwan=1 pyeonjae=1 pyeongwan=4 jeonggwan=1 pyeonin=2 jeongin=1 · 표층오행 wood=3 fire=2 earth=2 · 장간오행 wood=5 fire=3 earth=3 metal=2 water=1 (일간 제외)
- 득령 **Y** — 월지 巳 정기 丙byeong → 정인(jeongin) ∈ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **Y** — 일지 未 장간 丁=편인(pyeonin) 乙=편관(pyeongwan) 己=비견(bigyeon) → 돕는 것 丁 己 [deukji.day-branch-support]
- 득세 **Y** 3:3 — 월지 제외 표층 [연간 丁=편인, 월간 乙=편관, 시간 乙=편관, 연지정기 乙=편관, 일지정기 己=비견, 시지정기 己=비견] → 돕는 3 ≥ 나머지 3 (동률 = 득세) [deukse.surface-majority-ge]
- 투간: 연지 정기 乙 → 월간,시간 · 일지 여기 丁 → 연간 · 일지 중기 乙 → 월간,시간 · 일지 정기 己 → 일간 · 시지 정기 己 → 일간 (일간 포함 천간에 같은 글자)
- 통근: 월지 여기 戊 · 일지 정기 己 · 시지 정기 己 (일간 오행 土 장간)
- 사령: 입하(ipha) 1987-05-06T10:06 KST → 출생 1987-05-10T02:30 = 5304분 = 3.683일 · 경계 [7, 14]일 → **戊 여기** · 경계와 거리 [3.317, 10.317]일 → 사령경계 N (≤ 1일)
- 일간합 - · 월지충 - · 일지관계 samhap:hae-myo-mi@year+day chung:chuk-mi@day+time hyeong:chuk-sul-mi@day+time · 化재료 -
- 조후: 여름(summer) fire=2 water=0 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-1960-11-20-2235 — 일간 壬im · 득령득지득세 YYY · pending

- 입력: 1960-11-20 22:35 · solar · female · 옵션 -
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 1960-11-20T23:05 · precision exact · 학파 yeonhae
- 명식: 연 庚子(gyeong-ja) · 월 丁亥(jeong-hae) · 일 壬子(im-ja) · 시 庚子(gyeong-ja) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 庚gyeong=편인(pyeonin), 월 丁jeong=정재(jeongjae), 시 庚gyeong=편인(pyeonin)
- 층 원본 (지지 정기): 연 子→癸gye=겁재(geopjae), 월 亥→壬im=비견(bigyeon), 일 子→癸gye=겁재(geopjae), 시 子→癸gye=겁재(geopjae)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 子[壬10 癸20] · 월 亥[戊7 甲7 壬16] · 일 子[壬10 癸20] · 시 子[壬10 癸20]
- 표층십신 bigyeon=1 geopjae=3 jeongjae=1 pyeonin=2 · 장간십신 bigyeon=4 geopjae=3 siksin=1 jeongjae=1 pyeongwan=1 pyeonin=2 · 표층오행 fire=1 metal=2 water=4 · 장간오행 wood=1 fire=1 earth=1 metal=2 water=7 (일간 제외)
- 득령 **Y** — 월지 亥 정기 壬im → 비견(bigyeon) ∈ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **Y** — 일지 子 장간 壬=비견(bigyeon) 癸=겁재(geopjae) → 돕는 것 壬 癸 [deukji.day-branch-support]
- 득세 **Y** 5:1 — 월지 제외 표층 [연간 庚=편인, 월간 丁=정재, 시간 庚=편인, 연지정기 癸=겁재, 일지정기 癸=겁재, 시지정기 癸=겁재] → 돕는 5 ≥ 나머지 1 [deukse.surface-majority-ge]
- 투간: 연지 여기 壬 → 일간 · 월지 정기 壬 → 일간 · 일지 여기 壬 → 일간 · 시지 여기 壬 → 일간 (일간 포함 천간에 같은 글자)
- 통근: 연지 여기 壬 · 연지 정기 癸 · 월지 정기 壬 · 일지 여기 壬 · 일지 정기 癸 · 시지 여기 壬 · 시지 정기 癸 (일간 오행 水 장간)
- 사령: 입동(ipdong) 1960-11-07T19:02 KST → 출생 1960-11-20T23:05 = 18963분 = 13.169일 · 경계 [7, 14]일 → **甲 중기** · 경계와 거리 [6.169, 0.831]일 → 사령경계 Y (≤ 1일)
- 일간합 jeong-im@month · 월지충 - · 일지관계 - · 化재료 jeong-im@month+day:wood m=N x=N
- 조후: 겨울(winter) fire=1 water=5 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-1923-10-05-0840 — 일간 辛sin · 득령득지득세 YYN · pending

- 입력: 1923-10-05 08:40 · solar · male · 옵션 -
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 1923-10-05T08:40 · precision exact · 학파 yeonhae
- 명식: 연 癸亥(gye-hae) · 월 辛酉(sin-yu) · 일 辛亥(sin-hae) · 시 壬辰(im-jin) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 癸gye=식신(siksin), 월 辛sin=비견(bigyeon), 시 壬im=상관(sanggwan)
- 층 원본 (지지 정기): 연 亥→壬im=상관(sanggwan), 월 酉→辛sin=비견(bigyeon), 일 亥→壬im=상관(sanggwan), 시 辰→戊mu=정인(jeongin)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 亥[戊7 甲7 壬16] · 월 酉[庚10 辛20] · 일 亥[戊7 甲7 壬16] · 시 辰[乙9 癸3 戊18]
- 표층십신 bigyeon=2 siksin=1 sanggwan=3 jeongin=1 · 장간십신 bigyeon=2 geopjae=1 siksin=2 sanggwan=3 pyeonjae=1 jeongjae=2 jeongin=3 · 표층오행 earth=1 metal=2 water=4 · 장간오행 wood=3 earth=3 metal=3 water=5 (일간 제외)
- 득령 **Y** — 월지 酉 정기 辛sin → 비견(bigyeon) ∈ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **Y** — 일지 亥 장간 戊=정인(jeongin) 甲=정재(jeongjae) 壬=상관(sanggwan) → 돕는 것 戊 [deukji.day-branch-support]
- 득세 **N** 2:4 — 월지 제외 표층 [연간 癸=식신, 월간 辛=비견, 시간 壬=상관, 연지정기 壬=상관, 일지정기 壬=상관, 시지정기 戊=정인] → 돕는 2 < 나머지 4 [deukse.surface-majority-ge]
- 투간: 연지 정기 壬 → 시간 · 월지 정기 辛 → 월간,일간 · 일지 정기 壬 → 시간 · 시지 중기 癸 → 연간 (일간 포함 천간에 같은 글자)
- 통근: 월지 여기 庚 · 월지 정기 辛 (일간 오행 金 장간)
- 사령: 백로(baengno) 1923-09-09T01:57 KST → 출생 1923-10-05T08:40 = 37843분 = 26.280일 · 경계 [10]일 → **辛 정기** · 경계와 거리 [16.280]일 → 사령경계 N (≤ 1일)
- 일간합 - · 월지충 - · 일지관계 hyeong:ja-hyeong@year+day · 化재료 -
- 조후: 가을(autumn) fire=0 water=4 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-1953-04-27-1610 — 일간 戊mu · 득령득지득세 YYN · pending

- 입력: 1953-04-27 16:10 · solar · female · 옵션 -
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 1953-04-27T16:10 · precision exact · 학파 yeonhae
- 명식: 연 癸巳(gye-sa) · 월 丙辰(byeong-jin) · 일 戊申(mu-sin) · 시 庚申(gyeong-sin) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 癸gye=정재(jeongjae), 월 丙byeong=편인(pyeonin), 시 庚gyeong=식신(siksin)
- 층 원본 (지지 정기): 연 巳→丙byeong=편인(pyeonin), 월 辰→戊mu=비견(bigyeon), 일 申→庚gyeong=식신(siksin), 시 申→庚gyeong=식신(siksin)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 巳[戊7 庚7 丙16] · 월 辰[乙9 癸3 戊18] · 일 申[戊7 壬7 庚16] · 시 申[戊7 壬7 庚16]
- 표층십신 bigyeon=1 siksin=3 jeongjae=1 pyeonin=2 · 장간십신 bigyeon=4 siksin=4 pyeonjae=2 jeongjae=2 jeonggwan=1 pyeonin=2 · 표층오행 fire=2 earth=1 metal=3 water=1 · 장간오행 wood=1 fire=2 earth=4 metal=4 water=4 (일간 제외)
- 득령 **Y** — 월지 辰 정기 戊mu → 비견(bigyeon) ∈ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **Y** — 일지 申 장간 戊=비견(bigyeon) 壬=편재(pyeonjae) 庚=식신(siksin) → 돕는 것 戊 [deukji.day-branch-support]
- 득세 **N** 2:4 — 월지 제외 표층 [연간 癸=정재, 월간 丙=편인, 시간 庚=식신, 연지정기 丙=편인, 일지정기 庚=식신, 시지정기 庚=식신] → 돕는 2 < 나머지 4 [deukse.surface-majority-ge]
- 투간: 연지 여기 戊 → 일간 · 연지 중기 庚 → 시간 · 연지 정기 丙 → 월간 · 월지 중기 癸 → 연간 · 월지 정기 戊 → 일간 · 일지 여기 戊 → 일간 · 일지 정기 庚 → 시간 · 시지 여기 戊 → 일간 · 시지 정기 庚 → 시간 (일간 포함 천간에 같은 글자)
- 통근: 연지 여기 戊 · 월지 정기 戊 · 일지 여기 戊 · 시지 여기 戊 (일간 오행 土 장간)
- 사령: 청명(cheongmyeong) 1953-04-05T11:13 KST → 출생 1953-04-27T16:10 = 31977분 = 22.206일 · 경계 [9, 12]일 → **戊 정기** · 경계와 거리 [13.206, 10.206]일 → 사령경계 N (≤ 1일)
- 일간합 mu-gye@year · 월지충 - · 일지관계 yukhap:sa-sin@year+day hyeong:in-sa-sin@year+day · 化재료 mu-gye@year+day:fire m=N x=Y
- 조후: 봄(spring) fire=2 water=1 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-1981-12-03-0520 — 일간 乙eul · 득령득지득세 YYN · pending

- 입력: 1981-12-03 05:20 · solar · male · 옵션 -
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 1981-12-03T05:20 · precision exact · 학파 yeonhae
- 명식: 연 辛酉(sin-yu) · 월 己亥(gi-hae) · 일 乙卯(eul-myo) · 시 己卯(gi-myo) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 辛sin=편관(pyeongwan), 월 己gi=편재(pyeonjae), 시 己gi=편재(pyeonjae)
- 층 원본 (지지 정기): 연 酉→辛sin=편관(pyeongwan), 월 亥→壬im=정인(jeongin), 일 卯→乙eul=비견(bigyeon), 시 卯→乙eul=비견(bigyeon)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 酉[庚10 辛20] · 월 亥[戊7 甲7 壬16] · 일 卯[甲10 乙20] · 시 卯[甲10 乙20]
- 표층십신 bigyeon=2 pyeonjae=2 pyeongwan=2 jeongin=1 · 장간십신 bigyeon=2 geopjae=3 pyeonjae=2 jeongjae=1 pyeongwan=2 jeonggwan=1 jeongin=1 · 표층오행 wood=2 earth=2 metal=2 water=1 · 장간오행 wood=5 earth=3 metal=3 water=1 (일간 제외)
- 득령 **Y** — 월지 亥 정기 壬im → 정인(jeongin) ∈ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **Y** — 일지 卯 장간 甲=겁재(geopjae) 乙=비견(bigyeon) → 돕는 것 甲 乙 [deukji.day-branch-support]
- 득세 **N** 2:4 — 월지 제외 표층 [연간 辛=편관, 월간 己=편재, 시간 己=편재, 연지정기 辛=편관, 일지정기 乙=비견, 시지정기 乙=비견] → 돕는 2 < 나머지 4 [deukse.surface-majority-ge]
- 투간: 연지 정기 辛 → 연간 · 일지 정기 乙 → 일간 · 시지 정기 乙 → 일간 (일간 포함 천간에 같은 글자)
- 통근: 월지 중기 甲 · 일지 여기 甲 · 일지 정기 乙 · 시지 여기 甲 · 시지 정기 乙 (일간 오행 木 장간)
- 사령: 입동(ipdong) 1981-11-07T21:09 KST → 출생 1981-12-03T05:20 = 36491분 = 25.341일 · 경계 [7, 14]일 → **壬 정기** · 경계와 거리 [18.341, 11.341]일 → 사령경계 N (≤ 1일)
- 일간합 - · 월지충 - · 일지관계 chung:myo-yu@year+day samhap:hae-myo-mi@month+day · 化재료 -
- 조후: 겨울(winter) fire=0 water=1 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-1996-07-19-1145 — 일간 丁jeong · 득령득지득세 NYY · pending

- 입력: 1996-07-19 11:45 · solar · female · 옵션 -
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 1996-07-19T11:45 · precision exact · 학파 yeonhae
- 명식: 연 丙子(byeong-ja) · 월 乙未(eul-mi) · 일 丁巳(jeong-sa) · 시 丙午(byeong-o) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 丙byeong=겁재(geopjae), 월 乙eul=편인(pyeonin), 시 丙byeong=겁재(geopjae)
- 층 원본 (지지 정기): 연 子→癸gye=편관(pyeongwan), 월 未→己gi=식신(siksin), 일 巳→丙byeong=겁재(geopjae), 시 午→丁jeong=비견(bigyeon)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 子[壬10 癸20] · 월 未[丁9 乙3 己18] · 일 巳[戊7 庚7 丙16] · 시 午[丙10 己9 丁11]
- 표층십신 bigyeon=1 geopjae=3 siksin=1 pyeongwan=1 pyeonin=1 · 장간십신 bigyeon=2 geopjae=4 siksin=2 sanggwan=1 jeongjae=1 pyeongwan=1 jeonggwan=1 pyeonin=2 · 표층오행 wood=1 fire=4 earth=1 water=1 · 장간오행 wood=2 fire=6 earth=3 metal=1 water=2 (일간 제외)
- 득령 **N** — 월지 未 정기 己gi → 식신(siksin) ∉ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **Y** — 일지 巳 장간 戊=상관(sanggwan) 庚=정재(jeongjae) 丙=겁재(geopjae) → 돕는 것 丙 [deukji.day-branch-support]
- 득세 **Y** 5:1 — 월지 제외 표층 [연간 丙=겁재, 월간 乙=편인, 시간 丙=겁재, 연지정기 癸=편관, 일지정기 丙=겁재, 시지정기 丁=비견] → 돕는 5 ≥ 나머지 1 [deukse.surface-majority-ge]
- 투간: 월지 여기 丁 → 일간 · 월지 중기 乙 → 월간 · 일지 정기 丙 → 연간,시간 · 시지 여기 丙 → 연간,시간 · 시지 정기 丁 → 일간 (일간 포함 천간에 같은 글자)
- 통근: 월지 여기 丁 · 일지 정기 丙 · 시지 여기 丙 · 시지 정기 丁 (일간 오행 火 장간)
- 사령: 소서(soseo) 1996-07-07T05:00 KST → 출생 1996-07-19T11:45 = 17685분 = 12.281일 · 경계 [9, 12]일 → **己 정기** · 경계와 거리 [3.281, 0.281]일 → 사령경계 Y (≤ 1일)
- 일간합 - · 월지충 - · 일지관계 banghap:sa-o-mi@month+day+time · 化재료 -
- 조후: 여름(summer) fire=5 water=1 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-2008-03-11-2115 — 일간 庚gyeong · 득령득지득세 NYN · pending

- 입력: 2008-03-11 21:15 · solar · male · 옵션 -
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 2008-03-11T21:15 · precision exact · 학파 yeonhae
- 명식: 연 戊子(mu-ja) · 월 乙卯(eul-myo) · 일 庚戌(gyeong-sul) · 시 丁亥(jeong-hae) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 戊mu=편인(pyeonin), 월 乙eul=정재(jeongjae), 시 丁jeong=정관(jeonggwan)
- 층 원본 (지지 정기): 연 子→癸gye=상관(sanggwan), 월 卯→乙eul=정재(jeongjae), 일 戌→戊mu=편인(pyeonin), 시 亥→壬im=식신(siksin)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 子[壬10 癸20] · 월 卯[甲10 乙20] · 일 戌[辛9 丁3 戊18] · 시 亥[戊7 甲7 壬16]
- 표층십신 siksin=1 sanggwan=1 jeongjae=2 jeonggwan=1 pyeonin=2 · 장간십신 geopjae=1 siksin=2 sanggwan=1 pyeonjae=2 jeongjae=2 jeonggwan=2 pyeonin=3 · 표층오행 wood=2 fire=1 earth=2 water=2 · 장간오행 wood=4 fire=2 earth=3 metal=1 water=3 (일간 제외)
- 득령 **N** — 월지 卯 정기 乙eul → 정재(jeongjae) ∉ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **Y** — 일지 戌 장간 辛=겁재(geopjae) 丁=정관(jeonggwan) 戊=편인(pyeonin) → 돕는 것 辛 戊 [deukji.day-branch-support]
- 득세 **N** 2:4 — 월지 제외 표층 [연간 戊=편인, 월간 乙=정재, 시간 丁=정관, 연지정기 癸=상관, 일지정기 戊=편인, 시지정기 壬=식신] → 돕는 2 < 나머지 4 [deukse.surface-majority-ge]
- 투간: 월지 정기 乙 → 월간 · 일지 중기 丁 → 시간 · 일지 정기 戊 → 연간 · 시지 여기 戊 → 연간 (일간 포함 천간에 같은 글자)
- 통근: 일지 여기 辛 (일간 오행 金 장간)
- 사령: 경칩(gyeongchip) 2008-03-05T13:59 KST → 출생 2008-03-11T21:15 = 9076분 = 6.303일 · 경계 [10]일 → **甲 여기** · 경계와 거리 [3.697]일 → 사령경계 N (≤ 1일)
- 일간합 eul-gyeong@month · 월지충 - · 일지관계 yukhap:myo-sul@month+day · 化재료 eul-gyeong@month+day:metal m=N x=N
- 조후: 봄(spring) fire=1 water=2 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-2017-09-30-1305 — 일간 庚gyeong · 득령득지득세 YYY · pending

- 입력: 2017-09-30 13:05 · solar · other · 옵션 -
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 2017-09-30T13:05 · precision exact · 학파 yeonhae
- 명식: 연 丁酉(jeong-yu) · 월 己酉(gi-yu) · 일 庚申(gyeong-sin) · 시 癸未(gye-mi) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 丁jeong=정관(jeonggwan), 월 己gi=정인(jeongin), 시 癸gye=상관(sanggwan)
- 층 원본 (지지 정기): 연 酉→辛sin=겁재(geopjae), 월 酉→辛sin=겁재(geopjae), 일 申→庚gyeong=비견(bigyeon), 시 未→己gi=정인(jeongin)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 酉[庚10 辛20] · 월 酉[庚10 辛20] · 일 申[戊7 壬7 庚16] · 시 未[丁9 乙3 己18]
- 표층십신 bigyeon=1 geopjae=2 sanggwan=1 jeonggwan=1 jeongin=2 · 장간십신 bigyeon=3 geopjae=2 siksin=1 sanggwan=1 jeongjae=1 jeonggwan=2 pyeonin=1 jeongin=2 · 표층오행 fire=1 earth=2 metal=3 water=1 · 장간오행 wood=1 fire=2 earth=3 metal=5 water=2 (일간 제외)
- 득령 **Y** — 월지 酉 정기 辛sin → 겁재(geopjae) ∈ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **Y** — 일지 申 장간 戊=편인(pyeonin) 壬=식신(siksin) 庚=비견(bigyeon) → 돕는 것 戊 庚 [deukji.day-branch-support]
- 득세 **Y** 4:2 — 월지 제외 표층 [연간 丁=정관, 월간 己=정인, 시간 癸=상관, 연지정기 辛=겁재, 일지정기 庚=비견, 시지정기 己=정인] → 돕는 4 ≥ 나머지 2 [deukse.surface-majority-ge]
- 투간: 연지 여기 庚 → 일간 · 월지 여기 庚 → 일간 · 일지 정기 庚 → 일간 · 시지 여기 丁 → 연간 · 시지 정기 己 → 월간 (일간 포함 천간에 같은 글자)
- 통근: 연지 여기 庚 · 연지 정기 辛 · 월지 여기 庚 · 월지 정기 辛 · 일지 정기 庚 (일간 오행 金 장간)
- 사령: 백로(baengno) 2017-09-07T19:39 KST → 출생 2017-09-30T13:05 = 32726분 = 22.726일 · 경계 [10]일 → **辛 정기** · 경계와 거리 [12.726]일 → 사령경계 N (≤ 1일)
- 일간합 - · 월지충 - · 일지관계 - · 化재료 -
- 조후: 가을(autumn) fire=1 water=1 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-2022-01-25-0350 — 일간 戊mu · 득령득지득세 YYN · pending

- 입력: 2022-01-25 03:50 · solar · female · 옵션 -
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 2022-01-25T03:50 · precision exact · 학파 yeonhae
- 명식: 연 辛丑(sin-chuk) · 월 辛丑(sin-chuk) · 일 戊寅(mu-in) · 시 甲寅(gap-in) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 辛sin=상관(sanggwan), 월 辛sin=상관(sanggwan), 시 甲gap=편관(pyeongwan)
- 층 원본 (지지 정기): 연 丑→己gi=겁재(geopjae), 월 丑→己gi=겁재(geopjae), 일 寅→甲gap=편관(pyeongwan), 시 寅→甲gap=편관(pyeongwan)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 丑[癸9 辛3 己18] · 월 丑[癸9 辛3 己18] · 일 寅[戊7 丙7 甲16] · 시 寅[戊7 丙7 甲16]
- 표층십신 geopjae=2 sanggwan=2 pyeongwan=3 · 장간십신 bigyeon=2 geopjae=2 sanggwan=4 jeongjae=2 pyeongwan=3 pyeonin=2 · 표층오행 wood=3 earth=2 metal=2 · 장간오행 wood=3 fire=2 earth=4 metal=4 water=2 (일간 제외)
- 득령 **Y** — 월지 丑 정기 己gi → 겁재(geopjae) ∈ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **Y** — 일지 寅 장간 戊=비견(bigyeon) 丙=편인(pyeonin) 甲=편관(pyeongwan) → 돕는 것 戊 丙 [deukji.day-branch-support]
- 득세 **N** 1:5 — 월지 제외 표층 [연간 辛=상관, 월간 辛=상관, 시간 甲=편관, 연지정기 己=겁재, 일지정기 甲=편관, 시지정기 甲=편관] → 돕는 1 < 나머지 5 [deukse.surface-majority-ge]
- 투간: 연지 중기 辛 → 연간,월간 · 월지 중기 辛 → 연간,월간 · 일지 여기 戊 → 일간 · 일지 정기 甲 → 시간 · 시지 여기 戊 → 일간 · 시지 정기 甲 → 시간 (일간 포함 천간에 같은 글자)
- 통근: 연지 정기 己 · 월지 정기 己 · 일지 여기 戊 · 시지 여기 戊 (일간 오행 土 장간)
- 사령: 소한(sohan) 2022-01-05T18:14 KST → 출생 2022-01-25T03:50 = 27936분 = 19.400일 · 경계 [9, 12]일 → **己 정기** · 경계와 거리 [10.400, 7.400]일 → 사령경계 N (≤ 1일)
- 일간합 - · 월지충 - · 일지관계 - · 化재료 -
- 조후: 겨울(winter) fire=0 water=0 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-1929-06-13-1730 — 일간 己gi · 득령득지득세 YYY · pending

- 입력: 1929-06-13 17:30 · solar · male · 옵션 -
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 1929-06-13T17:30 · precision exact · 학파 yeonhae
- 명식: 연 己巳(gi-sa) · 월 庚午(gyeong-o) · 일 己丑(gi-chuk) · 시 癸酉(gye-yu) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 己gi=비견(bigyeon), 월 庚gyeong=상관(sanggwan), 시 癸gye=편재(pyeonjae)
- 층 원본 (지지 정기): 연 巳→丙byeong=정인(jeongin), 월 午→丁jeong=편인(pyeonin), 일 丑→己gi=비견(bigyeon), 시 酉→辛sin=식신(siksin)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 巳[戊7 庚7 丙16] · 월 午[丙10 己9 丁11] · 일 丑[癸9 辛3 己18] · 시 酉[庚10 辛20]
- 표층십신 bigyeon=2 siksin=1 sanggwan=1 pyeonjae=1 pyeonin=1 jeongin=1 · 장간십신 bigyeon=3 geopjae=1 siksin=2 sanggwan=3 pyeonjae=2 pyeonin=1 jeongin=2 · 표층오행 fire=2 earth=2 metal=2 water=1 · 장간오행 fire=3 earth=4 metal=5 water=2 (일간 제외)
- 득령 **Y** — 월지 午 정기 丁jeong → 편인(pyeonin) ∈ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **Y** — 일지 丑 장간 癸=편재(pyeonjae) 辛=식신(siksin) 己=비견(bigyeon) → 돕는 것 己 [deukji.day-branch-support]
- 득세 **Y** 3:3 — 월지 제외 표층 [연간 己=비견, 월간 庚=상관, 시간 癸=편재, 연지정기 丙=정인, 일지정기 己=비견, 시지정기 辛=식신] → 돕는 3 ≥ 나머지 3 (동률 = 득세) [deukse.surface-majority-ge]
- 투간: 연지 중기 庚 → 월간 · 월지 중기 己 → 연간,일간 · 일지 여기 癸 → 시간 · 일지 정기 己 → 연간,일간 · 시지 여기 庚 → 월간 (일간 포함 천간에 같은 글자)
- 통근: 연지 여기 戊 · 월지 중기 己 · 일지 정기 己 (일간 오행 土 장간)
- 사령: 망종(mangjong) 1929-06-06T14:11 KST → 출생 1929-06-13T17:30 = 10279분 = 7.138일 · 경계 [10, 19]일 → **丙 여기** · 경계와 거리 [2.862, 11.862]일 → 사령경계 N (≤ 1일)
- 일간합 - · 월지충 - · 일지관계 samhap:sa-yu-chuk@year+day+time · 化재료 -
- 조후: 여름(summer) fire=2 water=1 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-1947-09-14-1930 — 일간 丙byeong · 득령득지득세 NNN · pending

- 입력: 1947-09-14 19:30 · solar · female · 옵션 -
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 1947-09-14T19:30 · precision exact · 학파 yeonhae
- 명식: 연 丁亥(jeong-hae) · 월 己酉(gi-yu) · 일 丙申(byeong-sin) · 시 戊戌(mu-sul) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 丁jeong=겁재(geopjae), 월 己gi=상관(sanggwan), 시 戊mu=식신(siksin)
- 층 원본 (지지 정기): 연 亥→壬im=편관(pyeongwan), 월 酉→辛sin=정재(jeongjae), 일 申→庚gyeong=편재(pyeonjae), 시 戌→戊mu=식신(siksin)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 亥[戊7 甲7 壬16] · 월 酉[庚10 辛20] · 일 申[戊7 壬7 庚16] · 시 戌[辛9 丁3 戊18]
- 표층십신 geopjae=1 siksin=2 sanggwan=1 pyeonjae=1 jeongjae=1 pyeongwan=1 · 장간십신 geopjae=2 siksin=4 sanggwan=1 pyeonjae=2 jeongjae=2 pyeongwan=2 pyeonin=1 · 표층오행 fire=1 earth=3 metal=2 water=1 · 장간오행 wood=1 fire=2 earth=5 metal=4 water=2 (일간 제외)
- 득령 **N** — 월지 酉 정기 辛sin → 정재(jeongjae) ∉ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **N** — 일지 申 장간 戊=식신(siksin) 壬=편관(pyeongwan) 庚=편재(pyeonjae) → 돕는 것 없음 [deukji.day-branch-support]
- 득세 **N** 1:5 — 월지 제외 표층 [연간 丁=겁재, 월간 己=상관, 시간 戊=식신, 연지정기 壬=편관, 일지정기 庚=편재, 시지정기 戊=식신] → 돕는 1 < 나머지 5 [deukse.surface-majority-ge]
- 투간: 연지 여기 戊 → 시간 · 일지 여기 戊 → 시간 · 시지 중기 丁 → 연간 · 시지 정기 戊 → 시간 (일간 포함 천간에 같은 글자)
- 통근: 시지 중기 丁 (일간 오행 火 장간)
- 사령: 백로(baengno) 1947-09-08T21:21 KST → 출생 1947-09-14T19:30 = 8529분 = 5.923일 · 경계 [10]일 → **庚 여기** · 경계와 거리 [4.077]일 → 사령경계 N (≤ 1일)
- 일간합 - · 월지충 - · 일지관계 banghap:sin-yu-sul@month+day+time · 化재료 -
- 조후: 가을(autumn) fire=2 water=1 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-1986-07-12-1530 — 일간 丁jeong · 득령득지득세 NYY · pending

- 입력: 1986-07-12 15:30 · solar · male · 옵션 -
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 1986-07-12T15:30 · precision exact · 학파 yeonhae
- 명식: 연 丙寅(byeong-in) · 월 乙未(eul-mi) · 일 丁巳(jeong-sa) · 시 戊申(mu-sin) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 丙byeong=겁재(geopjae), 월 乙eul=편인(pyeonin), 시 戊mu=상관(sanggwan)
- 층 원본 (지지 정기): 연 寅→甲gap=정인(jeongin), 월 未→己gi=식신(siksin), 일 巳→丙byeong=겁재(geopjae), 시 申→庚gyeong=정재(jeongjae)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 寅[戊7 丙7 甲16] · 월 未[丁9 乙3 己18] · 일 巳[戊7 庚7 丙16] · 시 申[戊7 壬7 庚16]
- 표층십신 geopjae=2 siksin=1 sanggwan=1 jeongjae=1 pyeonin=1 jeongin=1 · 장간십신 bigyeon=1 geopjae=3 siksin=1 sanggwan=4 jeongjae=2 jeonggwan=1 pyeonin=2 jeongin=1 · 표층오행 wood=2 fire=2 earth=2 metal=1 · 장간오행 wood=3 fire=4 earth=5 metal=2 water=1 (일간 제외)
- 득령 **N** — 월지 未 정기 己gi → 식신(siksin) ∉ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **Y** — 일지 巳 장간 戊=상관(sanggwan) 庚=정재(jeongjae) 丙=겁재(geopjae) → 돕는 것 丙 [deukji.day-branch-support]
- 득세 **Y** 4:2 — 월지 제외 표층 [연간 丙=겁재, 월간 乙=편인, 시간 戊=상관, 연지정기 甲=정인, 일지정기 丙=겁재, 시지정기 庚=정재] → 돕는 4 ≥ 나머지 2 [deukse.surface-majority-ge]
- 투간: 연지 여기 戊 → 시간 · 연지 중기 丙 → 연간 · 월지 여기 丁 → 일간 · 월지 중기 乙 → 월간 · 일지 여기 戊 → 시간 · 일지 정기 丙 → 연간 · 시지 여기 戊 → 시간 (일간 포함 천간에 같은 글자)
- 통근: 연지 중기 丙 · 월지 여기 丁 · 일지 정기 丙 (일간 오행 火 장간)
- 사령: 소서(soseo) 1986-07-07T19:01 KST → 출생 1986-07-12T15:30 = 6989분 = 4.853일 · 경계 [9, 12]일 → **丁 여기** · 경계와 거리 [4.147, 7.147]일 → 사령경계 N (≤ 1일)
- 일간합 - · 월지충 - · 일지관계 hyeong:in-sa-sin@year+day+time yukhap:sa-sin@day+time · 化재료 -
- 조후: 여름(summer) fire=3 water=0 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-1992-10-02-2130 — 일간 辛sin · 득령득지득세 YYY · pending

- 입력: 1992-10-02 21:30 · solar · female · 옵션 -
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 1992-10-02T21:30 · precision exact · 학파 yeonhae
- 명식: 연 壬申(im-sin) · 월 己酉(gi-yu) · 일 辛亥(sin-hae) · 시 己亥(gi-hae) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 壬im=상관(sanggwan), 월 己gi=편인(pyeonin), 시 己gi=편인(pyeonin)
- 층 원본 (지지 정기): 연 申→庚gyeong=겁재(geopjae), 월 酉→辛sin=비견(bigyeon), 일 亥→壬im=상관(sanggwan), 시 亥→壬im=상관(sanggwan)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 申[戊7 壬7 庚16] · 월 酉[庚10 辛20] · 일 亥[戊7 甲7 壬16] · 시 亥[戊7 甲7 壬16]
- 표층십신 bigyeon=1 geopjae=1 sanggwan=3 pyeonin=2 · 장간십신 bigyeon=1 geopjae=2 sanggwan=4 jeongjae=2 pyeonin=2 jeongin=3 · 표층오행 earth=2 metal=2 water=3 · 장간오행 wood=2 earth=5 metal=3 water=4 (일간 제외)
- 득령 **Y** — 월지 酉 정기 辛sin → 비견(bigyeon) ∈ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **Y** — 일지 亥 장간 戊=정인(jeongin) 甲=정재(jeongjae) 壬=상관(sanggwan) → 돕는 것 戊 [deukji.day-branch-support]
- 득세 **Y** 3:3 — 월지 제외 표층 [연간 壬=상관, 월간 己=편인, 시간 己=편인, 연지정기 庚=겁재, 일지정기 壬=상관, 시지정기 壬=상관] → 돕는 3 ≥ 나머지 3 (동률 = 득세) [deukse.surface-majority-ge]
- 투간: 연지 중기 壬 → 연간 · 월지 정기 辛 → 일간 · 일지 정기 壬 → 연간 · 시지 정기 壬 → 연간 (일간 포함 천간에 같은 글자)
- 통근: 연지 정기 庚 · 월지 여기 庚 · 월지 정기 辛 (일간 오행 金 장간)
- 사령: 백로(baengno) 1992-09-07T18:18 KST → 출생 1992-10-02T21:30 = 36192분 = 25.133일 · 경계 [10]일 → **辛 정기** · 경계와 거리 [15.133]일 → 사령경계 N (≤ 1일)
- 일간합 - · 월지충 - · 일지관계 hyeong:ja-hyeong@day+time · 化재료 -
- 조후: 가을(autumn) fire=0 water=3 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-2013-05-22-0530 — 일간 戊mu · 득령득지득세 YNN · pending

- 입력: 2013-05-22 05:30 · solar · other · 옵션 -
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 2013-05-22T05:30 · precision exact · 학파 yeonhae
- 명식: 연 癸巳(gye-sa) · 월 丁巳(jeong-sa) · 일 戊子(mu-ja) · 시 乙卯(eul-myo) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 癸gye=정재(jeongjae), 월 丁jeong=정인(jeongin), 시 乙eul=정관(jeonggwan)
- 층 원본 (지지 정기): 연 巳→丙byeong=편인(pyeonin), 월 巳→丙byeong=편인(pyeonin), 일 子→癸gye=정재(jeongjae), 시 卯→乙eul=정관(jeonggwan)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 巳[戊7 庚7 丙16] · 월 巳[戊7 庚7 丙16] · 일 子[壬10 癸20] · 시 卯[甲10 乙20]
- 표층십신 jeongjae=2 jeonggwan=2 pyeonin=2 jeongin=1 · 장간십신 bigyeon=2 siksin=2 pyeonjae=1 jeongjae=2 pyeongwan=1 jeonggwan=2 pyeonin=2 jeongin=1 · 표층오행 wood=2 fire=3 water=2 · 장간오행 wood=3 fire=3 earth=2 metal=2 water=3 (일간 제외)
- 득령 **Y** — 월지 巳 정기 丙byeong → 편인(pyeonin) ∈ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **N** — 일지 子 장간 壬=편재(pyeonjae) 癸=정재(jeongjae) → 돕는 것 없음 [deukji.day-branch-support]
- 득세 **N** 2:4 — 월지 제외 표층 [연간 癸=정재, 월간 丁=정인, 시간 乙=정관, 연지정기 丙=편인, 일지정기 癸=정재, 시지정기 乙=정관] → 돕는 2 < 나머지 4 [deukse.surface-majority-ge]
- 투간: 연지 여기 戊 → 일간 · 월지 여기 戊 → 일간 · 일지 정기 癸 → 연간 · 시지 정기 乙 → 시간 (일간 포함 천간에 같은 글자)
- 통근: 연지 여기 戊 · 월지 여기 戊 (일간 오행 土 장간)
- 사령: 입하(ipha) 2013-05-05T17:18 KST → 출생 2013-05-22T05:30 = 23772분 = 16.508일 · 경계 [7, 14]일 → **丙 정기** · 경계와 거리 [9.508, 2.508]일 → 사령경계 N (≤ 1일)
- 일간합 mu-gye@year · 월지충 - · 일지관계 hyeong:ja-myo@day+time · 化재료 mu-gye@year+day:fire m=Y x=Y
- 조후: 여름(summer) fire=3 water=2 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

### g-1986-07-08-1900 — 일간 癸gye · 득령득지득세 NYN · pending

- 입력: 1986-07-08 19:00 · solar · male · 옵션 -
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 1986-07-08T19:00 · precision exact · 학파 yeonhae
- 명식: 연 丙寅(byeong-in) · 월 乙未(eul-mi) · 일 癸丑(gye-chuk) · 시 壬戌(im-sul) — GOLDEN-PILLARS confirmed
- 층 원본 (일간 제외 천간): 연 丙byeong=정재(jeongjae), 월 乙eul=식신(siksin), 시 壬im=겁재(geopjae)
- 층 원본 (지지 정기): 연 寅→甲gap=상관(sanggwan), 월 未→己gi=편관(pyeongwan), 일 丑→己gi=편관(pyeongwan), 시 戌→戊mu=정관(jeonggwan)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 寅[戊7 丙7 甲16] · 월 未[丁9 乙3 己18] · 일 丑[癸9 辛3 己18] · 시 戌[辛9 丁3 戊18]
- 표층십신 geopjae=1 siksin=1 sanggwan=1 jeongjae=1 pyeongwan=2 jeonggwan=1 · 장간십신 bigyeon=1 geopjae=1 siksin=2 sanggwan=1 pyeonjae=2 jeongjae=2 pyeongwan=2 jeonggwan=2 pyeonin=2 · 표층오행 wood=2 fire=1 earth=3 water=1 · 장간오행 wood=3 fire=4 earth=4 metal=2 water=2 (일간 제외)
- 득령 **N** — 월지 未 정기 己gi → 편관(pyeongwan) ∉ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **Y** — 일지 丑 장간 癸=비견(bigyeon) 辛=편인(pyeonin) 己=편관(pyeongwan) → 돕는 것 癸 辛 [deukji.day-branch-support]
- 득세 **N** 1:5 — 월지 제외 표층 [연간 丙=정재, 월간 乙=식신, 시간 壬=겁재, 연지정기 甲=상관, 일지정기 己=편관, 시지정기 戊=정관] → 돕는 1 < 나머지 5 [deukse.surface-majority-ge]
- 투간: 연지 중기 丙 → 연간 · 월지 중기 乙 → 월간 · 일지 여기 癸 → 일간 (일간 포함 천간에 같은 글자)
- 통근: 일지 여기 癸 (일간 오행 水 장간)
- 사령: 소서(soseo) 1986-07-07T19:01 KST → 출생 1986-07-08T19:00 = 1439분 = 0.999일 · 경계 [9, 12]일 → **丁 여기** · 경계와 거리 [8.001, 11.001]일 → 사령경계 N (≤ 1일)
- 일간합 - · 월지충 chuk-mi@day · 일지관계 hyeong:chuk-sul-mi@month+day+time chung:chuk-mi@month+day · 化재료 -
- 조후: 여름(summer) fire=1 water=2 (일간 **포함** 표층)
- 골든 셀 대조: 일치 16/16

## YNY 보강 후보 2행 (골든 아님)

REPORT HO-2026-0923-saju-L2-stage8a-01 §2. 명식은 코어 산출이며 GOLDEN-PILLARS에 없다 — 편입 전 일진·절입 KASI 대조가 필요하다. 두 행 모두 득세 동률(`≥`)이라 `surface-majority-gt` 대안에서는 YNN이 된다.

### S-YNY-1 — 일간 丁jeong · 득령득지득세 YNY · 후보(골든 아님)

- 입력: 1995-02-15 12:00 · solar · female · 옵션 -
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 1995-02-15T12:00 · precision exact · 학파 yeonhae
- 명식: 연 乙亥(eul-hae) · 월 戊寅(mu-in) · 일 丁丑(jeong-chuk) · 시 丙午(byeong-o) — **코어 산출, 일진·절입 KASI 대조 전**
- 층 원본 (일간 제외 천간): 연 乙eul=편인(pyeonin), 월 戊mu=상관(sanggwan), 시 丙byeong=겁재(geopjae)
- 층 원본 (지지 정기): 연 亥→壬im=정관(jeonggwan), 월 寅→甲gap=정인(jeongin), 일 丑→己gi=식신(siksin), 시 午→丁jeong=비견(bigyeon)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 亥[戊7 甲7 壬16] · 월 寅[戊7 丙7 甲16] · 일 丑[癸9 辛3 己18] · 시 午[丙10 己9 丁11]
- 표층십신 bigyeon=1 geopjae=1 siksin=1 sanggwan=1 jeonggwan=1 pyeonin=1 jeongin=1 · 장간십신 bigyeon=1 geopjae=3 siksin=2 sanggwan=3 pyeonjae=1 pyeongwan=1 jeonggwan=1 pyeonin=1 jeongin=2 · 표층오행 wood=2 fire=2 earth=2 water=1 · 장간오행 wood=3 fire=4 earth=5 metal=1 water=2 (일간 제외)
- 득령 **Y** — 월지 寅 정기 甲gap → 정인(jeongin) ∈ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **N** — 일지 丑 장간 癸=편관(pyeongwan) 辛=편재(pyeonjae) 己=식신(siksin) → 돕는 것 없음 [deukji.day-branch-support]
- 득세 **Y** 3:3 — 월지 제외 표층 [연간 乙=편인, 월간 戊=상관, 시간 丙=겁재, 연지정기 壬=정관, 일지정기 己=식신, 시지정기 丁=비견] → 돕는 3 ≥ 나머지 3 (동률 = 득세) [deukse.surface-majority-ge]
- 투간: 연지 여기 戊 → 월간 · 월지 여기 戊 → 월간 · 월지 중기 丙 → 시간 · 시지 여기 丙 → 시간 · 시지 정기 丁 → 일간 (일간 포함 천간에 같은 글자)
- 통근: 월지 중기 丙 · 시지 여기 丙 · 시지 정기 丁 (일간 오행 火 장간)
- 사령: 입춘(ipchun) 1995-02-04T16:13 KST → 출생 1995-02-15T12:00 = 15587분 = 10.824일 · 경계 [7, 14]일 → **丙 중기** · 경계와 거리 [3.824, 3.176]일 → 사령경계 N (≤ 1일)
- 일간합 - · 월지충 - · 일지관계 - · 化재료 -
- 조후: 봄(spring) fire=3 water=1 (일간 **포함** 표층)
- 근거: REPORT HO-2026-0923-saju-L2-stage8a-01 §2 YNY 보강 후보. 골든 편입 = GOLDEN-PILLARS 선등록 + 일진·절입 KASI 대조 뒤.

### S-YNY-2 — 일간 乙eul · 득령득지득세 YNY · 후보(골든 아님)

- 입력: 1995-11-10 12:00 · solar · female · 옵션 -
- 정규화 KST(월주·사령 기준, 진태양시 미적용): 1995-11-10T12:00 · precision exact · 학파 yeonhae
- 명식: 연 乙亥(eul-hae) · 월 丁亥(jeong-hae) · 일 乙巳(eul-sa) · 시 壬午(im-o) — **코어 산출, 일진·절입 KASI 대조 전**
- 층 원본 (일간 제외 천간): 연 乙eul=비견(bigyeon), 월 丁jeong=식신(siksin), 시 壬im=정인(jeongin)
- 층 원본 (지지 정기): 연 亥→壬im=정인(jeongin), 월 亥→壬im=정인(jeongin), 일 巳→丙byeong=상관(sanggwan), 시 午→丁jeong=식신(siksin)
- 층 원본 (지장간 여기→중기→정기, 숫자 = 사령 일수): 연 亥[戊7 甲7 壬16] · 월 亥[戊7 甲7 壬16] · 일 巳[戊7 庚7 丙16] · 시 午[丙10 己9 丁11]
- 표층십신 bigyeon=1 siksin=2 sanggwan=1 jeongin=3 · 장간십신 bigyeon=1 geopjae=2 siksin=2 sanggwan=2 pyeonjae=1 jeongjae=3 jeonggwan=1 jeongin=3 · 표층오행 wood=1 fire=3 water=3 · 장간오행 wood=3 fire=4 earth=4 metal=1 water=3 (일간 제외)
- 득령 **Y** — 월지 亥 정기 壬im → 정인(jeongin) ∈ 돕는 십신(비겁·인성) [deukryeong.primary-support]
- 득지 **N** — 일지 巳 장간 戊=정재(jeongjae) 庚=정관(jeonggwan) 丙=상관(sanggwan) → 돕는 것 없음 [deukji.day-branch-support]
- 득세 **Y** 3:3 — 월지 제외 표층 [연간 乙=비견, 월간 丁=식신, 시간 壬=정인, 연지정기 壬=정인, 일지정기 丙=상관, 시지정기 丁=식신] → 돕는 3 ≥ 나머지 3 (동률 = 득세) [deukse.surface-majority-ge]
- 투간: 연지 정기 壬 → 시간 · 월지 정기 壬 → 시간 · 시지 정기 丁 → 월간 (일간 포함 천간에 같은 글자)
- 통근: 연지 중기 甲 · 월지 중기 甲 (일간 오행 木 장간)
- 사령: 입동(ipdong) 1995-11-08T06:36 KST → 출생 1995-11-10T12:00 = 3204분 = 2.225일 · 경계 [7, 14]일 → **戊 여기** · 경계와 거리 [4.775, 11.775]일 → 사령경계 N (≤ 1일)
- 일간합 - · 월지충 sa-hae@day · 일지관계 chung:sa-hae@year+day chung:sa-hae@month+day · 化재료 jeong-im@month+time:wood m=N x=Y
- 조후: 겨울(winter) fire=3 water=3 (일간 **포함** 표층)
- 근거: REPORT HO-2026-0923-saju-L2-stage8a-01 §2 YNY 보강 후보. 골든 편입 = GOLDEN-PILLARS 선등록 + 일진·절입 KASI 대조 뒤.
