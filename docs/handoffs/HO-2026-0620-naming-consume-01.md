# HO-B — baby-naming-ai 소비측 통합 핸드오프

> handoff_id: **HO-2026-0620-naming-consume-01** (= HO-B)
> 대상: `baby-naming-ai`(안드로이드) 통합 에이전트. 생산자: saju-lab `saju-pillars-v1` API(머지 완료).
> 계약 단일 진실원: [`docs/SAJU_PILLARS_API_V1.md`](../SAJU_PILLARS_API_V1.md). PoC: `scripts/poc-saju-pillars.mjs`.

## 역할·맥락
상위 전략은 "사주 × 작명 번들 수익화"이고, 가치사슬은 사주 분석(상류, saju-lab) → 부족 오행 식별
(`saju-pillars-v1` API, 완료) → 보완 한자 작명(하류, 이 앱)이다. 선행 HO-A(오행 프리미티브)·
HO-API(계약 노출)가 머지됐다. 이번 HO-B는 그 API를 앱이 실제로 호출해, 부족 오행 보완 우선순위를
작명 입력으로 잇는다.

## 실측된 생산자 사실 (콜드 탐색 말고 검증·소비하라)
- 엔드포인트: `POST {BASE}/api/saju-pillars` (계약 식별자 `saju-pillars-v1`).
- 호스팅: Vercel 서버리스(saju-lab `apps/web` 동거). `{BASE}` = saju-lab 배포 도메인.
- 인증: 서버에 `SAJU_API_KEY` 설정 시 헤더 `x-api-key` 필수(상수시간 비교). 미설정이면 개방.
- 요청(JSON): `birthDate`(YYYY-MM-DD), `birthTime`(HH:mm, `timeUnknown` 아니면 필수),
  `timeUnknown?`, `calendar`("solar"|"lunar"), `timezone?`(기본 Asia/Seoul), `sex`("male"|"female"|"other").
- 응답(200): `{ contract, timeKnown, pillars{year,month,day,time?}, fiveElements{ distribution, absent, deficient, supplementPriority } }`.
  ★작명 타깃 = `fiveElements.supplementPriority`(가장 부족한 오행부터). 오행 키: wood/fire/earth/metal/water(목화토금수).
- 에러(4xx): `{ contract, error{ code, message, field? } }`. 코드: `INVALID_BODY`, `INVALID_CALENDAR`,
  `UNSUPPORTED_CALENDAR`(lunar 미지원), `UNSUPPORTED_TIMEZONE`(Asia/Seoul 외), `INVALID_BIRTH_DATE`,
  `MISSING_BIRTH_TIME`, `INVALID_BIRTH_TIME`, `INVALID_SEX`, `OUT_OF_SUPPORTED_RANGE`,
  `UNAUTHORIZED`(401), `METHOD_NOT_ALLOWED`(405).
- ★엔진 제약(소비측에서 흡수): v1은 양력(solar)·Asia/Seoul·검증된 절기 범위만. 음력은 앱에서 양력
  변환 후 `calendar:"solar"`로 호출.

## 목표 = 성공 기준 (먼저 충족). 범위 = 소비측 통합 + PoC 1경로. 좁게(Surgical).
1. **API 클라이언트**: Retrofit/OkHttp 인터페이스 + 요청/응답/에러 DTO. `saju-pillars-v1` 스키마에 1:1.
2. **매핑 어댑터**: 응답의 `supplementPriority`(+`absent`)를 기존 작명 엔진의 "보완 오행 타깃" 입력으로
   변환. (작명 규칙 자체는 손대지 말고 입력 연결만.)
3. **동작하는 PoC 1경로**: 샘플 생년월일시 → API 호출 → `supplementPriority[0]`를 1순위 보완 오행으로
   받아 작명 후보 생성에 반영되는 흐름을 실제 1회 실행·캡처.

## 모델링 결정 (코딩 전 1줄씩 제안 후 진행)
- 음력 입력 변환 위치(입력단 vs 호출 직전 어댑터) — 권장: 호출 직전 단일 지점.
- `supplementPriority` 사용 깊이 — MVP는 `[0]`(1순위)만 타깃, 동점/2순위는 후속.
- 호출 캐싱 — 동일 입력 결정론이므로 `(birthDate+time+sex)` 키 캐시 권장.

## 명시적 비목표
saju-core/오행 엔진/계약 스키마 변경(saju-lab 소관, 손대지 마라). 작명 규칙 전면 개편, 결제·구독 PG,
UI 전면 개편, 서버측 인증/레이트리밋 정책 변경.

## 제약
- 계약 버전 `saju-pillars-v1`에 고정 의존(응답 `contract` 필드로 검증). 추가 필드는 무시-가능하게 파싱.
- 네트워크 실패·4xx/5xx·`UNSUPPORTED_*`를 graceful 처리(사용자 친화 메시지, 작명 흐름 폴백).
- `x-api-key`는 빌드 시크릿/원격 구성으로 주입 — 앱/저장소에 하드코딩·커밋 금지.
- 기존 작명 경로 회귀 금지.

## 커밋/PR
단일 PR(예: `feat(saju): integrate saju-pillars-v1 for ohaeng-targeted naming`). PR 본문에 클라이언트·
DTO·매핑·PoC 입출력·음력/캐싱 결정 요약.

## 검증 (PR 전 자가검증)
1. 샘플 입력의 API 200 응답이 DTO로 정확히 파싱되고, `supplementPriority`가 비지 않는다.
2. **골든 교차검증**: `1990-01-01`·`10:30`·`male` → `supplementPriority[0] == "metal"`(金), `absent == ["metal"]`.
   (생산자 PoC와 값 일치 = 통합 정합성. 형식 유효 ≠ 명리적 정확.)
3. `supplementPriority[0]`가 작명 후보 생성의 보완 오행 타깃으로 실제 반영된다.
4. lunar/Asia-Seoul外/범위外/네트워크오류 각각에서 앱이 죽지 않고 정의된 폴백을 탄다.
5. `x-api-key` 미주입/오류(401) 시 동작이 정의돼 있다.

## 보고 — 필수, 작업 끝에 그대로 채워 출력
```yaml
handoff_id: HO-2026-0620-naming-consume-01   # (= HO-B)
agent: <codex|claude-code>
project: baby-naming-ai
status: done | partial | blocked
deliverables:
  - pr: <PR 링크>
  - api_client: <Retrofit 인터페이스 + DTO 경로>
  - mapping_adapter: <supplementPriority→작명 타깃 변환 위치>
  - poc_sample: <입력→응답→작명 타깃 반영 1건 캡처>
success_criteria:
  - 응답 파싱/DTO 정합: pass|fail
  - 골든 교차검증(1990→metal): pass|fail
  - 작명 타깃 반영: pass|fail
  - 에러/폴백 처리: pass|fail
decisions:
  - lunar_conversion: <위치> + 이유
  - caching: <방식|없음> + 이유
  - key_injection: <방식>
blockers: <없으면 none>
next_suggested: 번들 과금/엔드투엔드(사주→작명) UX 핸드오프 1줄
```

## 참고용 Kotlin 스니펫 (착수 가속용 — 계약 그대로)
```kotlin
// Retrofit
interface SajuPillarsApi {
  @POST("api/saju-pillars")
  suspend fun analyze(
    @Header("x-api-key") apiKey: String?,        // SAJU_API_KEY 주입 (없으면 null)
    @Body req: SajuPillarsRequest
  ): Response<SajuPillarsResponse>                 // 비-2xx는 errorBody()로 SajuPillarsError 파싱
}

data class SajuPillarsRequest(
  val birthDate: String, val birthTime: String? = null, val timeUnknown: Boolean? = null,
  val calendar: String = "solar", val timezone: String = "Asia/Seoul", val sex: String
)
data class SajuPillarsResponse(
  val contract: String, val timeKnown: Boolean,
  val pillars: Pillars, val fiveElements: FiveElements
)
data class Pillars(val year: Pillar, val month: Pillar, val day: Pillar, val time: Pillar?)
data class Pillar(val stem: String, val branch: String)
data class FiveElements(
  val distribution: Map<String, Int>,            // wood/fire/earth/metal/water
  val absent: List<String>, val deficient: List<String>,
  val supplementPriority: List<String>           // ← 작명 보완 타깃, [0] = 1순위
)
data class SajuPillarsError(val contract: String, val error: ApiError)
data class ApiError(val code: String, val message: String, val field: String? = null)
```
