# CLOUD-2026-1103 §22 — saju wave4 #130 게이트 관찰 후속 REPORT

발주: LC `CLOUD-2026-1103-wave5-19-22.md` §22 (HO, origin: lc). 범위 = #130 게이트 관찰 2건만: (1) 테스트 타임아웃 플레이크, (2) 설계서 §1 `yongsinCandidates` 라벨.
브랜치 `cloud/saju-wave4-followups` (origin/main cfdeef8에서 분기).

## 시작 시 확인 (2026-11-03T04:03:27Z, `date -u`)
- origin/main = cfdeef8(#130). AGENT_STATUS·git log 기준 두 항목 모두 미착수다. 설계서 §1 표의 `yongsinCandidates` 행은 «같음» 그대로였다. `include-blocks.test.ts`도 #130 이후 변경 0이었다.

## 체크리스트
| # | 조건 | 상태 | 근거 |
| --- | --- | --- | --- |
| 1 | 플레이크 원인 실측 | ✓ | 아래 «측정 표» — `l2/include-blocks.test.ts` «모든 레코드의 키 = 필수 ⊆ 키 ⊆ 필수 ∪ 선택»이 6병렬 경합 12회 중 4회 5087–5289ms로 5000ms 기본 타임아웃을 넘음 |
| 2 | 수정 + 반복 통과 | ✓ | 5a871d0: 경합 18회 실패 0, I3 585–896ms. 임계값 변경 0 |
| 3 | 설계서 §1 정정 | ✓ | 71e8ca4: `yongsinCandidates` 셀 1줄 정정. `gyeokguk` 셀도 1줄 고쳤다(사유는 «발견 2») |
| 4 | CI green · 테스트 수치 | 로컬 ✓ / CI는 PR 본문 | 로컬 `npm run verify` EXIT 0: api 125 · core 1070 · web 49 = 1244(#130과 같음, 감소 0) · audit 0 · `diff:cross-impl` unexplained 0 PASS |
| 5 | apps/web·층 노출·13단계 0 | ✓ | `git diff --stat origin/main -- apps/web packages/saju-core/src/l2/__snapshots__ api/_lib/__snapshots__` = 빈 출력. `KEYLESS_INCLUDE_BLOCKS`·골든 파일·코드 변경 0(테스트 파일 1개만) |
| 6 | AGENT_STATUS · WORKLOG | ✓ | as_of 2026-11-03T13:11:22+09:00(실측) |
| 7 | PR · REPORT | ✓ | 이 파일 + PR 본문 |

## 측정 표 (완료 조건 1·2)
`S`는 세션 scratchpad 경로다. 기준은 vitest v4.1.12, 기본 testTimeout 5000ms(`vitest.config.ts`에 설정 없음), 4 vCPU VM이다.

| 조건 | 명령 | 반복 | 결과 | 가장 느린 테스트(ms) |
| --- | --- | --- | --- | --- |
| CI 로그(#130·main) | `gh api …/actions/jobs/<id>/logs` | 3 run (41553161948 · 41479124113 · 41479099029) | 전부 success attempt 1 | I3 931 · 559 · 662 |
| 수정 전, 단독 | `npx vitest run src --reporter=json` (core) | 1 | 1070/0 | I3 761 |
| 수정 전, 1 CPU 고정 | `taskset -c 0 npx vitest run src` | 3 | 3/3 통과 | I3 806 · 756 · 875 |
| 수정 전, `npm test` 4병렬 | 루트 `npm test` × 4 동시 | 3 라운드 = 12 | 12/12 통과 | (요약 리포터라 개별 시간 없음) |
| **수정 전, core 6병렬** | `npx vitest run src --reporter=json` × 6 동시 | 2 라운드 = 12 | **4/12 실패(1069/1)** | **I3 4064–5289**(실패 4건 5087·5190·5214·5289) |
| 원인 분해 | 임시 계측 테스트(커밋 안 함) | 3 | 응답 생성 127–157ms vs **단언 433–498ms** | 레코드 1,425개, `expect()` 23,676회 |
| **수정 후, core 6병렬** | 같은 명령 | 3 라운드 = 18 | **18/18 통과, 실패 0** | I3 585–896 · 전체 최댓값 2206(golden-gyeokguk 분포) |

**원인**: I3 레코드 키 검사는 골든 50 × 두 학파 × 5블록의 레코드 1,425개를 돈다. 키마다 메시지 템플릿 문자열을 만들고 `expect().toContain()`을 불러 단언이 23,676회에 이르렀다. 시간의 약 75%가 응답 계산이 아니라 단언 오버헤드였다. CPU 경합(verifier와 verify 동시 실행, 느린 러너)이 생기면 5s를 넘는다.

**수정**: 위반을 문자열 배열로 모으고 마지막에 `expect(violations).toEqual([])`를 한 번만 부른다. 검사 내용(필수 키 존재, 모르는 키 0, `doctrine === "unreviewed"`)은 같다. 실패 메시지에는 명식 id·학파·블록·키가 그대로 남는다. 변이 2건으로 판정기를 확인했다(sinsal 필수에서 `precision`을 빼면 «모르는 키»로 실패, 필수에 `bogus`를 넣으면 «필수 키 bogus 없음»으로 실패). 임계값은 늘리지 않았다.

## 한 일
- 5a871d0 `packages/saju-core/src/l2/include-blocks.test.ts` I3 레코드 키 검사: 위반을 모은 뒤 단언을 한 번만 한다.
- 71e8ca4 `docs/design/l2-include-design.md` §1 표: `yongsinCandidates` 레코드 공통 라벨을 `doctrine: "unreviewed"`만으로 고쳤다(`school`·`precision` 없음). `gyeokguk` 셀은 «같음» 대신 «`strengthReadings`와 같음»으로 적었다.

## 발견
1. **CI에서는 재현되지 않았다**: #130·main CI 3회 모두 1회차 success였고, I3 최댓값은 931ms다. 타임아웃은 로컬 경합(6병렬)에서만 재현됐다. #130 PR 본문에는 플레이크 서술이 없다. 관찰 출처는 LC 게이트 쪽 로컬 실행으로 보인다(확인 불가, LC 문서는 이 세션에서 읽지 못함).
2. **설계서 «같음» 연쇄**: `gyeokguk` 행의 «같음»이 바로 위 `yongsinCandidates` 행을 가리켰다. 용신 행만 고치면 격국 라벨(`school`·`precision`·`doctrine`, 테스트 `RECORD_KEYS` 확인)이 틀리게 읽힌다. 그래서 격국 셀도 1줄 고쳤다. 결과는 «1줄 정정»이 아니라 2줄이다.
3. **남은 위험(이번 범위 밖)**: 수정 전 6병렬에서 두 번째로 느린 테스트는 `l2/golden-gyeokguk.test.ts` «분포 고정(골든 50, yeonhae)»으로 최대 3237ms였다(수정 후 18회 최대 2206ms). 지금은 5s 안이지만, 경합이 더 심해지면 다음 후보다. 수정하지 않았다.

## LC·사용자에게 필요한 것
- [LC] 플레이크를 처음 관찰한 환경(로컬 병렬 실행 여부)과 이 재현 조건이 같은지 확인 — 다르면 그 로그 1건.
- [LC] 발견 3(gyeokguk 분포 테스트 여유 약 1.5배)을 별건으로 둘지 판정.

## 변경 파일
`packages/saju-core/src/l2/include-blocks.test.ts` · `docs/design/l2-include-design.md` · `docs/handoffs/CLOUD-2026-1103-saju-followups-REPORT.md`(신규) · `AGENT_STATUS.json` · `WORKLOG.md`

effort: 세션 기본값(올리지 않음).
총 경과: PR 본문 참조 · 사용 모델: 정책상 미기재
