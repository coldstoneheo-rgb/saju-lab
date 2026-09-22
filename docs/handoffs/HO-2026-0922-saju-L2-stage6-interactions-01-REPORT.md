# HO-2026-0922-saju-L2-stage6-interactions-01 — REPORT

- 발주서: life-coordinator `handoffs/HO-2026-0922-saju-L2-stage6-interactions-01.md` (LC `718e051`). origin: user(§0 사용자 원문 인용 있음 → 유효). 착수 시점 main `4000671`(골든 십신표 confirmed PR #77 머지 뒤). 브랜치 `feat/l2-stage6-interactions`, PR 1개.
- 추정 1세션(반일) → 실제 1세션. LLM 0, 의존 0. 코어 코드 변경은 L2 신설 파일 + `types.ts`/`saju-pillars-v1.ts`/`index.ts` additive만.

## 구현
| 파일 | 내용 |
| --- | --- |
| `docs/rules/INTERACTIONS.md` (신규, 정본) | 표 1 간합 5조(화기 데이터) · 표 2 육합 6 · 표 3 삼합 4국(왕지·오행) · 표 4 방합 4국(방위·오행) · 표 5 지지충 6 · 표 6 형 4종(유형 코드) + 위치 규칙 + v1 제외 사유 표 + 출처 줄 |
| `packages/saju-core/src/l2/interactions.data.ts` (신규) | 여섯 표를 상수로. `INTERACTION_TABLES` |
| `l2/interactions.ts` (신규) | 규칙 층 `stemPairRule`·`branchPairRules`·`branchTripleRule` / 명식 층 `stemInteractions`·`branchInteractions`·`interactionsOfChart` / 라벨 `INTERACTION_LABELS`·`HYEONG_SUBTYPE_LABELS`. 순수 함수(글자만 입력) |
| `l2/interactions.test.ts` (신규) | **C1** md 직접 파싱 ↔ ts 동일성(표 6개, md에만 있는 표 검출) · **C2** 전수(천간 10×10 · 지지 12×12 · 3자 220) · 명식 층 9케이스(인접 비억제·쟁합 shared·포섭·반합 왕지·방합 완전만·자형 3회·관계 0·시주 미상·순수성) · v1 include 바이트 동일 |
| `docs/golden/GOLDEN-INTERACTIONS.md` (신규) + `l2/golden-interactions.test.ts` | 골든 11건 합충표(코어 생성, 전부 `pending`, 출처 「코어 산출 2026-09-22, 검산 대기」) + 명식 열 + 비고 6건. 파서는 십신표 규칙 동일(출처 빈칸 실패·상태값 검사·pending도 코어 현재 산출과 대조) |
| `types.ts` · `saju-pillars-v1.ts` · `index.ts` | `IncludeBlock`에 `"interactions"` 추가, 응답 `interactions?` — include 요청분만. 공개 export |
| 웹 `main.tsx` · `styles.css` | 명식 아래 「합충」 칩 1줄(한글 글자+종류+기둥) + 접힘 「합충 상세」 표(종류·기둥·글자·완전/부분·인접). 관계 0이면 「없음 — …」 1줄. 통변 0 |
| `docs/SAJU_PILLARS_API_V1.md` | 「합충 블록」 절 + kind 코드표(한글·한자·id 예·정의) + v1 제외 + 예시 명식 |

## 응답 형태 (확정 — 발주서 §3-2 제안에서 `id` 추가, 나머지 동형)
```
interactions: {
  stems:    [{ kind:"ganhap", id:"gap-gi", pillars:["year","day"], stems:["gap","gi"], adjacent:false, potentialElement:"earth", shared:false }],
  branches: [{ kind:"yukhap"|"samhap"|"banghap"|"chung"|"hyeong", id, pillars:[...], branches:[...],
               adjacent?:boolean(2자만), complete?:boolean(삼합·삼형만), element?:FiveElement(삼합·방합), subtype?:"mueun"|"jise"|"murye"|"ja"(형만), shared:boolean }]
}
```
- `id` = 규칙 표의 조/국/종 id(`docs/rules/INTERACTIONS.md`) — 관점층이 규칙 ID로 발화할 원천(현대 페르소나 ⑤ 「규칙 ID 발화 + evidence」 대비).
- `pillars`·`branches`는 명식 순서. 시주 미상이면 `time` 조합 자체가 없다. 관계 0 = `{ stems: [], branches: [] }`.

## C1 — md ↔ ts 동일성
`interactions.test.ts`: 「## 표 N — `kind`」 절을 열 이름으로 파싱해 `INTERACTION_TABLES[kind]`와 `toEqual`(6표). 표 개수·규칙 개수(5·6·4·4·6·4) 고정, 12지 각각이 삼합·방합 정확히 1국씩.

## C2 — 전수
- 천간 10×10: 양성 5조(`byeong-sin eul-gyeong gap-gi jeong-im mu-gye`) 정확히, 대칭, 자기 자신 음성.
- 지지 12×12(자기 쌍 포함 78): 육합 6 · 충 6 · 상형 1 · 자형 4 · 삼형 2자 6(무은 3·지세 3) · 삼합 반합 8 = 카운트 고정. 寅申 = 충+형 둘 다, 申辰(공협) = 0, 子子 = 자형 아님.
- 3자 220: 삼합 4 · 방합 4 · 삼형 2만 양성, 辰辰辰 음성.

## C3 — 골든 합충표
11건 전부 관계 1건 이상(**관계 0 명식은 골든에 없음** — 관계 0 케이스는 단위 테스트 합성 명식 + 웹 스크린샷 3의 1985-05-19 10:30 乙丑 辛巳 戊午 丁巳로 고정). 발주서 예시 g-2011-11-08-0334 = 실제 산출 **卯戌 육합 2건(연·월, 월·일)** + 丁壬 간합(일·시), 테스트로 고정. 표 전체:

| id | 간합 | 육합 | 삼합 | 방합 | 충 | 형 |
| --- | --- | --- | --- | --- | --- | --- |
| g-1990-01-01-1030 | - | - | - | - | - | 巳寅(연·일) 寅巳(일·시) 부분 |
| g-2000-02-04-1200 | 丁壬(월·일) | - | - | - | - | - |
| g-2010-06-21-2359 | - | - | 寅午(연·월) 午寅(월·일) 반합 | - | 午子(월·시) | - |
| g-2015-12-22-0030 | 乙庚(연·시) | - | 子申(월·일) 申子(일·시) 반합 | - | - | - |
| g-2024-02-04-1727 | 丙辛(월·시) | 辰酉(연·시) | - | - | 辰戌(연·일) | - |
| g-2011-11-08-0334 | 丁壬(일·시) | 卯戌(연·월) 戌卯(월·일) | - | - | - | - |
| g-2011-11-08-0335 | 丁壬(일·시) | 亥寅(월·시) | 卯亥(연·월) 亥卯(월·일) 반합 | - | - | - |
| g-2011-11-08-0925 | - | - | 卯亥(연·월) 亥卯(월·일) 반합 | - | 亥巳(월·시) | - |
| g-1955-02-04-2247 | - | 丑子(월·시) | 申子(일·시) 반합 | - | 午子(연·시) | - |
| g-1955-02-04-2248 | - | - | 申子(일·시) 반합 | - | 寅申(월·일) | 寅申(월·일) 부분 |
| g-1988-10-09-0230 | 壬丁(월·일) | 辰酉(연·일) | 酉丑(일·시) 반합 | - | 辰戌(연·월) | 戌丑(월·시) 부분 |

방합 완전 3자·삼합 완전 3자·삼형 완전 3자는 골든 11건에 없다(단위 테스트 합성 명식으로 고정). → LC 페르소나 검산 뒤 `confirmed`로 기입하면 값 고정.

## C4 — 라이브(keyless, 머지·배포 후 실측)
로컬 동형: `buildSajuPillarsV1Response({...1990-01-01 10:30, options:{include:["interactions"]}})` → `interactions` 존재, 나머지 필드 JSON 문자열 바이트 동일(테스트 고정). include 없이 → 키 없음. 라이브 curl은 머지·배포 뒤 LC 검수(발주서 §7).

## C5 — 웹 스크린샷 (`docs/evidence/2026-09-22-stage6-interactions/`)
| 파일 | 상태 |
| --- | --- |
| `1-interaction-chips.jpg` | 1988-10-09 02:30(戊辰 壬戌 丁酉 辛丑) — 칩 「임정합(월·일) · 진술충(연·월) · 진유육합(연·일) · 술축형(월·시) · 유축반합(일·시)」 + 접힘 「합충 상세」 |
| `2-interaction-details-open.jpg` | 접힘 열림: 천간합(干合) 월·일 임 정 화기 목(참고값) 인접 / 충(沖) 연·월 / 육합(六合) 연·일 비인접 / 삼형(지세지형) 월·시 부분 비인접 / 삼합(三合) 일·시 반합 인접 |
| `3-no-interactions.jpg` | 1985-05-19 10:30(乙丑 辛巳 戊午 丁巳) — 「합충 없음 — 간합·육합·삼합·방합·충·형 규칙에 해당하는 글자 쌍이 없습니다.」 (巳巳는 자형 아님) |

## C6 — 게이트
`npm run verify` exit 0 — test **322**(api 17 + saju-core 268 + web 37). include 없는 응답 바이트 동일(테스트). baby 소비 필드 불변(미소비 블록).

## §6 반박 가능 — 채택/반박
| # | 항목 | 결정 |
| --- | --- | --- |
| ① | 삼합 반합 왕지 필수 | **채택**(발주서대로). 왕지 없는 2자(공협)는 0. 교재 갈림은 `INTERACTIONS.md` 표 3 주석에 기록, v1.1에서 옵션화 가능 |
| ② | 寅申·丑未 충+형 중복 나열 vs 접기 | **채택(중복 나열)**. 억제 없음 원칙과 일관. `shared`는 같은 kind 안에서만 — 다른 kind의 중복은 shared 아님(문서화) |
| ③ | 응답 필드명·형태 | **제안 + `id` 1필드 추가**. 규칙 ID 발화용. 그 외 동형 |
| ④ | 골든 합충표 셀 형식 | 관계별 열(간합·육합·삼합·방합·충·형) × `글자-글자:기둥-기둥` 공백 나열. `adjacent`·`shared`·`complete`는 기둥 수·위치에서 유도되므로 셀에 안 적음(중복 정보 제거). 명식 열 추가(검산자 대조 편의) |
| ⑤ | 자형 3회(辰辰辰) | **기둥 쌍마다 1건**(3건, 전부 `shared:true`). 2자 관계 = 모든 기둥 쌍 원칙과 일관, 12×12 자형 4 카운트 유지. 1건으로 접는 대안은 관점층에서 `shared` 묶음으로 가능 |
| + | 포섭(반박 가능 추가) | 완전 3자가 있으면 같은 국의 2자 부분(반합·부분 형)은 따로 내지 않는다. 정보 중복이라 판단. 부분을 굳이 원하면 관점층이 완전 3자에서 유도 가능. 반대 결정 시 `branchInteractions`의 `subsumed` 한 줄 제거로 되돌릴 수 있음 |

## 하지 않은 것
파·해(v1.1) · 천간충 · 방합 반합·공협 · 化 성립 판정 · 길흉·강약 가중(8단계) · 대운·세운 합충(7단계 이후) · 신살 · 격국 · 8단계 입력(십신 개수 집계·투간·득령득지득세·월령 사령 — LC 지시대로 미구현).
