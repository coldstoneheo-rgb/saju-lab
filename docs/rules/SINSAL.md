# 신살(神殺) 표 조회 — 정본

`packages/saju-core/src/l2/sinsal.data.ts`의 상수는 이 문서의 표와 같아야 하며 `l2/sinsal.data.test.ts`가 md를 직접 파싱해 동일성을 강제한다(열 이름 매핑). 설계 = `docs/design/sinsal-design.md`.

- **표 조회만 한다.** 신살은 «기준 글자 → 대상 지지(또는 기둥)» 조회표이고, 코어는 «어느 기둥에 어떤 신살이 걸렸는가»만 낸다. 길흉·강도·해석은 코어에 없다.
- **입력 = 네 기둥 글자만**(`PillarsResult`). 8a·8b·격국 출력은 읽지 않는다.
- **기본 변형은 없다.** 표 1의 변형을 전부 실행해 나란히 돌려준다. 어느 변형을 인용할지는 관점층이 고른다.
- **목록 = 7종**(설계 §2). 12신살(겁살·재살·천살·지살·연살·월살·망신·장성·반안·역마·육해·화개)은 v1에서 제외한다.
- **시각 미상**이면 시지·시주는 대상이 아니다(계산하지 않음). 일간·일지 기준은 그대로 실행하고 `precision: "time-unknown"`을 싣는다.
- **기준 기둥 자기 제외**: 삼합 기준 신살(도화·역마·화개)은 기준 지지가 있는 기둥을 대상에서 뺀다. 실제로 걸리는 경우는 화개뿐이다 — 도화·역마의 대상 지지는 기준 삼합 밖이다(표 3이 확인).
- 레코드마다 `doctrine: "unreviewed"`를 싣는다. 이 표의 명리학적 타당성은 G2-3(실제 역술가 대조) 전에는 검토되지 않았다.
- 간지 쌍은 `천간-지지` 로마자(예 `gyeong-jin` = 庚辰)로 쓴다. `GOLDEN-PILLARS.md`와 같은 표기다.

## 표 1 — 변형 목록

| variantId | sinsalId | 기준 | 대상 | 표 |
| --- | --- | --- | --- | --- |
| cheoneul.a | cheoneul | day-stem | branches | 표 2 |
| cheoneul.b | cheoneul | day-stem | branches | 표 2 |
| dohwa.year-basis | dohwa | year-branch | branches | 표 3 |
| dohwa.day-basis | dohwa | day-branch | branches | 표 3 |
| yeokma.year-basis | yeokma | year-branch | branches | 표 3 |
| yeokma.day-basis | yeokma | day-branch | branches | 표 3 |
| hwagae.year-basis | hwagae | year-branch | branches | 표 3 |
| hwagae.day-basis | hwagae | day-branch | branches | 표 3 |
| yangin.yang-only | yangin | day-stem | branches | 표 4 |
| goegang.day-four | goegang | pillar | day | 표 5 |
| goegang.day-mu-sul | goegang | pillar | day | 표 5 |
| goegang.four-pillars | goegang | pillar | all | 표 5 |
| baekho | baekho | pillar | all | 표 6 |

- 기준 토큰: `day-stem` = 일간 · `year-branch` = 연지 · `day-branch` = 일지 · `pillar` = 각 기둥의 간지 쌍 자체.
- 대상 토큰: `branches` = 네 기둥의 지지(시각 미상이면 세 기둥) · `day` = 일주만 · `all` = 네 기둥 전부(시각 미상이면 세 기둥).

## 표 2 — 천을귀인 天乙貴人 (일간 → 지지)

| variantId | 일간 | 지지 |
| --- | --- | --- |
| cheoneul.a | gap | chuk mi |
| cheoneul.a | eul | ja sin |
| cheoneul.a | byeong | hae yu |
| cheoneul.a | jeong | hae yu |
| cheoneul.a | mu | chuk mi |
| cheoneul.a | gi | ja sin |
| cheoneul.a | gyeong | chuk mi |
| cheoneul.a | sin | in o |
| cheoneul.a | im | sa myo |
| cheoneul.a | gye | sa myo |
| cheoneul.b | gap | chuk mi |
| cheoneul.b | eul | ja sin |
| cheoneul.b | byeong | hae yu |
| cheoneul.b | jeong | hae yu |
| cheoneul.b | mu | chuk mi |
| cheoneul.b | gi | ja sin |
| cheoneul.b | gyeong | in o |
| cheoneul.b | sin | in o |
| cheoneul.b | im | sa myo |
| cheoneul.b | gye | sa myo |

- A = «甲戊庚 丑未 · 乙己 子申 · 丙丁 亥酉 · 辛 寅午 · 壬癸 巳卯». B = «甲戊 丑未 · 庚辛 寅午», 나머지 A와 같음. 두 판본의 차이는 **庚 일간 한 행**뿐이다(테스트가 확인).

## 표 3 — 삼합 기준 도화 桃花 · 역마 驛馬 · 화개 華蓋 (연지·일지 → 지지)

| 삼합 | 지지 | dohwa | yeokma | hwagae |
| --- | --- | --- | --- | --- |
| in-o-sul | in o sul | myo | sin | sul |
| sin-ja-jin | sin ja jin | yu | in | jin |
| sa-yu-chuk | sa yu chuk | o | hae | chuk |
| hae-myo-mi | hae myo mi | ja | sa | mi |

- `삼합`·`지지` 열은 `docs/rules/INTERACTIONS.md` 표 3(삼합 4국)과 같은 묶음이다(테스트가 `SAMHAP` 상수와 대조).
- 기준 지지가 속한 삼합 행의 대상 지지를, 기준 기둥을 뺀 나머지 기둥에서 찾는다.
- 짜임(테스트가 확인): 도화 = 삼합 생지의 다음 지지(목욕) · 역마 = 생지와 충하는 지지 · 화개 = 삼합 고지(마지막 글자). 화개만 기준 삼합 안에 있다.

## 표 4 — 양인 羊刃 (일간 → 지지, 양간만)

| 일간 | 지지 |
| --- | --- |
| gap | myo |
| byeong | o |
| mu | o |
| gyeong | yu |
| im | ja |

- 이 표는 `docs/rules/GEOKGUK.md` 표 1의 `yangin` 행과 **같은 표**다. 코드는 격국 상수 `BIGYEOP_MONTH_TABLE`의 `yangin` 행을 그대로 쓴다(정의 이중화 금지, 테스트가 확인).
- 음간 판본(실행하지 않음, 기록만): 乙 辰 · 丁 未 · 己 未 · 辛 戌 · 癸 丑. 판본마다 음간 자리가 다르다(乙 寅 등). 사용자 확인 목록 — 기본값 **양간만**(격국과 한 결정).

## 표 5 — 괴강 魁罡 (간지 쌍)

| variantId | 간지 |
| --- | --- |
| goegang.day-four | gyeong-jin gyeong-sul im-jin im-sul |
| goegang.day-mu-sul | gyeong-jin gyeong-sul im-jin im-sul mu-sul |
| goegang.four-pillars | gyeong-jin gyeong-sul im-jin im-sul |

- `day-four` = 일주가 庚辰·庚戌·壬辰·壬戌 중 하나. `day-mu-sul` = 같은 일주 기준에 戊戌을 더한 판본(5쌍 전체 표 — 이 변형만 인용해도 완결된다). `four-pillars` = 4쌍을 네 기둥 모두에서 찾는다.
- **서지 미확인.** 「庚辰 庚戌 壬辰 戊戌(壬戌 제외)」 판본이 있다는 기억(HO-2026-1025 8b REPORT 발견 5)은 레포 안 출처로 확인되지 않았다. 그 판본은 실행하지 않고, 서지가 확인되면 변형을 «壬戌 포함 / 戊戌 포함»으로 나눈다. 사용자 확인 목록.

## 표 6 — 백호 白虎 (간지 쌍, 네 기둥)

| variantId | 간지 |
| --- | --- |
| baekho | gap-jin eul-mi byeong-sul jeong-chuk mu-jin im-sul gye-chuk |

## 갈림 기록 (채택안을 정하지 않고 병기, 전부 `unreviewed`)

| 항목 | 이 표의 처리 | 다른 입장 |
| --- | --- | --- |
| 목록 | 7종 | 12신살 추가(도화=연살·역마·화개 겹침) |
| 삼합 기준 기둥 | 연지·일지 둘 다 | 연지만 · 일지만 |
| 천을귀인 庚 일간 | A(丑未)·B(寅午) 둘 다 | 한 판본만 |
| 음간 양인 | 실행 안 함 | 음간 양인 인정(판본마다 자리 다름) |
| 괴강 범위 | 일주 · 네 기둥 둘 다 | 일주만 |
| 괴강 戊戌 | 별도 변형 | 4쌍만 · 壬戌 대신 戊戌 |

## 쓰지 않는 말

코어 필드 · 이 문서 · 테스트 문자열에 추천 · 권장 · 최적 · 반드시 · 길하다 · 흉하다 · 좋은/나쁜 신살 · 조심 · 주의 같은 길흉 단정과 권고를 쓰지 않는다. 신살 이름은 고유명사로만 쓴다. 사람 대면 문장은 13단계 + `saju-domain` 스킬 몫이다.
