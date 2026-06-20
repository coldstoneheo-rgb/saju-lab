# saju-pillars-v1 — 사주 4기둥·오행 소비 계약

> 다운스트림 소비자(예: `baby-naming-ai` 안드로이드 앱)가 사주 4기둥과 오행 분포·부족오행·보완
> 우선순위를 받아 작명에 쓰기 위한 **안정 HTTP 계약**. 버전 식별자 `saju-pillars-v1`.

- 엔진: `@saju-lab/saju-core`의 `calculatePillars` + `analyzeFiveElements`(HO-A) 위의 얇은 어댑터.
- 호스팅: `apps/web`과 동거하는 Vercel 서버리스 함수(`/api/saju-pillars`). 별도 인프라 없음.
- 하위호환: 추가 필드는 v1 유지, **깨짐 변경 시에만** 식별자를 올린다.

## 엔드포인트

```
POST /api/saju-pillars
Content-Type: application/json
x-api-key: <SAJU_API_KEY>        # 환경에 SAJU_API_KEY가 설정된 경우 필수
```

- **메서드**: `POST`만 허용(그 외 `405`).
- **인증**: 서버에 `SAJU_API_KEY` 환경변수가 설정돼 있으면 `x-api-key` 헤더가 일치해야 함(불일치/누락 `401`).
  미설정이면 개방(로컬/PoC). 키는 환경변수로만 주입하며 저장소에 커밋하지 않는다.
  키 비교는 타이밍 공격 방지를 위해 상수시간 비교(`crypto.timingSafeEqual`, SHA-256 다이제스트).
- **레이트리밋**: v1은 앱 레이어에서 두지 않음 — 호스팅 플랫폼(Vercel)·게이트웨이에 위임(문서화된 입장).

## 요청 스키마

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `birthDate` | `string` | ✅ | 생년월일 `YYYY-MM-DD`(입력 역법 기준) |
| `birthTime` | `string` | 조건부 | 생시 `HH:mm`(24h). `timeUnknown`이 아니면 필수 |
| `timeUnknown` | `boolean` | ❌ | `true`면 시주 제외(3기둥) |
| `calendar` | `"solar" \| "lunar"` | ✅ | 역법. **v1은 `solar`만 지원**, `lunar`는 `UNSUPPORTED_CALENDAR` |
| `timezone` | `string` | ❌ | 기본 `Asia/Seoul`. **v1은 `Asia/Seoul`만 지원**(엔진 제약), 그 외는 `UNSUPPORTED_TIMEZONE` |
| `sex` | `"male" \| "female" \| "other"` | ✅ | 성별 |
| `contract` | `"saju-pillars-v1"` | ❌ | 있으면 무시(에코용) |

## 응답 스키마 (200)

```jsonc
{
  "contract": "saju-pillars-v1",
  "timeKnown": true,                  // 시주 포함 여부
  "pillars": {                        // 4기둥(시주 미상이면 time 생략)
    "year":  { "stem": "gi",     "branch": "sa" },
    "month": { "stem": "byeong", "branch": "ja" },
    "day":   { "stem": "byeong", "branch": "in" },
    "time":  { "stem": "gye",    "branch": "sa" }
  },
  "fiveElements": {
    "distribution": { "wood": 1, "fire": 4, "earth": 1, "metal": 0, "water": 2 },
    "absent": ["metal"],                                  // 부재 오행
    "deficient": ["metal", "wood", "earth"],              // 평균 미만, 부족 순
    "supplementPriority": ["metal","wood","earth","water","fire"]  // 보완 우선순위(작명 타깃)
  }
}
```

- 간지 라벨: 천간 `gap,eul,byeong,jeong,mu,gi,gyeong,sin,im,gye` / 지지 `ja,chuk,in,myo,jin,sa,o,mi,sin,yu,sul,hae`.
- 오행 키: `wood,fire,earth,metal,water`(목화토금수).
- `supplementPriority[0]`이 **가장 먼저 보완할 오행** = 작명이 채워야 할 1순위.

## 에러 형식 (4xx)

```jsonc
{
  "contract": "saju-pillars-v1",
  "error": { "code": "UNSUPPORTED_CALENDAR", "message": "...", "field": "calendar" }
}
```

| status | code | 의미 |
|---|---|---|
| 400 | `INVALID_BODY` | 본문이 JSON 객체가 아님 |
| 400 | `INVALID_CALENDAR` | `calendar`가 solar/lunar가 아님 |
| 400 | `UNSUPPORTED_CALENDAR` | v1 미지원(lunar) — 호출 전 양력 변환 필요 |
| 400 | `INVALID_BIRTH_DATE` | `YYYY-MM-DD` 형식 아님 또는 달력상 없는 날짜(예: `2023-02-29`) |
| 400 | `UNSUPPORTED_TIMEZONE` | `Asia/Seoul` 외 — v1 미지원 |
| 400 | `MISSING_BIRTH_TIME` | `timeUnknown`이 아닌데 `birthTime` 없음 |
| 400 | `INVALID_BIRTH_TIME` | `HH:mm` 형식 아님 |
| 400 | `INVALID_SEX` | 허용 값 아님 |
| 400 | `OUT_OF_SUPPORTED_RANGE` | 검증된 절기 계산 범위 밖의 날짜 |
| 401 | `UNAUTHORIZED` | `x-api-key` 누락/불일치 |
| 405 | `METHOD_NOT_ALLOWED` | POST 외 메서드 |

## 예시 (curl)

```bash
curl -sS -X POST https://<deployment>/api/saju-pillars \
  -H "Content-Type: application/json" \
  -H "x-api-key: $SAJU_API_KEY" \
  -d '{
    "birthDate": "1990-01-01",
    "birthTime": "10:30",
    "calendar": "solar",
    "timezone": "Asia/Seoul",
    "sex": "male"
  }'
```

위 입력의 실제 응답이 **응답 스키마(200)** 예시와 동일하다(아래 PoC로 캡처). 음력 호출 예시:

```bash
curl -sS -X POST https://<deployment>/api/saju-pillars \
  -H "Content-Type: application/json" \
  -d '{"birthDate":"1990-01-01","birthTime":"10:30","calendar":"lunar","sex":"male"}'
# → 400 { "error": { "code": "UNSUPPORTED_CALENDAR", "field": "calendar", ... } }
```

## PoC 재현

```bash
npm run build --workspace @saju-lab/saju-core
node scripts/poc-saju-pillars.mjs   # 로컬 http 서버로 위 두 호출을 실제 실행·출력
```

PoC 출력은 `fixture-1990`(金 부재) 골든 값과 분포·부족오행까지 일치한다(형식 유효 ≠ 명리적 정확).

## 안드로이드(소비자) 통합 노트

- `OkHttp`/`Retrofit`로 `POST .../api/saju-pillars`, JSON 본문은 위 요청 스키마.
- `x-api-key`는 빌드 시크릿/원격 구성으로 주입(앱에 하드코딩 금지).
- 음력 입력은 소비자 측에서 양력 변환 후 `calendar:"solar"`로 호출(v1 범위).
- 응답에서 `fiveElements.supplementPriority`를 작명 보완 타깃으로 사용.
