# 합충형(合沖刑) 표 — 정본 (6단계 v1)

`packages/saju-core/src/l2/interactions.data.ts`는 이 표에서 생성된 것과 같아야 하며 `l2/interactions.test.ts`가 md를 직접 파싱해 동일성을 강제한다(열 이름 매핑, `HIDDEN-STEMS.md` 패턴). 코어는 **관계의 존재·위치만 결정론으로 산출**한다 — 화(化) 성립 판정·길흉·강약 가중은 없다(회의 2026-09-22 A2-3 · A5-4, 8단계 이후). 절기 정밀도와 무관한 순수 함수(명식 글자만 입력).

- 천간 라벨은 `gap eul byeong jeong mu gi gyeong sin im gye`(甲乙丙丁戊己庚辛壬癸), 지지는 `ja chuk in myo jin sa o mi sin yu sul hae`(子丑寅卯辰巳午未申酉戌亥). 오행은 `wood fire earth metal water`.
- `조`/`국`/`종` 열은 관계 id(응답 `id` 필드). 글자 열은 공백 구분.
- 요청은 `options.include: ["interactions"]`. 응답 형태는 `docs/SAJU_PILLARS_API_V1.md` 「합충 블록」.

## 표 1 — `ganhap` 천간합(干合) 5조 — 화기(化氣)는 데이터만

| 조 | 천간 | 화기 |
| --- | --- | --- |
| gap-gi | gap gi | earth |
| eul-gyeong | eul gyeong | metal |
| byeong-sin | byeong sin | water |
| jeong-im | jeong im | wood |
| mu-gye | mu gye | fire |

화기는 「합이 성립하면 변할 수 있는 오행」을 데이터 필드(`potentialElement`)로 실을 뿐, 化 성립(월령·투간 조건)은 판정하지 않는다 — 해석층(관점) 몫.

## 표 2 — `yukhap` 지지 육합(六合) 6조

| 조 | 지지 |
| --- | --- |
| ja-chuk | ja chuk |
| in-hae | in hae |
| myo-sul | myo sul |
| jin-yu | jin yu |
| sa-sin | sa sin |
| o-mi | o mi |

육합의 화기 오행(토·목·화·금·수·화 등)은 교재별 갈림이 있어 v1은 화기 필드 없음(존재만).

## 표 3 — `samhap` 지지 삼합(三合) 4국 — 완전 3자 + 반합(왕지 포함 2자)

| 국 | 지지 | 왕지 | 오행 |
| --- | --- | --- | --- |
| sin-ja-jin | sin ja jin | ja | water |
| hae-myo-mi | hae myo mi | myo | wood |
| in-o-sul | in o sul | o | fire |
| sa-yu-chuk | sa yu chuk | yu | metal |

3자 전부 → `complete: true`. 왕지를 포함한 2자(申子·子辰) → `complete: false`(반합). 왕지 없는 2자(申辰 = 공협)는 v1 산출 안 함.

## 표 4 — `banghap` 지지 방합(方合) 4국 — v1은 완전 3자만

| 국 | 지지 | 방위 | 오행 |
| --- | --- | --- | --- |
| in-myo-jin | in myo jin | east | wood |
| sa-o-mi | sa o mi | south | fire |
| sin-yu-sul | sin yu sul | west | metal |
| hae-ja-chuk | hae ja chuk | north | water |

2자 방합(반합)은 교재 갈림이라 v1 산출 안 함.

## 표 5 — `chung` 지지충(沖) 6조

| 조 | 지지 |
| --- | --- |
| ja-o | ja o |
| chuk-mi | chuk mi |
| in-sin | in sin |
| myo-yu | myo yu |
| jin-sul | jin sul |
| sa-hae | sa hae |

천간충(甲庚·乙辛·丙壬·丁癸)은 v1 제외 — 자평은 천간 극을 「충」이 아니라 칠살·상극으로 보며 십신(편관)이 이미 표현한다.

## 표 6 — `hyeong` 형(刑) 4종

| 종 | 유형 | 지지 | 비고 |
| --- | --- | --- | --- |
| in-sa-sin | mueun | in sa sin | 삼형(무은지형). 3자 `complete: true`, 2자(寅巳·巳申·寅申) `complete: false`. 寅申은 충과 중복 산출(둘 다 기록) |
| chuk-sul-mi | jise | chuk sul mi | 삼형(지세지형). 3자 완전, 2자(丑戌·戌未·丑未) 부분. 丑未는 충과 중복 |
| ja-myo | murye | ja myo | 상형(무례지형). 2자 |
| ja-hyeong | ja | jin o yu hae | 자형(自刑). 같은 지지가 두 기둥 이상에 있을 때, 기둥 쌍마다 1건(辰辰·午午·酉酉·亥亥) |

## 위치 규칙 (공통)

- 기둥 4(시주 없으면 3). 2자 관계는 **모든 기둥 쌍**(4C2 = 6쌍)을 산출하고 `adjacent`(연-월·월-일·일-시만 true)로 구분한다. 3자 관계는 기둥 3개 조합. 인접 여부로 억제하지 않는다 — 어느 쌍을 채택할지는 관점층.
- 같은 쌍에 여러 관계(寅申 = 충+형)는 **전부 나열**한다.
- 같은 글자가 같은 종류의 관계 둘 이상에 걸리면(쟁합·투합, 예 甲 둘에 己 하나) 조합 전부 나열 + `shared: true`. `shared`는 **같은 `kind`** 안에서 기둥을 공유할 때만 true(충과 형이 같은 쌍에 있는 것은 중복 나열이지 shared가 아니다).
- 3자 관계가 완전(`complete: true`)이면 그 안에 포함되는 같은 국의 2자 부분(반합·부분 형)은 따로 내지 않는다(포섭). 국이 다른 관계, 다른 `kind`는 그대로 나열.

## v1 제외 (사유)

| 항목 | 사유 | 예정 |
| --- | --- | --- |
| 파(破)·해(害) | 교재 간 규칙·가중 갈림, 소비층 요구 미확정 | v1.1 |
| 천간충 | 십신(편관/칠살)이 이미 표현 | v1.1(파·해와 함께, 필요 시) |
| 방합 반합·삼합 공협 | 교재 갈림 | 요청 시 |
| 化 성립 판정 | 월령·투간 조건 = 해석층 | 관점층 |
| 길흉·강약 가중 | 산식 없음 원칙 | 8단계 |

출처: 『자평진전(子平眞詮)』 논합충(論合沖) · 통용 명리 교재(육합·삼합·방합·충·형 표) · 회의록 2026-09-22 §3-2 A2-3(전통 역술가) · 개발자 r2 §5 `interactions.ts` · A5-4 합충 6종 슬롯 12 · 발주서 `HO-2026-0922-saju-L2-stage6-interactions-01` §2.
