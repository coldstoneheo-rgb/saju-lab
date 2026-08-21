# App Gateway — 모바일 클라이언트용 무비밀 경로 (`/api/app/*`)

> 대상 소비자: `baby-naming-ai` Android 앱(vc12~). 서버 대 서버 소비자는 기존
> `/api/saju-pillars`(x-api-key 게이트)를 계속 쓴다.

## 왜 생겼나

앱은 `GEMINI_API_KEY`와 `SAJU_API_KEY`를 `BuildConfig` 상수로 들고 있었다. R8은 식별자만
줄이고 **문자열 상수는 남기므로**, 배포 번들의 dex에서 `grep -a` 한 줄로 두 키가 평문으로
나왔다(baby-naming-ai `docs/SECURITY-AUDIT-vc11.md`, 2026-08-14 실측). 그중 Gemini 키는
유료 GCP 프로젝트 키라 추출자가 소유자 청구서로 호출할 수 있었다.

**앱 안에 안전하게 키를 넣는 방법은 없다.** 그래서 키를 서버로 옮긴다. 이 디렉터리의 라우트가
그 서버다.

## 설계 원칙

1. **클라이언트 비밀 0.** 프록시 인증 토큰을 번들에 넣으면 방금 없앤 키와 똑같이 추출된다.
   따라서 `/api/app/*`는 **어떤 비밀도 요구하지 않는다.**
2. **비밀이 없으니 방어는 «모양»과 «속도»로 한다.**
   - 요청을 그대로 전달하지 않고 **허용목록으로 재구성**한다(`_lib/gemini-request.ts`).
     호출자는 모델·도구·파일·스트리밍·후보 개수를 고를 수 없다.
   - IP 단위 레이트리밋(`_lib/rate-limit.ts`).
3. **금전 상한은 코드가 아니라 GCP 콘솔의 할당량 상한**이 담당한다. 이 층은 폭발 반경을
   「Google 청구서」에서 「이 Vercel 함수」로 줄이는 것이지 0으로 만들지 않는다.

## 라우트

| 경로 | 하는 일 | 인증 | 레이트리밋 |
|---|---|---|---|
| `POST /api/app/gemini-generate` | Gemini `generateContent` 게이트웨이. 모델은 서버가 고정(`GEMINI_MODEL`, 기본 `gemini-3.5-flash`) | 없음 | IP당 20회 / 5분 |
| `POST /api/app/saju-pillars` | `/api/saju-pillars`와 **동일 계약**, 키 게이트만 없음 | 없음 | IP당 30회 / 5분 |

`gemini-generate`는 성공 응답을 **그대로** 돌려준다. 이미 배포된 앱이 표준
`generateContent` 응답을 파싱하므로 여기서 모양을 바꾸면 조용한 계약 파기가 된다.
실패 시에는 상류 본문(프로젝트·할당량 정보가 실릴 수 있다)을 감추고
`{ contract, error: { code, message } }`만 돌려주며 원문은 함수 로그에만 남긴다.

## 환경 변수 (Vercel 프로젝트)

| 이름 | 필수 | 비고 |
|---|---|---|
| `GEMINI_API_KEY` | ✅ | 없으면 `/api/app/gemini-generate`가 503. **Preview·Production 양쪽에 설정해야** 프리뷰 배포로 검증할 수 있다 |
| `GEMINI_MODEL` | — | 기본 `gemini-3.5-flash` |
| `SAJU_API_KEY` | — | 기존 `/api/saju-pillars` 게이트용. `/api/app/*`는 쓰지 않는다 |

## 알려진 한계 (숨기지 않는다)

- **레이트리밋은 인메모리다.** 서버리스 인스턴스마다 자기 창을 갖는다. 실효 상한은
  `limit × 동시 인스턴스 수`이고, 분산 공격에는 사실상 무력하다. 공유 저장소(KV/Redis)가
  엄밀히 낫지만 계정·의존성·장애모드를 추가하므로 v1에서는 채택하지 않았다.
- **호출자를 인증하지 않는다.** 앱임을 증명하는 층(Play Integrity)은 별건(P2)이며,
  FREE 쿼터 파밍 방어와 같은 문제이므로 함께 설계해야 중복 투자가 없다.
- **`maxDuration: 300`**(`vercel.json`). 무거운 PREMIUM 생성이 68.7초까지 측정된 적이 있어
  60초로는 부족하다. 플랜이 이 값을 허용하지 않으면 배포가 알려준다.
