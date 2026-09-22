# 골든 명식 표 (정본)

이 표가 사주 계산 코어의 **기대값 정본**이다. `packages/saju-core/src/golden-pillars.test.ts`가 이 파일을 직접 파싱해
`calculatePillars`와 대조한다(열 이름으로 매핑하므로 열 순서는 자유). 규칙:

- **출처 열이 비어 있거나 «commonly listed / widely listed / 알려짐» 류 문구면 테스트가 실패한다.** 출처는 URL 또는 서지(문서명·판·쪽)여야 한다.
  연·월주의 출처는 KASI 24기 표(`docs/fixtures/kasi-24-solar-terms-1920-2100_20260902.txt`)로 충분하지만, **일주는 60갑자 일수 세기라 별도 외부 출처**(data.go.kr 「한국천문연구원_음양력 정보」 `getLunCalInfo`의 `lunIljin` 등)를 붙인다.
- 간지는 로마자 라벨로 적는다: 천간 `gap eul byeong jeong mu gi gyeong sin im gye`, 지지 `ja chuk in myo jin sa o mi sin yu sul hae`. 기둥 = `천간-지지`(예 `gi-sa`). 시각 미상은 시각 열 `-`, 시주 열 `-`.
- 시각은 **그날의 한국 시계값**이다(코어가 KST로 환산한다). 범주 열에 `UTC+8:30`·`DST`가 붙은 행은 환산이 결과를 바꾸는 사례다.
- 행 추가는 PR로만, 검증자·일자 열 필수. 케이스 수집은 역술가 트랙·사용자 몫이고 이 파일은 그 착지점이다.

## 표

| id | 생년월일 | 시각 | 달력 | 성별 | 연주 | 월주 | 일주 | 시주 | 출처 | 검증자 | 일자 | 범주 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| g-1990-01-01-1030 | 1990-01-01 | 10:30 | solar | other | gi-sa | byeong-ja | byeong-in | gye-sa | KASI 24기 표(`docs/fixtures/kasi-24-solar-terms-1920-2100_20260902.txt`) 1989-12-07 12:21 대설 후·1990-02-04 11:14 입춘 전 · 일진 data.go.kr 한국천문연구원_음양력 정보 `getLunCalInfo?solYear=1990&solMonth=01&solDay=01` → 병인(丙寅)(조회 2026-09-22) | saju-lab 워커(Claude Opus 5) | 2026-09-22 | 기본 | HO-A 골든(金 부재). 구 fixtures.ts 이관 |
| g-2000-02-04-1200 | 2000-02-04 | 12:00 | solar | other | gi-myo | jeong-chuk | im-jin | byeong-o | KASI 24기 표(`docs/fixtures/kasi-24-solar-terms-1920-2100_20260902.txt`) 2000-01-06 10:01 소한 후·2000-02-04 21:40 입춘 전 · 일진 data.go.kr 한국천문연구원_음양력 정보 `getLunCalInfo?solYear=2000&solMonth=02&solDay=04` → 임진(壬辰)(조회 2026-09-22) | saju-lab 워커(Claude Opus 5) | 2026-09-22 | 절기경계 | 입춘 당일이나 시각이 입춘 전이라 기묘년. 구 fixtures.ts 이관 |
| g-2010-06-21-2359 | 2010-06-21 | 23:59 | solar | other | gyeong-in | im-o | im-in | gyeong-ja | KASI 24기 표(`docs/fixtures/kasi-24-solar-terms-1920-2100_20260902.txt`) 2010-06-06 03:49 망종 후·2010-07-07 14:02 소서 전 · 일진 data.go.kr 한국천문연구원_음양력 정보 `getLunCalInfo?solYear=2010&solMonth=06&solDay=21` → 임인(壬寅)(조회 2026-09-22) | saju-lab 워커(Claude Opus 5) | 2026-09-22 | 기본·23시대 | 23:59는 자시, 일주는 당일 유지(현행 야자시 정책). 구 fixtures.ts 이관 |
| g-2015-12-22-0030 | 2015-12-22 | 00:30 | solar | other | eul-mi | mu-ja | im-sin | gyeong-ja | KASI 24기 표(`docs/fixtures/kasi-24-solar-terms-1920-2100_20260902.txt`) 2015-12-07 19:53 대설 후 · 일진 data.go.kr 한국천문연구원_음양력 정보 `getLunCalInfo?solYear=2015&solMonth=12&solDay=22` → 임신(壬申)(조회 2026-09-22) | saju-lab 워커(Claude Opus 5) | 2026-09-22 | 기본 | 구 fixtures.ts 이관 |
| g-2024-02-04-1727 | 2024-02-04 | 17:27 | solar | other | gap-jin | byeong-in | mu-sul | sin-yu | KASI 24기 표(`docs/fixtures/kasi-24-solar-terms-1920-2100_20260902.txt`) 2024-02-04 17:27 입춘 동시각(경계 포함) · 일진 data.go.kr 한국천문연구원_음양력 정보 `getLunCalInfo?solYear=2024&solMonth=02&solDay=04` → 무술(戊戌)(조회 2026-09-22) | saju-lab 워커(Claude Opus 5) | 2026-09-22 | 절기경계 | 입춘 동시각 = 새 연·월주. 구 fixtures.ts 이관 |
| g-2011-11-08-0334 | 2011-11-08 | 03:34 | solar | female | sin-myo | mu-sul | jeong-myo | im-in | KASI 24기 표(`docs/fixtures/kasi-24-solar-terms-1920-2100_20260902.txt`) 2011-11-08 03:35 입동 1분 전 · 일진 data.go.kr 한국천문연구원_음양력 정보 `getLunCalInfo?solYear=2011&solMonth=11&solDay=08` → 정묘(丁卯)(조회 2026-09-22) | saju-lab 워커(Claude Opus 5) | 2026-09-22 | 절기경계 | HO-L1-spike C9 회귀: 입동 정본 03:35(구 API 09:26 오류) |
| g-2011-11-08-0335 | 2011-11-08 | 03:35 | solar | female | sin-myo | gi-hae | jeong-myo | im-in | KASI 24기 표(`docs/fixtures/kasi-24-solar-terms-1920-2100_20260902.txt`) 2011-11-08 03:35 입동 동시각 · 일진 data.go.kr 한국천문연구원_음양력 정보 `getLunCalInfo?solYear=2011&solMonth=11&solDay=08` → 정묘(丁卯)(조회 2026-09-22) | saju-lab 워커(Claude Opus 5) | 2026-09-22 | 절기경계 | C9 회귀. 03:35~09:25 출생은 기해월 |
| g-2011-11-08-0925 | 2011-11-08 | 09:25 | solar | female | sin-myo | gi-hae | jeong-myo | eul-sa | KASI 24기 표(`docs/fixtures/kasi-24-solar-terms-1920-2100_20260902.txt`) 2011-11-08 03:35 입동 후 · 일진 data.go.kr 한국천문연구원_음양력 정보 `getLunCalInfo?solYear=2011&solMonth=11&solDay=08` → 정묘(丁卯)(조회 2026-09-22) | saju-lab 워커(Claude Opus 5) | 2026-09-22 | 절기경계 | C9 회귀. 구 표(09:26)로는 무술월이 되던 시각 |
| g-1955-02-04-2247 | 1955-02-04 | 22:47 | solar | male | gap-o | jeong-chuk | byeong-sin | mu-ja | KASI 24기 표(`docs/fixtures/kasi-24-solar-terms-1920-2100_20260902.txt`) 1955-02-04 23:18 입춘 = 당시 UTC+8:30 시계 22:48 → 22:47은 입춘 전 · tzdb 2026d Zone Asia/Seoul 8:30 (1954-03-21~1961-08-10) · 일진 data.go.kr 한국천문연구원_음양력 정보 `getLunCalInfo?solYear=1955&solMonth=02&solDay=04` → 병신(丙申)(조회 2026-09-22) | saju-lab 워커(Claude Opus 5) | 2026-09-22 | UTC+8:30·절기경계 | 시계값 22:47 = KST 23:17. 정규화 전엔 같은 결과 |
| g-1955-02-04-2248 | 1955-02-04 | 22:48 | solar | male | eul-mi | mu-in | byeong-sin | mu-ja | KASI 24기 표(`docs/fixtures/kasi-24-solar-terms-1920-2100_20260902.txt`) 1955-02-04 23:18 입춘 = 당시 UTC+8:30 시계 22:48(동시각) · tzdb 2026d Zone Asia/Seoul 8:30 · 일진 data.go.kr 한국천문연구원_음양력 정보 `getLunCalInfo?solYear=1955&solMonth=02&solDay=04` → 병신(丙申)(조회 2026-09-22) | saju-lab 워커(Claude Opus 5) | 2026-09-22 | UTC+8:30·절기경계 | 시계값 22:48 = KST 23:18. 정규화 전엔 갑오년 정축월로 계산되던 사례 |
| g-1988-10-09-0230 | 1988-10-09 | 02:30 | solar | male | mu-jin | im-sul | jeong-yu | sin-chuk | KASI 24기 표(`docs/fixtures/kasi-24-solar-terms-1920-2100_20260902.txt`) 1988-10-08 10:44 한로 후 · tzdb 2026d Rule ROK 1988 Oct Sun>=8 3:00 종료(02:00~02:59 두 번, 첫 발생 채택) · 일진 data.go.kr 한국천문연구원_음양력 정보 `getLunCalInfo?solYear=1988&solMonth=10&solDay=09` → 정유(丁酉)(조회 2026-09-22) | saju-lab 워커(Claude Opus 5) | 2026-09-22 | DST | 서머타임 종료일 중복 시각 → KST 01:30, 축시. resolution flags dst·ambiguous |

## 범주

`기본` · `절기경계` · `23시대` · `DST` · `UTC+8:30` · `시간미상` · `윤달` · `진태양시경계`

## 출처 채우기

- 연·월주: KASI 24기 표의 해당 절입 행(예 «KASI 24기 표 2011-11-08 03:35 입동»).
- 일주: `python scripts/fetch_golden_day_pillars.py 1990-01-01 2011-11-08 …` — data.go.kr 음양력 API에서 `lunIljin`(일진)을 받아 로마자 라벨과 인용 URL을 출력한다(환경변수 `PUBLIC_DATA_API_KEY`, 해당 API 활용신청 필요).
- 보조 검산(선택): lunar-typescript 등 교차 구현의 값을 비고 열에 «교차: …»로 적을 수 있으나 출처 열을 대신하지 못한다.
