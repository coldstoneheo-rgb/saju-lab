# HO-2026-0923-saju-cross-impl-diff-01 — REPORT (draft, LC 판정 대기)

- 발주: LC `life-coordinator-a5` [HO] origin:user(09-22 18:2x 사용자 원문 인용 있음) · 발주서 `life-coordinator/handoffs/HO-2026-0923-saju-cross-impl-diff-01.md` (4223a53)
- 작업자: saju-lab 워커(Claude Opus 5.5) · 브랜치 `test/cross-impl-diff`(base main `79299e9`, 골든 50 포함)
- **머지 게이트**: LC 프로토콜 §9-4(ece80df, 09-23 사용자 승인) = ① verifier PASS ② LC 판정 「머지 가」. GitHub 리뷰 코멘트는 선택. 권한 계층이 머지를 막으면 우회하지 않고 사용자에게 알린다
- **코어 코드 변경 0.** 바뀐 것: `scripts/diff_cross_impl.mjs`(신규) · `scripts/cross-impl-kari-lunar-months.json`(신규, KARI 조회 기록) · `package.json`(devDependency 1 + 스크립트 1) · lock · `ci.yml`(별도 스텝 1) · `docs/CROSS-IMPL-DIFF.md`

## 1. 완료 조건

| # | 조건 | 결과 | 근거 |
| --- | --- | --- | --- |
| C1 | 라이선스·의존·오프라인 기록, devDependency 고정 | `lunar-typescript` **1.8.6** MIT · 의존 0 · 네트워크 호출 0 · `"lunar-typescript": "1.8.6"`(정확 고정) | CROSS-IMPL-DIFF §2 |
| C2 | 5,500+건 로그 + 분류 표, `unexplained` 0 | **5,550건**(무작위 5,000 + 골든 50 + 경계 500) + 음력 1,000건 · **unexplained 0** · 코어 거부 0 | CROSS-IMPL-DIFF §4 · `npm run diff:cross-impl` 종료코드 0 |
| C3 | 경계 500건의 절입 분 차이 분포 | 경계 절 300개: 최대 2.517분 · 평균 절대 0.484분 · 12절 전체 2,172개: 최대 2.517 · 평균 절대 0.489 | CROSS-IMPL-DIFF §4-2 |
| C4 | 십신·합충·대운 일치율 | 천간 십신 100% · 지장간 십신(japyeong) 100% · 충 100% · 대운 순역 100% · 대운 8주 간지 100% · 대운 거리 정확 일치 39.84%, 나머지는 절 시각 차로 전부 설명. 간합·육합·삼합·방합·형은 교차 구현이 제공하지 않음 | CROSS-IMPL-DIFF §4-3 |
| C5 | CI 별도 스텝 초록 · 기존 테스트 무변경 | `ci.yml` 스텝 「Cross-implementation diff」(verify 밖). 기존 테스트 파일 diff 0. CI 결과는 PR에서 확인 | 이 PR |

## 2. 분류 (시드 20260923)

| 분류 | 건수 | 의미 |
| --- | --- | --- |
| `solar-term-minute` | 4,241 | KASI(분 반올림, KST)와 lunar-typescript(천문 계산, 초 단위) 절입이 ≤ 3분 다르고 출생 시각이 그 사이에 있음. 대운 거리는 같은 절의 시각 차로 정확히 설명 |
| `ja-hour-policy` | 274 | 23시 子시의 시간: 코어 = 당일 일간, lunar-typescript = 다음 날 일간 |
| `lunar-table` | 44 | 한국 음력 ≠ 중국 농력인 달. 66개월 전부 KARI `getSolCalInfo`로 확인해 **66/66 코어 일치** |
| `hidden-stem-table` | 0 | 지장간 표 차이 없음 |
| **unexplained** | **0** | |

시드 1·42(골든 50 포함, main `79299e9` 기준 재실행): 둘 다 unexplained 0(solar-term-minute 4,249·4,274 / ja-hour-policy 294·283 / lunar-table 38·40).

## 3. 결함 후보 (코어 파일:줄)

**없음.** 발주서 §4대로 코어는 고치지 않았다. 참고할 관찰 2가지(결함 아님):
1. 골든 `g-2024-02-04-1727` · `g-1975-02-04-1959` · `g-1936-03-06-0249`(KASI 분과 같은 시각)는 lunar-typescript에서는 이전 절이다. 그쪽 절입이 초 단위로 0.1~0.2분 늦기 때문이다. 코어의 「동시각 = 새 절」(`solar-terms.ts:81`)은 KASI 분 표기를 따른 규칙이고, 골든으로 이미 고정돼 있다.
2. 23시 子시 시간(時干)은 학파가 갈리는 지점이다(코어 = 야자시 당일 일간). 정책 차이로 기록했다.

## 4. 게이트가 떨어지는지 (변이 시험)

입춘 181개를 +10분 옮긴 `solar-terms.data.ts` 사본으로 실행 → **unexplained 577, 종료코드 1**(대운 거리 560 · 월주 16 · 연주 1). 원복 뒤 다시 0.

## 5. 설계 결정 (발주서 §5 반박 가능 항목)

1. **라이브러리** = lunar-typescript(TS 타입 동봉, 1.8.6). lunar-javascript 1.7.7도 MIT·의존 0이지만 같은 저자의 같은 알고리즘이라 둘 다 쓸 이득이 없다.
2. **건수·시드** = 발주서 그대로(5,000 + 골든 전 건 + 경계 500, 시드 20260923). 음력 1,000건 추가.
3. **분류 임계** `TERM_TOLERANCE_MIN = 3`분 — 실측 최대 2.517분 위. 대운 거리는 임계가 아니라 건마다 「그 절의 두 시각 차」로 설명(잔차 < 1분).
4. **별도 스텝**(verify에 넣지 않음) — 실행 39~70초. verify는 빠른 게이트로 둔다.
5. **`tz-normalization` 분류 없음** — lunar-typescript에 한국 시간대 이력이 없어 코어가 정규화한 KST를 두 쪽에 넣었다. 정규화 검증은 tzdb 픽스처 테스트가 맡는다(CROSS-IMPL-DIFF §6 한계).
6. **음력 설명은 KARI 조회 기록에 묶음** — 「중국 농력이라 다르다」는 추정만으로는 설명으로 치지 않는다. 다른 달 66개를 KARI로 전부 확인해 JSON에 쿼리와 함께 남겼고, 스크립트는 그 목록에 있는 달만 `lunar-table`로 받는다.

## 6. 리뷰 지적·처리

독립 verifier 서브에이전트 — **PASS with notes**, 2026-09-23.

| # | 지적 | 근거(verifier 실측) | 처리 |
| --- | --- | --- | --- |
| V-A | 코어·앱 변경 0, 기존 테스트 변경 0 | `git diff --name-only`에 packages/·apps/ 없음 | 확인만 |
| V-B | verify·차분 재실행 | verify exit 0(675) · `diff:cross-impl` exit 0, §4 수치가 소수점까지 재현 | 확인만 |
| V-C | 분류기 4규칙 | 전부 이중 조건(사이+임계, 잔차+임계, 오서둔 양쪽 독립 검산, KARI 확인 달). 동어반복 없음. L2는 명식 완전 일치 94.7% 표본에서 실행 | 확인만 |
| V-D | 가상 결함 3종(오서둔·충 쌍·음년 여성 순역)이 unexplained로 드러나는지 | 코드 추적으로 세 경로 모두 드러남 | 확인만(실제 변이 시험은 §4) |
| V-E | KARI 3건 실호출(1927-10·1958-01·1997-01) + `--lunar-month-diffs` 재생성 = 커밋된 JSON과 필드까지 일치 | | 확인만 |
| **V-F** | **REPORT §2의 시드 1·42 수치가 재현 안 됨(+14·+3 차이)** — 중 | 재실행 4,249·4,274 / 294·283 | **반영**. 원인: rebase 전(골든 11행) 실행 값을 그대로 적었다. 골든 39행이 늘어난 만큼 설명된 건수가 늘었다. main `79299e9` 기준으로 다시 돌려 고쳤다 |
| V-G | 천간·지지 한자↔로마자 대응(`STEM_H`/`BRANCH_H` ↔ `core.STEMS`/`BRANCHES`)을 스크립트가 상속한다 — 낮음 | 스크립트 75~76행 | CROSS-IMPL-DIFF §6 한계에 한 줄 추가 |

## 7. 남은 것

- 머지: LC 판정 「머지 가」 뒤(§9-4).
- 이전 PR #83 뒷정리(브랜치 `golden/g39-add` 원격·로컬, `../saju-lab-g39` worktree 삭제): 분류기 차단 해소(사용자 allow 규칙) 대기.
