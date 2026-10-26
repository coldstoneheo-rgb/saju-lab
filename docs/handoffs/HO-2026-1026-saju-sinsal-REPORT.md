# HO-2026-1026-saju-sinsal-01 — REPORT

발주 = `life-coordinator/handoffs/HO-2026-1026-saju-sinsal-01.md`. 워커 = saju-lab 창(Claude Opus 5.5, 세션 effort medium · critic high). 분기 = main d8af620. 2026-10-26 오후 KST, 사용자 여행 중 RC 루프. 배포 0 · AI 해석 코드 0 · 외부 서지 조달 0 · worktree 0(순차·스택 브랜치).

## 체크리스트 (완료 조건 번호)

- [x] 1. 계획 REPLY — 반박 ①(괴강 戊戌 = 옵션 플래그 대신 상시 변형 `goegang.day-mu-sul`) LC 수용
- [x] 2. S1 `docs/rules/SINSAL.md` + `l2/sinsal.data.ts` + 파서 테스트 8 → #117 **3360b36**
- [x] 3. S2·S4·S5 `l2/sinsal.ts` `sinsalOf` + 테스트 10(경계 4종 · 어휘 가드 · 계약) → #118 **6890af1**
- [x] 4. S3 `GOLDEN-SINSAL.md` 50×13 `pending` + md 오라클 + 코어 대조 · 적중 0 칸 0 → 보강 0행 → #119 **16302f2**
- [x] 5. S6 PR마다 `npm run verify` EXIT 0 · verifier PASS · LC 게이트(아래 표)
- [x] 6. `docs/design/l2-include-design.md` → #120 **963b92b**
- [~] 7. 8a confirmed + 파생 골든 3장 → #121(critic PASS, LC 게이트 요청 — 이 REPORT 작성 시점 미머지)
- [x] 8. 인계 블록(이 REPORT · AGENT_STATUS · WORKLOG + 관찰 묶음 정리) → 이 PR

## 한 일

| PR | 범위 | critic (verifier, high) | LC 게이트 | 머지 |
| --- | --- | --- | --- | --- |
| #117 | S1 SINSAL.md 7종 표(변형 13) · 상수 · 파서 8 | PASS · 변이 12 · 관찰 4 | PASS · 관찰 3 | 3360b36 |
| #118 | S2·S4·S5 sinsalOf · 테스트 10 · CROSS-IMPL-DIFF · API 문서 | PASS · 손 유도 6명식 · 변이 9 · 관찰 5 | PASS · 관찰 4 | 6890af1 |
| #119 | S3 GOLDEN-SINSAL 50×13 pending · 오라클 테스트 4 | PASS · 손 유도 14행 · 변이 4 · 관찰 3 | PASS · 관찰 3 | 16302f2 |
| #120 | include 개방 설계서(코드 0) | 생략(발주서 허용) | PASS · 관찰 2 | 963b92b |
| #121 | 8a 50행 confirmed · OPEN_REVIEW_ROUND 삭제 · 파생 3장 · STRENGTH.md 명문화 | PASS · 8a 값 셀 변경 0 · 파생 50행 전수 재유도 · 변이 6 · 권고 3 | 요청 | — |
| 이 PR | 인계 + 관찰 정리(아래) | — | 요청 | — |

critic·LC 판정 전문은 각 PR 코멘트.

## 검증 (명령 · 결과)

| 명령 | 결과 |
| --- | --- |
| `npm run verify` #117 | EXIT 0 · api 115 · core 868 → **876** · web 49 |
| `npm run verify` #118 | EXIT 0 · core **886** |
| `npm run verify` #119 | EXIT 0 · core **890** |
| `npm run verify` #121(main 병합 뒤) | EXIT 0 · core **1049** |
| `npm run golden:strength-pack -- --check` | 골든 50행 × 16셀 일치 |
| CI `verify` #117~#121 | pass. Vercel 체크는 «Deployment rate limited»(빌드 한도, 코드 무관) |
| 변이(워커) | md 백호 셀 → 1 fail · 자기 제외 제거 → 2 fail · 주석 금지어 → 1 fail · precision 고정 → 1 fail (전부 원복) |

## 발견

1. **괴강 서지 — 레포 내 근거 0.** `grep -rn '괴강|魁罡' docs`에서 나오는 것은 8b REPORT:56(«verifier 기억, 서지 미확인»)과 설계서뿐이다. 기본값으로 진행했다: 일주 4쌍 · 戊戌 판본 · 네 기둥 3변형을 상시 실행하고, 「壬戌 제외」 판본은 실행하지 않는다. 설계서 §2 각주와 사용자 확인 목록 1에 적었다.
2. **골든 50 신살 분포** — 적중 0 칸 0이라 보강 0행이다(변형별 기준은 `GOLDEN-SINSAL.md` 머리 · #119 본문 표). 천을귀인 A·B 차이는 庚 일간 한 행뿐이다. 그래서 골든 50에서 A만 적중하는 행은 g-2017-09-30-1305, B만 적중하는 행은 g-2020-05-27-2000이다.
3. **8a 재계산(LC)** — 800셀이 일치했다. 해석 변경 1(일지관계 2자·3자 정렬)은 md가 모호했던 탓이었고, 코드(`interactions.ts` 생성 순서)로 «완전 3자 전부 먼저»가 맞음을 확인해 `STRENGTH.md`에 명문화했다. §8 제안 5건은 전부 수용했다(④는 골든 셀 형식 표로 위치 변경). 근거는 #121 본문 표.
4. **파생 골든 confirmed 근거의 범위(#121 critic 권고 ①)** — 코드 독립 오라클이 덮는 셀은 verdict · 후보 id 집합 · 취격 요약뿐이다. 발화 conditionId · 세트일치 · 후보 순서 · 후보수는 코어 산출이다. 그중 conditionId · 세트일치 · id 집합은 critic이 50행 전수 재유도로 대조했고, 후보 순서는 코어 의존이다. 실행 축 confirmed의 경로가 설계 §4의 «LC 독립 재계산»에서 «LC 재계산으로 confirmed된 8a 위 md 유도»(발주서 LC 보강 ③)로 바뀌었다는 점을 세 표 머리말에 적었다.
5. **워커 사고 1건 — 공유 작업 트리.** critic이 SINSAL.md 변이를 돌리는 동안 워커가 같은 트리에서 골든 셀을 생성했다. 그 결과 g-1994 한 행의 cheoneul.b가 변이된 표로 만들어졌다. 테스트가 잡았고(오라클·코어 둘 다 불일치), 깨끗한 md로 다시 생성해 1행만 정정했다. 교훈: **critic 실행 중에는 작업 트리를 읽는 생성 작업을 하지 않는다**(이후 scratchpad에서만 초안 작성).
6. **스택 PR 운용** — #117→#118→#119를 쌓고, 머지 때마다 `gh pr edit --base main`과 `git rebase --onto`로 정리했다. squash 뒤 rebase에서 이미 반영된 패치는 자동 drop됐다. 충돌 0.

## 관찰 처리 (이 PR)

| 출처 | 관찰 | 처리 |
| --- | --- | --- |
| #118 LC ① · #120 LC ① | `index.ts`가 `sinsalOf` 등 미export | include 설계서 §5에 I7 «블록 여는 PR에서 export» 추가 |
| #118 LC ④ | 주석 «no 길흉» | `sinsal.ts`·`sinsal.data.ts` 영문화(«no good/bad labels») |
| #119 LC ① | GOLDEN-SINSAL에 출처 열 없음 | 머리말에 표 단위 출처 1줄 + confirmed PR에서 열 추가 명시 |
| #119 critic ② · LC ② | «네 기둥만» 단언 약함 | `day-mu-sul === "-"` 조건 추가 |
| #119 critic ③ · LC ③ | 설계서 §4 «50×7종» | «50 × 변형 13열»로 정정 |
| #120 LC ② | 학설 축 ↔ 괴강 서지 연결 | include 설계서 §1에 1줄 |
| #118 critic ③ | 설계서 §3에 precision 없음 | #119에서 반영 |

## 테스트가 실행한 분기

| 대상 | 분기 | 테스트 |
| --- | --- | --- |
| S1 | md ↔ 상수(표 1~6) · 삼합 = INTERACTIONS SAMHAP · A/B 차이 = 庚 1행 · 짜임(도화·역마·화개) · 양인 = 격국 표(정의 1곳) · 60갑자 음양 | `sinsal.data.test.ts` |
| S2·S4·S5 | 손 계산 실명식 · 순서·결정성 · 시각 미상 · 자기 제외(연·일) · 천을 A/B · 괴강 戊戌/연주/네 기둥 · 양인 음간 미실행 · 키 집합 · 어휘 · include 거절 | `sinsal.test.ts` |
| S3 | 행·명식·형식 · md 오라클 = 셀 · 코어 = 셀 · 분포·보강 기준 | `golden-sinsal.test.ts` |
| 7 | 8a 전 행 confirmed · 파생 3장 코어 대조 · 실행 confirmed ⇒ 8a confirmed | `golden-strength-factors.test.ts` · `golden-l2-derived.test.ts` |

## LC·사용자에게 필요한 것

- LC: #121 게이트(파생 confirmed 경로 인정 여부 — 발견 4) · 이 PR 게이트.
- 사용자: 아래 확인 목록(전부 기본값으로 진행 중, 막는 것 없음).

## 사용자 확인 목록 (기본값으로 진행 중, 결정 시 바꾼다)

1. **(신규) 괴강 판본** — 레포 내 서지가 없다. 기본값은 일주 4쌍 · 戊戌 포함 · 네 기둥 3변형 상시 실행이고, 「壬戌 제외」 판본은 미실행이다. 서지를 주시면 변형을 나눈다.
2. **(신규) 9단계 층 노출 범위** — `docs/design/l2-include-design.md` §4 표의 «제안 기본값» 열. 결정 전에는 데이터 블록만 열고 화면 노출은 0이다. 가격·약관 문안은 범위 밖이다.
3. **(신규) include 의존 블록 자동 포함** — 기본값 **안 함**.
4. **(신규) 8a `monthBranch` 필드** — 기본값 **안 A**(별도 PR로 추가하고 격국 우회는 걷는다).
5. 신살 목록 7종(12신살 제외) · 기준 기둥 연지·일지 둘 다 · 음간 양인 양간만 — 10-25 기본값을 유지한다.
6. 이전 REPORT(8b2) 확인 목록 1~6 — 그대로다.

## 남은 것 · 다음 (우선순위)

1. #121 머지(LC 게이트) → 9단계 include 개방 착수 HO(설계서 §5 I1~I7). 선행 게이트 재료는 8a·READINGS·YONGSIN·GYEOKGUK(50) confirmed로 준비됐고, 신살은 GOLDEN-SINSAL pending이다.
2. LC 재계산: GOLDEN-SINSAL 50×13(md 표 + 명식 글자만으로 닫힘) · GOLDEN-GYEOKGUK 보강 6행.
3. S-YNY 2행: GOLDEN-PILLARS 선등록(`getLunCalInfo` 일진 외부 출처) → 8a 편입. 이때 `golden-strength-factors.test.ts`의 `toHaveLength(50)` 하드코딩을 같이 고친다(#121 critic 권고 ②).
