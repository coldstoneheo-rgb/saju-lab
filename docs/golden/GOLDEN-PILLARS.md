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

## 범주

`기본` · `절기경계` · `23시대` · `DST` · `UTC+8:30` · `시간미상` · `윤달` · `진태양시경계`

## 출처 채우기

- 연·월주: KASI 24기 표의 해당 절입 행(예 «KASI 24기 표 2011-11-08 03:35 입동»).
- 일주: `python scripts/fetch_golden_day_pillars.py 1990-01-01 2011-11-08 …` — data.go.kr 음양력 API에서 `lunIljin`(일진)을 받아 로마자 라벨과 인용 URL을 출력한다(환경변수 `PUBLIC_DATA_API_KEY`, 해당 API 활용신청 필요).
- 보조 검산(선택): lunar-typescript 등 교차 구현의 값을 비고 열에 «교차: …»로 적을 수 있으나 출처 열을 대신하지 못한다.
