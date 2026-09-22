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

## 음력 입력 (2026-09-22 additive, 4단계)

```jsonc
{ "birthDate": "2025-06-15", "calendar": "lunar", "isLeapMonth": true, "birthTime": "10:00", "sex": "female" }
```

- `calendar: "lunar"`는 한국 음력(한국천문연구원 음양력 자료, usingsky/korean_lunar_calendar MIT에서 추출한 1900~2050 표)이다. 양력으로 환산한 뒤 기존 solar 경로로 계산하고, 응답 `resolution.calendar: { input: "lunar", isLeapMonth, solarDate }`에 환산 결과를 적는다(solar 입력은 `{ input: "solar", solarDate }`).
- `isLeapMonth`(기본 false): 그 해 윤달의 날짜. 예: 음력 2025-06-15는 평달이면 양력 2025-07-09, 윤6월이면 2025-08-08.
- 없는 날짜(윤달이 없는 달의 윤달, 29일 달의 30일, 13월 …) = **`INVALID_LUNAR_DATE`(400)**, 근처 날짜로 흘리지 않는다. 음력 연도가 1900~2050 밖이거나 환산한 양력이 절기표(1920-01-06~) 밖이면 `OUT_OF_SUPPORTED_RANGE`. `calendar:"solar"`에 `isLeapMonth:true`를 붙이면 `INVALID_LUNAR_DATE`.
- 종전 `UNSUPPORTED_CALENDAR`(lunar 거부)는 더 이상 발생하지 않는다(코드 목록엔 남김). 양→음 역변환은 제공하지 않는다.

## 요청 옵션 (2026-09-22 additive, 3단계)

```jsonc
{
  "birthPlace": "seoul",              // 선택. 17개 시·도 코드: seoul busan daegu incheon gwangju daejeon ulsan sejong
                                      //   gyeonggi gangwon chungbuk chungnam jeonbuk jeonnam gyeongbuk gyeongnam jeju. 기본 seoul
  "options": {                        // 선택. 전부 생략 = 현재 동작
    "trueSolarTime": false,           // true면 시주에 경도 보정(시·도청 경도 − 135°) × 4분 적용. 서울 −32분. **균시차 미적용**
    "jaHourPolicy": "late",           // "late" = 23시대 일주 달력일 유지(야자시, 기본) | "early" = 다음 날 일주(조자시)
    "dayBoundary": "midnight"         // "midnight" = KST 자정(기본) | "trueSolar" = 보정 시각 자정(학파 옵션)
  }
}
```

- 진태양시 = **경도 보정만**. 균시차(equation of time)는 v1에서 적용하지 않는다(회의 2026-09-22 A1-3 ⑤ 명문화). 절입(연·월주) 비교에는 어떤 옵션도 영향을 주지 않는다.
- 잘못된 값: `INVALID_BIRTH_PLACE`(400), `INVALID_OPTIONS`(400, 알 수 없는 키 포함).

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
  "resolution": {                     // (2026-09-22 additive) 어느 규칙으로 계산했는지
    "appliedOffsetMin": 0,            // 표준시 이력: KST에 맞추려고 뺀 분. 0 = 변환 없음(2000년 이후 항상 0)
    "flags": [],                      // "utc+8:30" | "dst" | "ambiguous" | "nonexistent"
    "trueSolarTimeApplied": false,    // options.trueSolarTime 적용 여부
    "trueSolarOffsetMin": -32,        // birthPlace의 경도 보정 분(적용 안 해도 보고)
    "birthPlace": "seoul",
    "jaHourPolicy": "late",
    "dayBoundary": "midnight",
    "calendar": { "input": "solar", "solarDate": "1990-01-01" },  // 음력 입력이면 { "input": "lunar", "isLeapMonth": …, "solarDate": … }
    "nearBoundary": [                 // 경계 명식 플래그(KST 벽시계 기준, 시각 미상이면 [])
      { "kind": "hourBranch", "minutes": 10, "direction": "after" }   // 시지 경계 [B−10, B+34]분
      // { "kind": "dayMidnight", "minutes": -20, "direction": "before" }             // 자정 ±32분
      // { "kind": "solarTerm", "minutes": -27, "direction": "before", "term": "ipchun", "at": "2024-02-04T17:27" } // 절입 ±60분
    ]
  },
  "alternates": {                     // (3단계 additive) 반대쪽 명식 — 명식이 다를 때만, 시각 미상이면 없음
    "trueSolarTime": { "applied": true, "appliedMinutes": -32, "pillars": { /* 4기둥 */ } },
    "jaHourPolicy":  { "policy": "early", "pillars": { /* 4기둥 */ } }
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
- `alternates`는 요청 옵션의 **반대쪽**만 담는다(옵션 없이 부르면 `trueSolarTime.applied: true`, `jaHourPolicy.policy: "early"`). 명식이 같으면 키가 생략된다. `dayBoundary`는 alternates에 포함하지 않는다.
- `nearBoundary`는 옵션과 무관하게 항상 계산된다. 소비자는 `hourBranch`가 있을 때만 출생지를 물어 `trueSolarTime: true`로 다시 부르는 흐름을 권장한다(웹앱이 그렇게 한다).
- `resolution`: 1908~1961년의 UTC+8:30 표준시 구간과 서머타임 연도(1948-51·55-60·87-88) 출생은 당시 시계값을
  KST로 환산한 뒤 계산한다(`docs/algorithms/SOLAR_TERM_SPEC.md` «한국 시간대 이력 정규화»). 예: 1955-02-04 22:50 →
  `appliedOffsetMin: -30, flags: ["utc+8:30"]`. `ambiguous`는 서머타임 종료일에 두 번 있던 시각(첫 번째 채택),
  `nonexistent`는 개시일에 건너뛴 시각(전이 전 오프셋 유지). 소비자는 무시해도 되지만 표시하면 «어느 규칙으로 계산했나»가 남는다.

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
| 400 | `OUT_OF_SUPPORTED_RANGE` | 검증된 절기 계산 범위 밖의 날짜 — 현재 범위는 1920-01-06 소한 ~ 2100-12-07 대설 직전(KASI 24기 표, `docs/algorithms/SOLAR_TERM_SPEC.md` «지원 범위») |
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
- 음력 입력은 `calendar:"lunar"`로 직접 보낼 수 있다(2026-09-22). baby-naming-ai는 계속 로컬 변환 후 `calendar:"solar"`를 보내도 된다 — 변경 요구 0.
- 응답에서 `fiveElements.supplementPriority`를 작명 보완 타깃으로 사용.
