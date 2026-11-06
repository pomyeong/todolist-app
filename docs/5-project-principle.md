# TodoList 프로젝트 구조 설계 원칙

## 문서 이력

### 버전 이력

| 버전 | 일자 | 작성자 | 상태 | 비고 |
|---|---|---|---|---|
| v0.1 | 2026-11-04 | pmsong | 초안 | 최초 작성 |
| v0.2 | 2026-11-04 | pmsong | 초안 | 아키텍처 다이어그램 작성 중 발견한 API·화면 미정의 사항 결정(PD-19~25) |
| v0.3 | 2026-11-04 | pmsong | 초안 | PRD v0.10 인증 방식 변경(JWT HS384 + refresh 토큰) 반영 |
| v0.4 | 2026-11-04 | pmsong | 초안 | 문서 간 정합성 검토 반영 |
| v0.5 | 2026-11-04 | Claude | 초안 | API 명세 작성 중 발견한 미정의 사항 결정(PD-27~29) |
| v0.6 | 2026-11-05 | Claude | 초안 | 부하 테스트 제외(PRD v0.13) |
| v0.7 | 2026-11-05 | Claude | 초안 | 프론트 구현 중 결정 반영(`app/session.ts`, 연결 실패 문구) |
| v0.8 | 2026-11-05 | Claude | 초안 | 헬스 체크에 DB 연결 상태 추가 |
| v0.9 | 2026-11-05 | Claude | 초안 | 개발 환경 한정 Swagger UI(PD-30) |
| v0.10 | 2026-11-05 | Claude | 초안 | Vite 프록시 대신 CORS(PR-S-04, PRD v0.15) |
| v0.11 | 2026-11-05 | Claude | 초안 | 토큰 만료 시간 환경변수화(PR-S-01, PR-S-02) |
| v0.12 | 2026-11-05 | Claude | 초안 | 스키마 원본을 docs/schema.sql로(PR-S-10) |
| v0.13 | 2026-11-05 | Claude | 초안 | 현재 백엔드 코드 기준 동기화 |
| v0.14 | 2026-11-05 | Claude | 초안 | 할일 시작·종료 시간 요청 규칙 |
| v0.15 | 2026-11-05 | Claude | 초안 | 다국어 구조(i18n) |
| v0.16 | 2026-11-05 | Claude | 초안 | 화면 모드 구조 |
| v0.17 | 2026-11-05 | Claude | 초안 | 프론트 개발 모드 콘솔 로그(PR-S-13) |
| v0.18 | 2026-11-06 | Claude | 초안 | 현재 구현 기준 동기화(localStorage 예외, 다국어, 셀프 체크 기록, 디렉토리 트리) |

### 변경 이력

| 버전 | 일자 | 변경 위치 | 변경 내용 | 변경 사유 | 작성자 |
|---|---|---|---|---|---|
| v0.1 | 2026-11-04 | 전체 | 최초 작성 | - | pmsong |
| v0.2 | 2026-11-04 | PD-19~21, 7.2 | 상태 값 문자열, 할일 수정 본문, 완료 토글 본문과 `completedAt` 규칙 | API 계약 미정의 | pmsong |
| v0.2 | 2026-11-04 | PD-22, PD-25 | 오류 판정 순서, 성공 상태 코드 | 구현마다 응답이 달라질 위험 | pmsong |
| v0.2 | 2026-11-04 | PD-23 | 월 뷰 격자 앞뒤 채움 칸은 빈 칸 | BR-17 기간 밖 칸의 표시 미정의 | pmsong |
| v0.2 | 2026-11-04 | PD-24, PR-L-12 | 첫 진입 `GET /api/me`의 401은 전역 처리 대상에서 제외 | `/login`에서 다시 `/login`으로 보내는 반복 방지 | pmsong |
| v0.2 | 2026-11-04 | PR-L-06 | bcrypt 해시는 트랜잭션 밖에서 계산 | 커넥션 점유 최소 근거 명시 | pmsong |
| v0.3 | 2026-11-04 | PR-S-01~03, PR-S-05, PR-L-12, PR-T-04, PR-T-08, 7.2, 7.3, PD-15, PD-25, PD-26 | HS384 서명, access·refresh 토큰 쿠키, 갱신 API, 화면의 401 시 갱신 후 재요청, `refresh_tokens` 테이블 반영 | PRD v0.10 P-04 | pmsong |
| v0.3 | 2026-11-04 | 참조 문서 | PRD v0.9 → v0.10, 사용자 시나리오 v0.7 → v0.8 | 버전 동기화 | pmsong |
| v0.4 | 2026-11-04 | PR-L-06, PR-N-04 | 회원가입 트랜잭션에 refresh 토큰 포함, 테이블 목록에 `refresh_tokens` 추가 | 7.2 `services/auth.js` 행·ERD v0.2와 불일치 | pmsong |
| v0.4 | 2026-11-04 | 7.1, 7.2 | `docs/` 설명을 1~8번 문서로, `.env.example`에 `NODE_ENV` 추가 | 실제 문서 구성·PR-S-01 키 목록과 불일치 | pmsong |
| v0.4 | 2026-11-04 | 참조 문서 | PRD v0.10 → v0.11, 시나리오 v0.8 → v0.9, 와이어프레임 v0.3 → v0.4 | 버전 동기화 | pmsong |
| v0.5 | 2026-11-04 | PR-N-06 | 동사형 경로 예외에 `refresh` 추가 | 7.2·PR-S-05의 `/api/auth/refresh`와 불일치 | Claude |
| v0.5 | 2026-11-04 | PR-S-07, PR-T-02, 7.2 `domain/validate.js` | 비밀번호 trim 예외, 본문 한도 초과(413)·JSON 파싱 실패를 400 `VALIDATION_ERROR`로 변환 | API 명세(backend/swagger.yaml) 작성 중 발견한 미정의 사항 결정 | Claude |
| v0.5 | 2026-11-04 | PD-13 | 쿼리 파라미터 형식 오류는 400 `VALIDATION_ERROR`(경로 `:id`는 404 유지) | API 명세(backend/swagger.yaml) 작성 중 발견한 미정의 사항 결정 | Claude |
| v0.5 | 2026-11-04 | PD-25, 7.2 | 비밀번호 변경 200 → 204, 로그인·이름 수정·카테고리 수정의 200 응답 본문 | API 명세(backend/swagger.yaml) 작성 중 발견한 미정의 사항 결정 | Claude |
| v0.5 | 2026-11-04 | PD-20, PD-27~29 | `null` 처리, 시각 형식(ISO 8601 UTC), 할일 `categoryName`·사용자 `createdAt`/`updatedAt` 응답 필드 | API 명세(backend/swagger.yaml) 작성 중 발견한 미정의 사항 결정 | Claude |
| v0.5 | 2026-11-04 | 참조 문서 | 도메인 v0.6 → v0.7, PRD v0.11 → v0.12, 시나리오 v0.9 → v0.10, 와이어프레임 v0.4 → v0.5 | 버전 동기화 | Claude |
| v0.6 | 2026-11-05 | 범위, PR-T-08, PR-S-04, PR-S-08, 7.1, 7.2 `scripts/seed-load.js`, PD-01, PD-14, 커버리지, 참조 문서 | `load-test/`와 k6 원칙 폐기, 시드는 실행 계획 확인용(NFR-04). PRD v0.12 → v0.13 | PRD v0.13 부하 테스트 제외 | Claude |
| v0.7 | 2026-11-05 | PR-C-04, 7.3 | 서버가 NFR-15 형식을 주지 못한 경우(연결 실패·빈 본문) `api/client.ts`의 대체 문구 상수 하나를 예외로 허용, 401 전역 처리와 로그아웃이 함께 쓰는 `app/session.ts`(`clearSession`) 추가 | 백엔드 중단 시 Vite 프록시가 빈 본문 500을 줌(E-06-2), features 간 import 금지(PR-L-09) | Claude |
| v0.8 | 2026-11-05 | PR-S-08, PD-14, 7.2 `/api/health` | 헬스 체크가 `SELECT 1`로 DB 연결을 확인(정상 200 `db: 'up'`, 실패 503 `db: 'down'`) | 사용자 요청(서버 기동만으로는 DB 연결을 알 수 없음) | Claude |
| v0.9 | 2026-11-05 | PR-S-05, 7.2, PD-30 | `NODE_ENV=development`일 때만 `GET /api/docs`(Swagger UI)·`GET /api/docs/swagger.yaml` 제공, npm 의존성 없이 CDN `swagger-ui-dist` 사용 | 사용자 요청(개발 중 API 명세 열람·호출) | Claude |
| v0.10 | 2026-11-05 | PR-S-01, PR-S-04, 7.1, 7.3, PD-30 | Vite 프록시를 없애고 CORS로 전환: `CORS_ORIGIN` 설정, `middleware/cors.js`, 프론트 `VITE_API_BASE_URL`·`credentials: 'include'` | 사용자 결정(PRD v0.15 P-04) | Claude |
| v0.11 | 2026-11-05 | PR-S-01, PR-S-02 | access 토큰 만료·refresh 토큰 만료를 상수에서 환경변수 `JWT_ACCESS_EXPIRES_MINUTES`(기본 15)·`REFRESH_TOKEN_TTL_DAYS`(기본 7)로 이동 | 사용자 결정(PRD v0.16 P-04) | Claude |
| v0.12 | 2026-11-05 | PR-S-10, PD-08, 7.1, 7.2 | 스키마 단일 출처를 `backend/sql/schema.sql`에서 `docs/schema.sql`로 옮기고 `backend/sql/` 삭제, `db-init.js`가 `docs/schema.sql`을 읽음 | 사용자 결정(설계 문서와 DDL을 한곳에) | Claude |
| v0.13 | 2026-11-05 | PR-S-03, 7.1 | 토큰 만료·쿠키 `maxAge`를 환경변수 기본값으로 표기, `.env.example` 키 목록과 테스트 파일 목록(config·me·health·cors·scenarios)을 코드와 맞춤 | 백엔드 코드 기준 문서 동기화 | Claude |
| v0.14 | 2026-11-05 | PD-20, PD-27 | `startTime`·`endTime` 선택 필드, 수정에서 생략 시 `null`, `null` 허용 필드에 추가 | 도메인 v0.9 BR-24, ERD v0.7 DB-14 | Claude |
| v0.15 | 2026-11-05 | PR-C-04, 7.3 | `src/i18n/` 추가, 화면 문구는 사전에서만, 서버 오류 문구는 표시할 때 번역 | PRD v0.22 FR-18, P-31 | Claude |
| v0.16 | 2026-11-05 | 7.3 | `lib/theme.ts`·`themeStore.ts`, `components/ThemeSelect`, index.html 선적용 | PRD v0.23 FR-19 | Claude |
| v0.17 | 2026-11-05 | PR-S-13, 7.3 | 프론트 주요 지점(API 요청·응답·실패, 토큰 갱신, 쿼리·변경 오류, 세션 정리, 화면 이동) 콘솔 로그를 `lib/log.ts` 한 곳에서 개발 모드에만 출력 | 개발 중 흐름 추적. 운영 콘솔 노출·민감 정보 유출 방지 | Claude |
| v0.18 | 2026-11-06 | PR-L-10, PR-N-09 | 화면 언어(`lang`)·화면 모드(`theme`) 선호값만 localStorage 예외(P-29, P-31), i18n은 `src/i18n/` 사전 직접 작성 | 이미 구현·결정된 사항(PRD P-29·P-31, FR-18·19)과 원칙 문구 충돌 해소 | Claude |
| v0.18 | 2026-11-06 | PR-T-01, PR-T-05, PR-T-06, 7.1 | 시나리오 셀프 체크를 Playwright MCP로 수행해 `test/e2e/report.md`에 기록(코드 E2E 없음), 프론트 단위 테스트 파일 목록 | 2026-11-06 셀프 체크 79/79 통과, 실제 테스트 파일 | Claude |
| v0.18 | 2026-11-06 | 3.1, PR-S-05, PR-S-10 | 프론트 호출을 `VITE_API_BASE_URL + '/api/...'`로, `/api/health`·`/api/docs`는 `app.js`가 `apiRouter`보다 먼저 등록해 인증 밖, `ALTER TABLE`로 컬럼을 더한 개발 DB의 컬럼 순서 차이 | 코드(`api/client.ts`, `app.js`, `routes/index.js`)·README 기준 | Claude |
| v0.18 | 2026-11-06 | 7.1, 7.3 | 루트에 `test/e2e/`·`guide/`·`prompts/`·`.claude/`·`.mcp.json`, `.gitignore` 실제 항목. 프론트에 `ThemeSelect`·`lib/emoji.ts`·`WeekRow.tsx`·`features/auth/messages.ts`, `lib/` 항목 통합, 4주 뷰(FR-17·P-30)·이어진 막대(P-16)·날짜별 '+N' | 실제 디렉토리·코드 기준 | Claude |
| v0.18 | 2026-11-06 | 참조 문서 | 도메인 v0.7 → v0.11, PRD v0.14 → v0.24, 시나리오 v0.10 → v0.12, 와이어프레임 v0.5 → v0.12 | 버전 동기화 | Claude |
| v0.18 | 2026-11-06 | 7.2 `app.js` | `createApp()`은 그대로 두고 앱 인스턴스를 default export로 추가 | Vercel 배포에서 Express 프리셋이 `src/app.js`의 default export를 진입점으로 요구(사용자 배포 결정) | Claude |
| v0.18 | 2026-11-06 | 7.3 `vercel.json` | 운영 프론트는 `/api/*`를 백엔드로 rewrite해 같은 출처로 호출(운영 `VITE_API_BASE_URL`은 프론트 자신의 주소), 그 밖의 경로는 `index.html`(SPA) | `*.vercel.app`은 공개 접미사라 프론트·백엔드가 다른 사이트가 되어 `SameSite=Lax` 인증 쿠키가 안 실려 로그인 직후 401 | Claude |
| v0.18 | 2026-11-06 | 7.3 `app/`, 8장 표 | 최상위 경로에 `errorElement`(`RouteError.tsx`): 렌더링 오류 시 React Router 기본 개발용 화면 대신 3개 언어 문구와 새로고침 버튼 | 운영에서 오류 시 사용자에게 개발용 화면이 노출되고, 재배포 후 옛 청크 로드 실패는 새로고침으로 복구된다(사용자 요청) | Claude |
| v0.18 | 2026-11-06 | 7.2 `vercel.json` | 백엔드 Vercel 함수 리전을 `sin1`(싱가포르)로 고정 | 기본 `iad1`(워싱턴)에서 싱가포르 DB까지 쿼리마다 태평양 왕복으로 응답 지연(운영 스모크 관찰 #2) | Claude |

> 단일 출처 원칙: 용어, 엔티티, 상태 규칙(ST), 비즈니스 규칙(BR), 유스케이스(UC)는 [도메인 정의서 v0.11](./1-domain-definition.md)이, 기능(FR)·화면(SCR)·비기능(NFR)·목표(G)·일정(M)·리스크(R)·결정(P)은 [PRD v0.24](./2-PRD.md)이, 시나리오(SC)는 [사용자 시나리오 v0.12](./3-user-scenario.md)이, 화면 배치(WF·L)는 [와이어프레임 v0.12](./4-wireframe.md)이 정의한다. 이 문서는 해당 ID를 참조만 하며 규칙·오류 코드·수치를 다시 정의하지 않는다. 충돌하면 도메인 정의서 > PRD > 시나리오 > 와이어프레임 > 이 문서 순으로 따른다.
>
> ID 운영 원칙: PR-C·PR-L·PR-N·PR-T·PR-S·PD의 ID는 재사용하거나 재번호하지 않는다. 원칙·결정을 없애면 행을 지우지 말고 '폐기'로 표시한다.

## 1. 개요

| 항목 | 내용 |
|---|---|
| 목적 | 2일·1인 개발에서 Day 1 오전(M-01)에 바로 셋업하고, 이후 코드가 한 방향으로 쌓이게 하는 구조·규칙을 정한다. |
| 범위 | 프론트엔드, 백엔드, DB 스크립트의 디렉토리·레이어·네이밍·테스트·설정·보안·운영 원칙 |
| 범위 외 | 기능·규칙·화면 결정(도메인·PRD·와이어프레임), 운영 배포(P-10), 시각 디자인 |
| 스택 | PRD 6장 그대로. 이 문서가 스택을 바꾸지 않는다. 6장에 없는 선택만 8장 PD로 정한다. |
| 기본 태도 | 과설계 금지(PR-C-02). 규칙·검증·소유권은 서버 한 곳, 화면은 표시(PR-C-03). |

실행 형태(P-10): 로컬 단일 머신에서 Node 단일 프로세스(백엔드, 3000번) + PostgreSQL 17 + Vite 개발 서버(프론트, 5173번).

## 2. 모든 스택에 공통인 최상위 원칙

| ID | 규칙 | 이유 | 관련 ID |
|---|---|---|---|
| PR-C-01 | 문서가 정의한 것은 코드에서 다시 정의하지 않고 한 곳에 상수로 두고 ID로 추적한다. 오류 코드·상태 값은 상수(백엔드 `errors.js`·`domain/status.js`, 프론트 `api/types.ts`)로 두고, 규칙을 구현한 곳에는 한 줄 주석으로 ID를 단다(`// BR-07`).<br>하지 말 것: 오류 코드 문자열을 라우트마다 리터럴로 쓰기 | 단일 출처가 코드까지 이어져야 문서 변경 시 수정 지점을 찾을 수 있다. | NFR-15, ST-01~04 |
| PR-C-02 | 가장 단순한 구조를 먼저 쓴다. 몇 줄로 직접 쓸 수 있으면 의존성을 추가하지 않고, 추가하려면 8장 PD에 이유를 적는다.<br>하지 말 것: DI 컨테이너, 리포지토리 인터페이스, ORM, 캐시 서버, 메시지 큐, 마이크로서비스, 모노레포 도구(Nx·Turborepo), 상태 관리 라이브러리 추가(Redux 등), 폼 라이브러리 | 2일·1인. 스택은 PRD 6장·3.2에서 확정됐고, 나머지는 과설계다. | PRD 3.2, 6장, P-10, R-01 |
| PR-C-03 | 규칙 판정은 서버 한 곳에서 한다. 상태(ST) 판정, 입력 검증, 소유권 검증은 서버가 하고 화면은 결과를 표시만 한다. 화면 검증은 보조이며 P-24의 비밀번호 확인 일치 검사처럼 PRD가 화면에 맡긴 것만 한다.<br>하지 말 것: 프론트에서 상태 계산, 완료 토글 낙관적 업데이트 | 판정 로직 이중화는 불일치를 낳는다. | NFR-09, NFR-12, P-15, P-24 |
| PR-C-04 | 오류는 서버 형식 그대로 다룬다. 프론트는 `code`로 분기하고 `message`·`fields`를 표시한다. 다국어(P-31)에서는 `FormError`·`FieldError`가 서버의 알려진 한국어 문구를 `src/i18n/`의 번역으로 바꿔 보여주고, 모르는 문구는 그대로 둔다. 표시 위치는 PRD 4장 머리말을 따른다. 예외: 서버가 NFR-15 형식을 주지 못한 경우(연결 실패·빈 본문)만 `api/client.ts`의 대체 문구 상수 하나로 `INTERNAL_ERROR`를 만든다.<br>하지 말 것: 프론트가 오류 문구를 새로 만들기 | 문구 단일 출처. | NFR-15, P-13 |
| PR-C-05 | 날짜는 'YYYY-MM-DD' 문자열로 다룬다. DB(DATE) → API → 화면 전 구간에서 `Date` 객체 변환을 피하고, 프론트의 '오늘' 계산만 단말 현지 날짜로 한다.<br>하지 말 것: `new Date('2026-11-04')`(UTC로 해석되어 날짜가 밀림), `toISOString().slice(0, 10)`으로 오늘 구하기 | 시간대 변환으로 하루씩 어긋나는 오류 방지. | NFR-11, NFR-12, P-12, R-03 |
| PR-C-06 | 기능은 파일 단위로 떼어 둔다. Should·Could(주·일 뷰, 내 정보, 캘린더 편집 이동)는 별도 파일에 두어, 일정이 밀리면 파일 제외로 끝나게 한다. 미리 만들어 두는 확장 구조는 두지 않는다. | MoSCoW 순서 준수. | R-01, P-03, M-06 |
| PR-C-07 | 커밋은 Conventional Commits 한국어(`feat:`, `fix:`, `test:`, `docs:`, `chore:`)로 하고 가능하면 FR·BR ID를 넣는다. 기능 하나를 백엔드 → 프론트 순으로 끝까지 닫은 뒤 다음으로 간다. | 기존 커밋 컨벤션 유지, 리뷰어 없는 1인 개발의 셀프 추적. | R-05, 기존 커밋 이력 |
| PR-C-08 | 구조가 이 문서와 달라지면 코드보다 먼저 이 문서를 고치고 변경 이력을 남긴다. | 문서 우선 원칙(단일 출처). | - |

## 3. 의존성 / 레이어 원칙

### 3.1 방향

```
백엔드   routes ──▶ services ──▶ db.js (pg Pool, 파라미터 바인딩)
            │          │
            └──────────┴──▶ domain/ (I/O 없는 순수 함수), errors.js, config.js
         middleware/(auth, cors, error)는 app.js가 조립한다.

프론트   pages ──▶ features ──▶ api ──▶ fetch(VITE_API_BASE_URL + '/api/...')
            └────────┴──▶ components/, lib/ (공용. 어느 층에서나 import, 위로는 import 안 함)
```

### 3.2 원칙

| ID | 규칙 | 이유 | 관련 ID |
|---|---|---|---|
| PR-L-01 | 백엔드 레이어는 routes → services → db 3층이다. 위층만 아래층을 import하고, 거꾸로·건너뛰기(routes가 db 직접 사용)는 하지 않는다. | 최소 분리로 HTTP와 SQL·규칙을 가른다. 더 나누지 않는 근거는 3.3. | NFR-07, NFR-10 |
| PR-L-02 | routes는 HTTP만 다룬다: 요청 값 추출 → `domain/validate.js` 호출 → service 호출 → 상태 코드·JSON 응답. 핸들러는 10줄 안팎을 넘기지 않는다.<br>하지 말 것: routes에서 SQL 실행, 규칙(BR) 판정 | 규칙이 HTTP에 묶이면 테스트가 어렵다. | NFR-09, NFR-15 |
| PR-L-03 | services는 규칙·SQL·트랜잭션을 가진다. `req`/`res`를 모르고 `(userId, input)` 같은 값만 받는다. 실패는 `AppError`를 throw한다. | HTTP 없이 호출 가능, 오류 변환은 한 곳. | NFR-15 |
| PR-L-04 | SQL은 services 파일 안의 문자열로 직접 작성하고 `db.query(text, params)`만 쓴다. 모든 값은 `$1, $2 …`로 바인딩한다. 필터처럼 조건이 바뀌는 경우에도 SQL 조각은 코드의 고정 문자열이고 값만 바인딩한다.<br>하지 말 것: 템플릿 문자열·`+`로 값을 SQL에 끼워 넣기, `SELECT *`(비밀번호 해시 노출 방지, PR-S-06) | SQL 직접 작성의 인젝션 방지. | NFR-08, R-04 |
| PR-L-05 | 카테고리·할일에 접근하는 모든 SQL은 `user_id = $n`(토큰의 사용자 ID)을 포함한다. 0행이면 `NOT_FOUND`를 던져 '타인 데이터'와 '없음'을 구분하지 않는다. 지정한 카테고리(BR-04)도 같은 조건으로 확인한다. 조회 JOIN에도 양쪽 `user_id`를 건다.<br>하지 말 것: `WHERE id = $1`만으로 조회·수정·삭제 | 소유권 누락이 곧 데이터 유출이다. | NFR-07, BR-03, BR-04, R-04 |
| PR-L-06 | 트랜잭션(`db.withTransaction(fn)`)은 NFR-10 대상인 회원가입(사용자 + 기본 카테고리 + refresh 토큰), 카테고리 삭제(할일 이동 + 삭제) 두 곳에만 쓴다. 단일 문장은 트랜잭션 없이 쓴다. bcrypt 해시처럼 느린 계산은 트랜잭션을 열기 전에 끝낸다. | 필요한 곳만, 커넥션 점유 최소(풀 크기 20, NFR-03). | NFR-10, NFR-03, BR-10, BR-14 |
| PR-L-07 | `domain/`에는 I/O 없는 순수 함수만 둔다: 상태 판정(`status.js`), 입력 검증(`validate.js`). 다른 모듈을 import하지 않는다. | G-04 단위 테스트 대상을 DB 없이 검증한다. | G-04, NFR-09, NFR-12 |
| PR-L-08 | 조회는 쿼리 하나로 끝낸다(목록의 카테고리명은 JOIN). 행마다 추가 쿼리를 보내지 않는다. 정렬은 BR-20을 쿼리 한 곳(상수)에 두고 목록·캘린더가 공유하며, 마지막 키로 `id`를 덧붙여 순서를 고정한다. | N+1 방지(R-02), 정렬 규칙 단일화. | BR-20, NFR-04, R-02 |
| PR-L-09 | 프론트 레이어는 pages → features → api다. pages는 경로 단위 조합만, features는 화면 기능(컴포넌트·훅·스토어), api는 `fetch` 호출과 타입만 가진다. features끼리 직접 import하지 않고, 공유가 필요하면 `components/`·`lib/`·`api/`로 올린다.<br>하지 말 것: 컴포넌트에서 `fetch` 직접 호출 | 의존 방향 고정, 기능 파일 제외 용이(PR-C-06). | P-23, R-01 |
| PR-L-10 | 상태 보관 위치는 하나씩이다. 서버 데이터는 TanStack Query만, 클라이언트 UI 상태(필터·캘린더 선택 날짜·로그인 사용자 정보)는 Zustand만 쓴다. 서버 데이터(할일·카테고리)를 Zustand에 복사하지 않는다. 토큰은 어디에도 저장하지 않는다. Zustand `persist`는 쓰지 않는다(새로고침 시 초기화가 규칙).<br>하지 말 것: `localStorage`·`sessionStorage` 사용. 예외: 화면 언어(`lang`, `i18n/index.ts`)·화면 모드(`theme`, `lib/themeStore.ts`·`index.html`) 선호값만 localStorage에 둔다(P-29, P-31) | PRD 6장 역할 분담, 새로고침 시 필터 초기화(P-23). 언어·화면 모드는 다시 열어도 유지되는 개인 선호다. | PRD 6장, P-04, P-23, P-29, P-31 |
| PR-L-11 | 변경(mutation) 성공 후에는 `['todos']`·`['calendar']`(카테고리 변경이면 `['categories']`도) 쿼리를 무효화해 다시 조회한다. 무효화 호출은 `api/queryKeys.ts`의 헬퍼 한 곳에 둔다. 상태가 포함된 조회의 query key에는 `today`를 넣는다.<br>하지 말 것: 캐시 직접 수정, 낙관적 업데이트 | 상태 판정은 서버, 표시는 재조회 결과. | P-15, P-12, NFR-12 |
| PR-L-12 | 401 `UNAUTHORIZED`는 두 단계로 처리한다. (1) `api/client.ts`가 401 `UNAUTHORIZED`를 받으면 `POST /api/auth/refresh`를 한 번 호출하고(같은 탭의 동시 401은 진행 중인 갱신 하나를 공유), 성공하면 원래 요청을 한 번 다시 보낸다. `/api/auth/*` 요청과 재전송한 요청은 갱신 대상이 아니다. 첫 진입 `GET /api/me`에도 (1)을 적용한다. (2) 갱신이 실패해 401이 그대로 올라오면 QueryClient의 `QueryCache`·`MutationCache` `onError`에서 `code === 'UNAUTHORIZED'`이면 Zustand·쿼리 캐시를 비우고 `/login`으로 보낸다. `INVALID_CREDENTIALS`(로그인 실패)와 첫 진입 로그인 확인(`GET /api/me`, PD-24)은 대상이 아니다. | 모든 API에 같은 규칙, 화면별 중복 방지. | FR-04, FR-02, P-23 |

### 3.3 더 나누지 않는 이유

| 나누지 않는 것 | 근거 |
|---|---|
| controllers 별도 계층 | 핸들러가 검증 → service → 응답 10줄 안팎이라 routes와 합쳐도 책임이 섞이지 않는다. |
| repository / DAO / 인터페이스 | SQL이 약 30개이고 서비스별로 한 파일에 모인다. DB는 PostgreSQL 17 고정, ORM 금지(PRD 6장)라 교체 요구가 없다. 인터페이스를 두면 mock으로 테스트하게 되어 SQL 검증(R-04)이 비어 버린다(PR-T-04). |
| 모델·DTO 클래스 | JSON 객체를 그대로 쓰고 검증은 함수가 한다. |
| DI 컨테이너 | 모듈 import로 충분하다. 테스트는 mock 대신 실제 DB를 쓴다. |
| 프론트 전역 `hooks/`·`store/`·`services/` 폴더, Atomic Design, FSD | 화면 7개. 기능 폴더 안에 훅·스토어·컴포넌트를 함께 둔다. |
| 서버 상태 라이브러리 추가, Redux 등 | PRD 6장이 Zustand + TanStack Query로 확정했다. |

## 4. 코드 / 네이밍 원칙

| ID | 규칙 | 이유 | 관련 ID |
|---|---|---|---|
| PR-N-01 | 백엔드는 JavaScript ESM(`"type": "module"`), 프론트는 TypeScript `strict`다. 프론트에서 `any`를 쓰지 않는다. 백엔드에 TypeScript·JSDoc 타입 체계를 따로 만들지 않는다. | PRD 6장(백엔드 TypeScript 아님). | PRD 6장, PD-02 |
| PR-N-02 | 파일명: 백엔드는 자원 이름의 소문자 복수형을 층마다 같게 쓴다(`routes/todos.js`, `services/todos.js`). 층은 디렉토리가 구분하므로 파일명에 `Service`·`Controller`를 붙이지 않는다. 프론트는 컴포넌트·페이지 `PascalCase.tsx`, 그 외 `camelCase.ts`, 페이지는 `XxxPage.tsx`, 훅은 `useXxx.ts`, 스토어는 `xxxStore.ts`(export는 `useXxxStore`). | 파일만 보고 위치·역할을 안다. | - |
| PR-N-03 | 식별자: 변수·함수 `camelCase`, 상수 `UPPER_SNAKE_CASE`, 컴포넌트 `PascalCase`. 컴포넌트는 함수 컴포넌트·named export, 한 파일에 하나(아주 작은 하위 컴포넌트 예외). | 일관성. | - |
| PR-N-04 | DB: 테이블 `users`·`categories`·`todos`·`refresh_tokens`, 컬럼 `snake_case`(도메인 `userId` ↔ `user_id`). 제약·인덱스 이름은 명시한다(`uq_users_email`, `uq_categories_user_name`, `uq_categories_user_default`, `idx_todos_user_dates`, `idx_todos_user_category`). 중복 오류(23505)는 제약 이름으로 `DUPLICATE_EMAIL`/`DUPLICATE_CATEGORY`를 구분한다. | NFR-04 인덱스 방향 구현, 오류 코드 분기 근거. | NFR-04, NFR-15, BR-02, BR-13 |
| PR-N-05 | API JSON·쿼리 파라미터는 `camelCase`(`categoryId`, `startDate`, `today`, `from`, `to`)다. SELECT에서 `AS "startDate"`처럼 별칭을 명시해 변환하고, 범용 camelCase 변환기를 두지 않는다. | 도메인 속성명과 일치, 변환 코드 없음. | PRD 6장 |
| PR-N-06 | API 경로는 `/api` 접두사 + 복수 명사 자원이며 동사를 쓰지 않는다(예외: `auth`의 `signup`·`login`·`refresh`·`logout`, 하위 동작 `completed`·`password`). 상태 변경에 GET을 쓰지 않는다. 경로 목록은 7.2의 표가 정한다. | RESTful, CSRF 방어의 전제(PR-S-03). | NFR-15, PD-13 |
| PR-N-07 | 오류는 services·domain에서 `AppError(status, code, message, fields?)`를 throw하고 `middleware/error.js` 한 곳에서만 NFR-15 형식으로 응답한다. 예상 못한 오류는 500 `INTERNAL_ERROR`로 바꾼다.<br>하지 말 것: routes에서 `res.status(400).json(...)` 직접 작성 | 형식 단일화. | NFR-15 |
| PR-N-08 | 주석은 '왜'만 한 줄로 쓴다. 규칙 근거는 ID로 쓴다(`// BR-14: 삭제 전에 기본 카테고리로 이동`). 지름길에는 `shortcut: 한계, 업그레이드 시점`을 쓴다. | 코드가 보여 주지 않는 것만 남긴다. | PR-C-01 |
| PR-N-09 | 프론트 폼은 제어 컴포넌트(`useState`)로 쓰고, 입력란 옆 사유는 `fields[name]`을 `components/FieldError`로, 폼·화면 상단 오류는 `message`를 `components/FormError`로 표시한다. 고정 문구(P-21·P-22의 '할일이 없습니다.', '불러오는 중…', '갱신 중…')는 공용 컴포넌트에 한 번만 쓴다. i18n 라이브러리는 쓰지 않는다(ko·ja·en 사전을 `src/i18n/`에 직접 둔다, P-31). | 표시 위치 규칙(PRD 4장 머리말)의 일관성. | PRD 4장, P-21, P-22, P-31, PRD 3.2 |
| PR-N-10 | 스타일은 CSS Modules(`Xxx.module.css`)다. 모바일(360px) 기준으로 먼저 쓰고 `@media (min-width: 768px)`에서 데스크톱으로 넓힌다. 중단점은 768px 하나다. 가로 스크롤이 생기지 않게 한다. | 모바일·데스크톱 분기 한 번. | NFR-13, P-08 |
| PR-N-11 | 포맷·린트는 Biome(루트 `biome.json` 공유)이다: 2칸 들여쓰기, 작은따옴표, 세미콜론, 줄 폭 100. 커밋 전 `biome check`를 통과시킨다. | 도구 하나로 JS·TS 모두 처리. | PD-11 |

## 5. 테스트 / 품질 원칙

| ID | 규칙 | 이유 | 관련 ID |
|---|---|---|---|
| PR-T-01 | 테스트는 세 종류만 둔다. (1) 백엔드 단위: `domain/` 순수 함수. (2) 백엔드 API 통합: 실제 DB로 HTTP 호출. (3) 프론트 단위: 순수 함수. 코드로 둔 E2E·컴포넌트 테스트는 두지 않고, 화면은 시나리오 셀프 체크(G-03)로 확인한다. 셀프 체크는 Playwright MCP 브라우저 조작으로 수행하고 결과를 `test/e2e/report.md`(스크린샷 `test/e2e/screenshots/`)에 기록한다(2026-11-06 79/79 통과). | 2일 안에 가치가 큰 곳에만. | G-03, G-04, R-05 |
| PR-T-02 | G-04 대상은 모두 테스트한다. 순수 함수(`domain`)로 검증 가능한 것: ST-01~04(시작일·종료일 당일, 완료 우선, 완료 취소), BR-07, BR-21·22 경계(7/8/64/65자, 공백만, trim, 비밀번호는 trim하지 않음), 날짜 형식(`2026-13-01`). SQL이 판정하는 것은 API 통합으로 검증한다: BR-15 AND 결합, BR-16~18 월·주 경계, BR-19, BR-20 정렬. | PRD G-04의 검증 방법(단위 + API 통합)을 파일 단위로 나눈 것. | G-04, R-03, PD-09 |
| PR-T-03 | 소유권 API 테스트: 사용자 두 명(U1·U2)을 만들고 카테고리·할일의 모든 엔드포인트에 타인 ID를 보내 404 `NOT_FOUND`와 데이터 불변을 확인한다. 타인 카테고리 지정(BR-04), 타인 카테고리 필터(P-14)를 포함한다. 새 카테고리·할일 엔드포인트를 만들면 이 테스트에 케이스를 추가해야 완료다. | SQL 직접 작성의 최대 리스크. | R-04, NFR-07, E-C2 |
| PR-T-04 | API 테스트는 mock 없이 테스트 전용 PostgreSQL DB(`todolist_test`)에서 한다. 파일마다 시작 시 `TRUNCATE users, categories, todos, refresh_tokens RESTART IDENTITY CASCADE`로 비운다. 파일 병렬 실행을 막는다(`--test-concurrency=1`). | mock은 SQL·제약·인덱스를 검증하지 못한다. | R-04, NFR-04 |
| PR-T-05 | 테스트 이름에 시나리오·예외 ID를 넣는다(`E-04-2 시작일 > 종료일은 400`). 새 시나리오 예외가 생기면 대응 테스트를 만든다. 셀프 체크(G-03)는 SC-01~13을 화면에서 Playwright MCP로 수행하고 `test/e2e/report.md`에 기록한다(PR-T-01). | 추적성, 테스트 케이스는 시나리오에서 도출. | SC-01~13, G-03 |
| PR-T-06 | 프론트 단위 테스트(Vitest)는 순수 함수만 대상으로 한다: 월·4주·주 조회 기간 계산(`features/calendar/range.test.ts`), 칸별 할일·이어진 막대(`cellTodos.test.ts`), 날짜 문자열 연산·오늘 계산(`lib/date.test.ts`), API 클라이언트(`api/client.test.ts`)·쿼리 키(`api/queryKeys.test.ts`), 제목 이모지(`lib/emoji.test.ts`), 화면 모드 판정(`lib/theme.test.ts`), 다국어 사전(`i18n/messages.test.ts`). 반응형(360px·768px)은 M-05에서 수동 점검한다. | 캘린더 경계 계산이 R-03의 프론트 쪽 위험이다. | R-03, NFR-13, M-05 |
| PR-T-07 | 커밋 전 게이트: 백엔드 `npm test`, 프론트 `npm test`와 `tsc --noEmit`, 루트 `biome check`. CI·pre-commit hook은 두지 않는다. 커버리지는 `node --test --experimental-test-coverage`로 참고만 하고 수치 게이트는 없다. | 로컬 단일 머신(P-10), 테스트 대상은 PR-T-02·03이 정한다. | P-10, PD-12 |
| PR-T-08 | 폐기(v0.6): 부하 테스트 제외(PRD v0.13) | - | - |
| PR-T-09 | 느린 쿼리는 `EXPLAIN (ANALYZE)`로 확인하고 인덱스는 그 결과로 보강한다. 코드에서 미리 최적화하지 않는다(N+1 제거는 PR-L-08). | M-05는 측정 후 조치. | NFR-04, R-02, M-05 |

## 6. 설정 / 보안 / 운영 원칙

| ID | 규칙 | 이유 | 관련 ID |
|---|---|---|---|
| PR-S-01 | 설정은 환경변수로만 받고 `src/config.js` 한 곳에서 읽는다(Node `--env-file`, dotenv 미사용). 필수 값이 없으면 기동 시 즉시 종료한다. 키: `DATABASE_URL`, `JWT_SECRET`(HS384 키가 384비트 이상이 되도록 48자 이상), `PORT`(기본 3000), `DB_POOL_MAX`(기본 20), `NODE_ENV`, `CORS_ORIGIN`(허용할 프론트 출처, 기본 `http://localhost:5173`, production에서는 필수), `JWT_ACCESS_EXPIRES_MINUTES`(access 토큰 만료 분, 기본 15), `REFRESH_TOKEN_TTL_DAYS`(refresh 토큰 만료 일, 기본 7). 두 만료 값은 양의 정수가 아니면 기동하지 않는다. `.env`·`.env.test`는 커밋하지 않고 `.env.example`만 커밋한다.<br>하지 말 것: 다른 파일에서 `process.env` 직접 접근 | 설정 오류를 기동 시점에 발견. | NFR-03, PD-07 |
| PR-S-02 | PRD가 확정한 값은 설정이 아닌 상수로 코드에 둔다: bcrypt cost 10, 서명 알고리즘 HS384, 쿠키 이름(`access_token`, `refresh_token`). 토큰 만료 시간은 예외로 환경변수(PR-S-01)로 받는다(PRD v0.16 P-04). | 환경마다 달라지면 안 되는 값. | NFR-06, P-04 |
| PR-S-03 | 인증은 access 토큰과 refresh 토큰 두 개를 쓴다(P-04). access 토큰은 JWT(HS384, 페이로드는 `sub`=사용자 ID만, 만료 기본 15분 `JWT_ACCESS_EXPIRES_MINUTES`)이고 `access_token` 쿠키(httpOnly·`SameSite=Lax`, `path=/`, `maxAge` = access 만료)로 보낸다. 검증할 때 `algorithms: ['HS384']`를 명시해 다른 알고리즘(`none`, HS256 등)으로 서명된 토큰을 거부한다. refresh 토큰은 JWT가 아닌 `crypto.randomBytes(32)`의 base64url 문자열이고 `refresh_token` 쿠키(httpOnly·`SameSite=Lax`, `path=/api/auth`, `maxAge` = refresh 만료(기본 7일 `REFRESH_TOKEN_TTL_DAYS`))로 보낸다. DB `refresh_tokens`에는 SHA-256 해시만 저장한다(DB-13). `POST /api/auth/refresh`는 해시가 맞고 만료되지 않은 행을 한 문장으로 삭제(`DELETE … RETURNING user_id`)한 뒤 새 쌍을 발급한다(회전, 재사용 불가). 로그아웃은 그 refresh 토큰 행을 지우고 같은 옵션으로 두 쿠키를 지운다. `secure`는 `NODE_ENV=production`일 때만 켠다(HTTPS는 범위 외). access 토큰 블랙리스트는 만들지 않는다. 상태 변경 API는 GET을 쓰지 않고 JSON 본문(`express.json`)만 받아, `SameSite=Lax`와 함께 CSRF를 막는다. | access 검증은 stateless(NFR-02), 세션 종료는 refresh 토큰 삭제로 한다. 토큰 JS 접근 차단. refresh 쿠키 경로를 좁혀 일반 API 요청에 실리지 않게 한다. | P-04, NFR-02, FR-03, DB-13, PD-26 |
| PR-S-04 | 개발·운영 모두 프론트가 API 서버를 직접 호출하고 CORS로 허용한다(P-04). 백엔드 `middleware/cors.js`는 `Origin`이 `CORS_ORIGIN`과 같을 때만 `Access-Control-Allow-Origin`(그 출처)·`Access-Control-Allow-Credentials: true`를 주고, preflight(`OPTIONS`)에는 허용 메서드(`GET, POST, PATCH, PUT, DELETE`)·헤더(`Content-Type`)를 담아 204로 답한다. 와일드카드(`*`)는 쓰지 않는다. 프론트는 API 주소를 빌드 환경변수 `VITE_API_BASE_URL` 한 곳에서만 읽고(`api/client.ts`) 모든 요청에 `credentials: 'include'`를 붙인다. 쿠키는 `SameSite=Lax` 그대로이므로 프론트와 API는 같은 사이트(등록 도메인, 포트 무관)에 둔다.<br>하지 말 것: `cors` 패키지 추가(몇 줄 미들웨어로 충분, PR-C-02), 출처 여러 개·정규식 허용 | P-04. 사용자 결정(PRD v0.15). 허용 출처를 하나로 고정해 다른 사이트가 쿠키를 실은 요청의 응답을 읽지 못하게 한다. | P-04, PD-04, PR-S-03 |
| PR-S-05 | 인증은 기본 적용이다. `routes/index.js`는 `/api/auth/*`(signup·login·refresh·logout)를 제외한 모든 라우터에 `auth` 미들웨어를 먼저 건다. `/api/health`와 개발 환경 한정 `/api/docs`(PD-30)는 `app.js`가 `apiRouter`보다 먼저 등록해 인증을 거치지 않는다. access 토큰 쿠키가 없거나 만료·위조면 401 `UNAUTHORIZED`다. | 새 라우트가 실수로 공개되는 것을 막는다. | BR-01, FR-04 |
| PR-S-06 | 비밀번호는 bcrypt(cost 10)로만 저장한다. 평문·해시·토큰을 로그·응답에 내보내지 않으며, 사용자 조회 SQL은 컬럼을 명시한다. | 민감 정보 노출 방지. | NFR-06, PR-L-04 |
| PR-S-07 | 모든 입력은 서버에서 검증한다. 문자열은 trim한 뒤 검사하고(BR-22, 비밀번호는 trim하지 않음), 본문에서 필요한 필드만 꺼내 쓰며, `express.json`의 본문 한도는 16kb로 낮춘다. 한도 초과(`express.json`의 413 `entity.too.large`)와 JSON 파싱 실패는 `middleware/error.js`가 400 `VALIDATION_ERROR`로 바꾼다(새 오류 코드 없음). | 신뢰 경계 검증, 불필요 필드 무시. | NFR-09, BR-21, BR-22 |
| PR-S-08 | 오류 로그는 stderr에 JSON 한 줄(시각, 메서드, 경로, 오류 메시지, stack)로 남기고 500 응답에는 상세를 넣지 않는다. 요청 본문·쿠키·비밀번호는 기록하지 않는다. 구조화 로깅 라이브러리·메트릭은 두지 않는다. 헬스 체크는 `GET /api/health`는 `SELECT 1`로 DB 연결까지 확인해 정상이면 200 `{ ok: true, db: 'up' }`, DB 실패면 503 `{ ok: false, db: 'down' }`이다. | 로컬 단일 프로세스라 기동과 DB 연결 확인이면 충분하다. | NFR-15, P-10, P-25, PD-14 |
| PR-S-09 | DB 연결은 프로세스당 `pg.Pool` 하나(`db.js`)다. 크기는 `DB_POOL_MAX`. DATE 타입(OID 1082)은 문자열로 받도록 pg 타입 파서를 `db.js`에서 한 번 설정한다. `SIGINT`·`SIGTERM`에서 `pool.end()`를 호출한다. | 풀 설정·날짜 파싱 한 곳. | NFR-03, NFR-11 |
| PR-S-10 | 스키마의 단일 출처는 `docs/schema.sql` 하나다(설계 문서와 함께 둔다)(테이블·제약·NFR-04 인덱스). 변경은 이 파일을 고치고 `npm run db:init -- --reset`로 다시 만든다. 마이그레이션 도구는 쓰지 않는다. 상태 컬럼은 만들지 않는다(NFR-12). 개발 DB에 NULL 허용 컬럼을 `ALTER TABLE`로 더한 경우(README의 시작·종료 시간 업그레이드 절차) 실제 컬럼 순서가 `schema.sql`과 다를 수 있다. 기준은 `schema.sql`이며 `--reset`으로 일치시킨다. | 운영 데이터가 없다(P-10). | NFR-04, NFR-12, PD-08 |
| PR-S-11 | 운영 범위는 로컬 단일 머신이다. Docker·프로세스 관리자·CI·배포 스크립트는 만들지 않는다. PostgreSQL 17은 로컬 설치를 쓴다. | 배포는 범위 외. | P-10, PRD 3.2 |
| PR-S-12 | 의존성은 `package-lock.json`을 커밋하고 `npm ci`로 설치한다. `engines.node`로 Node LTS(22 이상)를 명시한다. 의존성을 추가하면 8장 PD를 먼저 갱신한다. | 재현 가능한 설치, PR-C-02 준수. | PR-C-02 |
| PR-S-13 | 프론트 콘솔 로그는 `lib/log.ts`만 쓰고 개발 모드(`import.meta.env.DEV`, vitest 제외)에서만 출력한다. 대상은 주요 지점뿐이다: API 요청(메서드·경로·상태·소요 ms)·연결 실패, 토큰 갱신 결과, 쿼리·변경 오류, 401 세션 정리, 화면 이동. 요청·응답 본문, 쿠키, 비밀번호는 남기지 않는다. 로깅 라이브러리는 두지 않는다.<br>하지 말 것: 컴포넌트에서 `console.*` 직접 호출 | 개발 중 흐름 추적. 운영 빌드에서는 출력이 없어 사용자 콘솔에 내부 경로·오류가 노출되지 않는다. | PR-S-08, NFR-06, PR-C-02 |

## 7. 디렉토리 구조

### 7.1 저장소 루트

```
todolist-app/
├─ docs/                  # 1~8번 문서, wireframe/ (코드 없음)
├─ backend/               # Node.js + Express + pg (JavaScript)
├─ frontend/              # React 19 + TypeScript + Vite
├─ test/e2e/              # 셀프 체크 기록 report.md, screenshots/ (PR-T-01)
├─ guide/                 # tutorial.md, ai-playbook.md, playbook-src/
├─ prompts/               # 문서 생성에 쓴 프롬프트
├─ .claude/               # Claude Code 에이전트·스킬·설정
├─ .mcp.json              # MCP 서버 설정
├─ biome.json             # 포맷·린트 공통 설정 (PR-N-11)
├─ .gitignore             # node_modules, .env·.env.*(.env.example·frontend/.env.development 제외), dist, .playwright-mcp/ 등
└─ README.md              # 실행 순서 (7.4)
```

루트에 `package.json`·워크스페이스·빌드 도구를 두지 않는다. 패키지(`backend`, `frontend`)는 각자 `npm`으로 설치·실행한다(PD-01).

### 7.2 백엔드

```
backend/
├─ package.json           # "type": "module", engines.node
├─ vercel.json            # 운영 함수 리전 sin1(DB Supabase ap-southeast-1과 같은 지역)
├─ .env.example           # PR-S-01 키 전부(DATABASE_URL, JWT_SECRET, PORT, DB_POOL_MAX, NODE_ENV, CORS_ORIGIN, JWT_ACCESS_EXPIRES_MINUTES, REFRESH_TOKEN_TTL_DAYS)
├─ scripts/
│  ├─ db-init.js          # docs/schema.sql 실행(PR-S-10), --reset이면 삭제 후 생성
│  └─ seed-load.js        # 실행 계획 확인용 사용자·할일 입력 (NFR-04)
├─ src/
│  ├─ server.js           # config 로드 → app.listen, 종료 시 pool.end
│  ├─ app.js              # createApp(): 미들웨어·라우터 조립, /api/health (테스트가 import). default export는 Vercel Express 진입점용 앱 인스턴스
│  ├─ config.js           # 환경변수 읽기·검증 (PR-S-01)
│  ├─ db.js               # Pool, query, withTransaction, DATE 문자열 파서
│  ├─ errors.js           # AppError, 오류 코드 상수
│  ├─ middleware/
│  │  ├─ auth.js          # access 토큰(HS384) 검증 → req.userId, 쿠키 직접 파싱
│  │  ├─ cors.js          # CORS_ORIGIN 하나만 허용, preflight 204 (PR-S-04)
│  │  └─ error.js         # 404(알 수 없는 /api 경로) + NFR-15 형식 응답
│  ├─ routes/             # HTTP 입출력만 (PR-L-02)
│  │  ├─ index.js         # /api 마운트, 인증 경계 (PR-S-05)
│  │  ├─ auth.js
│  │  ├─ me.js
│  │  ├─ categories.js
│  │  ├─ todos.js
│  │  └─ calendar.js
│  ├─ services/           # 규칙·SQL·트랜잭션 (PR-L-03~06)
│  │  ├─ auth.js
│  │  ├─ users.js
│  │  ├─ categories.js
│  │  └─ todos.js         # 목록·캘린더·CRUD·완료 전환
│  └─ domain/             # 순수 함수 (PR-L-07)
│     ├─ status.js        # deriveStatus(todo, today), 상태 필터
│     └─ validate.js      # 이메일·비밀번호·이름·카테고리·할일·날짜 검증
└─ test/
   ├─ helpers/            # 앱 기동(포트 0), DB 비우기, 가입·로그인 쿠키 헬퍼
   ├─ unit/               # status.test.js, validate.test.js, config.test.js(환경변수 검증)
   └─ api/                # auth, me, categories, todos, calendar, ownership, health(·db-down), cors, scenarios(SC-01~13) 테스트
```

**API 경로**(PRD P-25가 이 표에 위임한다. 요청·응답 필드는 도메인 속성명(camelCase)을 따른다.)

| 경로 | 메서드 | 용도 | FR |
|---|---|---|---|
| `/api/auth/signup`, `/login`, `/refresh`, `/logout` | POST | 가입(자동 로그인, 토큰 쌍 쿠키 발급), 로그인(토큰 쌍 발급), 토큰 갱신(refresh 토큰 회전), 로그아웃(refresh 토큰 삭제·쿠키 삭제) | FR-01~04, P-04 |
| `/api/me` | GET, PATCH | 내 정보 조회(화면 첫 진입 시 로그인 여부 확인), 이름 수정 | FR-14 |
| `/api/me/password` | PUT | 비밀번호 변경(204, 새 토큰 쌍 쿠키 발급) | FR-15 |
| `/api/categories`, `/api/categories/:id` | GET, POST / PATCH, DELETE | BR-23 순서 목록, 등록, 이름 수정, 삭제 | FR-13 |
| `/api/todos?categoryId&status&today` | GET | 목록(필터·`today` 필수, `status` 값은 PD-19) | FR-09 |
| `/api/todos`, `/api/todos/:id` | POST / GET, PATCH, DELETE | 등록, 단건 조회(편집 화면), 수정(본문은 PD-20), 삭제 | FR-05, FR-06, FR-08 |
| `/api/todos/:id/completed` | PATCH | 완료 / 완료 취소, 본문 `{ "completed": boolean }`(PD-21) | FR-07 |
| `/api/calendar?from&to&today` | GET | 기간과 겹치는 할일(월·주·일 뷰 공통) | FR-10~12 |
| `/api/docs`, `/api/docs/swagger.yaml` | GET | 개발 환경(`NODE_ENV=development`)에서만 Swagger UI와 명세 원본(PD-30). 그 밖의 환경은 404 | - |
| `/api/health` | GET | 인증 없이 기동·DB 연결 확인: 200 `{ "ok": true, "db": "up" }`, DB 실패 503 `{ "ok": false, "db": "down" }` | P-25 |

| 위치 | 역할 | 구현하는 ID |
|---|---|---|
| `docs/schema.sql` | `users`·`categories`·`todos`·`refresh_tokens`(DB-13), `DATE` 컬럼, 이메일 유일, `(user_id, name)` 유일, 사용자당 기본 카테고리 1개 부분 유일 인덱스, `todos(user_id, start_date, end_date)`·`(user_id, category_id)` 인덱스, `start_date <= end_date` CHECK(방어용), 상태 컬럼 없음 | NFR-04, NFR-11, NFR-12, BR-02, BR-07, BR-10, BR-12, BR-13 |
| `scripts/db-init.js` | 스키마 적용(PD-08) | M-01 |
| `scripts/seed-load.js` | 사용자 1000명·사용자당 할일 100건, 비밀번호 해시는 한 번 만들어 재사용 | NFR-04, NFR-05 |
| `config.js`, `db.js` | 환경변수, 풀(기본 20), 트랜잭션 헬퍼, DATE 문자열 파서 | NFR-03, NFR-10, NFR-11, NFR-08 |
| `errors.js`, `middleware/error.js` | 오류 클래스·코드 상수, 응답 형식, 500 상세 비노출 | NFR-15, P-13 |
| `middleware/auth.js`, `routes/auth.js` | access 토큰 검증(HS384만 허용), 토큰 쌍 쿠키 발급·삭제, 갱신 | FR-02~04, BR-01, NFR-02, P-04 |
| `services/auth.js` | 가입(사용자 + 기본 카테고리 + refresh 토큰, 한 트랜잭션), 로그인, bcrypt, access 토큰 서명(HS384), refresh 토큰 발급·회전·삭제 | FR-01, FR-02, BR-10, NFR-06, NFR-10, P-04, DB-13 |
| `routes/me.js`, `services/users.js` | 내 정보, 이름·비밀번호 수정(Should, 비밀번호 변경 시 그 사용자의 refresh 토큰 전체 삭제 후 새 쌍 발급) | FR-14, FR-15, BR-05, P-04 |
| `services/categories.js` | 카테고리 CRUD, 기본 카테고리 보호, 삭제 시 할일 이동 + 삭제(한 트랜잭션), BR-23 순서 | FR-13, BR-12~14, BR-23, NFR-10 |
| `services/todos.js` | 할일 CRUD, 완료 전환, 목록(카테고리 필터는 SQL, 상태 필터는 판정 후 JS), 기간 조회(겹침 조건은 SQL, 상태는 판정 함수), BR-20 정렬, 소유권 | FR-05~12, BR-04, BR-15~20, NFR-07, NFR-12, P-11, P-12, P-14 |
| `domain/status.js` | ST-01~04 판정(한 곳) | ST-01~04, NFR-12, G-04 |
| `domain/validate.js` | 이메일 형식, 비밀번호·길이 제한, 필수·trim(비밀번호 제외), NOT NULL 필드의 `null` 거부(PD-27), 시작일 ≤ 종료일, `YYYY-MM-DD` 실제 날짜 검사, `categoryId`·`today`·`status`·`from`·`to` | NFR-09, BR-06, BR-07, BR-21, BR-22, P-12, P-14 |
| `test/unit` | domain 단위 테스트 | G-04, R-03 |
| `test/api` | API·소유권 테스트, 시나리오 예외 ID | R-04, PR-T-02, PR-T-03 |

백엔드 의존성: `express`(5), `pg`, `jsonwebtoken`, `bcrypt`. 개발용: `@biomejs/biome`(루트 설정 공유). 개발 서버 재시작은 `node --watch`다. 8장 PD로 정당화한다.

**package.json scripts**: `dev`(`node --watch --env-file=.env src/server.js`), `start`, `test`(`node --env-file=.env.test --test --test-concurrency=1`), `db:init`, `seed:load`.

### 7.3 프론트엔드

```
frontend/
├─ package.json
├─ index.html
├─ vite.config.ts         # React 플러그인, 포트 5173, test 설정
├─ .env.development       # VITE_API_BASE_URL=http://localhost:3000 (PR-S-04)
├─ vercel.json            # 운영: /api/* → 백엔드 rewrite(같은 출처라 Lax 쿠키 전송), 나머지 → index.html
├─ tsconfig.json          # strict
└─ src/
   ├─ main.tsx            # QueryClient(전역 401 처리, PR-L-12), RouterProvider
   ├─ app/
   │  ├─ router.tsx       # 경로 표(P-23), 알 수 없는 경로·`/` 리다이렉트, 최상위 errorElement
   │  ├─ RouteError.tsx   # 렌더링 오류 화면(문구 + 새로고침), 옛 청크 로드 실패도 새로고침으로 복구
   │  ├─ RequireAuth.tsx  # 로그인 여부 가드, 로그인 상태의 /login·/signup 우회
   │  ├─ AppLayout.tsx    # 내비게이션(WF-01), 화면 상단 오류·'갱신 중…' 영역
   │  └─ session.ts       # clearSession(): 스토어 reset + 쿼리 캐시 비우기 (401 전역 처리·로그아웃 공용)
   ├─ pages/              # 경로 단위 조합만 (얇게)
   │  ├─ LoginPage.tsx        # /login      SCR-01
   │  ├─ SignupPage.tsx       # /signup     SCR-02
   │  ├─ TodoListPage.tsx     # /todos      SCR-03
   │  ├─ TodoFormPage.tsx     # /todos/new, /todos/:id/edit   SCR-04
   │  ├─ CalendarPage.tsx     # /calendar?view&date           SCR-05
   │  ├─ CategoriesPage.tsx   # /categories SCR-06
   │  └─ MePage.tsx           # /me         SCR-07
   ├─ features/
   │  ├─ auth/            # authStore.ts(user), useAuth.ts(me·로그인·가입·로그아웃), messages.ts(비밀번호 확인 불일치 문구, P-24), LoginForm, SignupForm, ProfileForm, PasswordForm
   │  ├─ todos/           # filterStore.ts, useTodos.ts, TodoFilters, TodoRow, TodoForm
   │  ├─ calendar/        # calendarStore.ts(선택 날짜), range.ts, cellTodos.ts, useCalendar.ts, CalendarToolbar,
   │  │                   # MonthGrid, WeekGrid, WeekRow(이어진 막대, P-16), MobileCounts, DayList (월·4주·주·일 뷰 모두 구현)
   │  └─ categories/      # useCategories.ts, CategoryList, CategoryAddForm
   ├─ api/
   │  ├─ client.ts        # fetch 래퍼(JSON, 오류 → ApiError{status, code, message, fields}, 401 시 갱신 후 재요청)
   │  ├─ types.ts         # API 타입, 오류 코드 유니온, 상태 값
   │  ├─ queryKeys.ts     # 쿼리 키 + 무효화 헬퍼 (PR-L-11)
   │  └─ auth.ts, categories.ts, todos.ts, calendar.ts   # 엔드포인트 함수
   ├─ components/         # ConfirmDialog, FieldError, FormError, LoadingNotice, EmptyNotice, TodoTitle, LanguageSelect, ThemeSelect
   ├─ i18n/               # 다국어(P-31): ko·ja·en 사전, 언어 스토어(localStorage), useT(), 서버 문구 번역. 화면 문구는 여기서만 가져온다
   ├─ lib/
   │  ├─ date.ts          # todayLocal(), addDays 등 문자열 날짜 연산 (PR-C-05)
   │  ├─ useToday.ts      # 포커스·가시성 복귀 시 today 재계산 (P-12)
   │  ├─ theme.ts, themeStore.ts  # 화면 모드(P-29): 판정 순수 함수 / 스토어(localStorage)·<html data-theme> 적용. index.html이 첫 화면 전에 같은 규칙으로 먼저 적용
   │  ├─ emoji.ts         # 할일 제목·설명 단어로 이모지 하나 선택 (P-27)
   │  ├─ log.ts           # 개발 모드 전용 콘솔 로그 (PR-S-13)
   │  └─ date.test.ts, ... # 단위 테스트는 대상 파일 옆에 둔다
   └─ styles/
      └─ global.css       # 리셋, 360px 기준 기본, 변수
```

| 위치 | 역할 | 구현하는 ID |
|---|---|---|
| `main.tsx` | QueryClient 설정, 401 전역 처리(Zustand·캐시 초기화 후 `/login`) | FR-04, PR-L-12 |
| `app/router.tsx`, `RequireAuth.tsx`, `RouteError.tsx` | 경로 7개, `/`·미정의 경로 리다이렉트, 로그인 상태에서 `/login`·`/signup` 접근 시 `/todos`, 렌더링 오류는 최상위 `errorElement`가 오류 화면(새로고침 버튼)으로 | P-23, BR-01, FR-03 |
| `app/AppLayout.tsx` | 내비게이션(사용자 이름·이동·로그아웃), 화면 상단 오류·'갱신 중…' 위치, 오류 영역은 내비게이션 바로 아래 | PRD 공통, FR-03, FR-14, P-22, L-17 |
| `features/auth` | 앱 시작 시 `GET /api/me`로 로그인 확인 후 사용자 정보를 Zustand에 보관(토큰 없음). 가입·로그인 성공 시 `/todos` 이동. 로그아웃 시 Zustand·쿼리 캐시 초기화. 비밀번호 확인 일치 검사 | FR-01~03, FR-14, FR-15, P-04, P-24 |
| `features/todos` | `filterStore`(카테고리·상태 필터, 새로고침·로그아웃 시 초기화), 목록 조회·`today` query key, 완료 토글(재조회 후 표시, 해당 행만 비활성), 삭제 확인, 등록·편집 폼 | FR-05~09, P-12, P-15, P-22, P-23, P-21 |
| `features/calendar` | `range.ts`(월=1일~말일, 4주(`'4weeks'`)=그 주 일요일부터 28일(FR-17, P-30), 주=일~토, 일=하루 기간 계산)와 `cellTodos.ts`(날짜가 기간에 속하는 할일, 서버 정렬 유지, `weekBars`로 여러 날 할일을 주 단위 이어진 막대로 배치(P-16), 3줄을 넘친 할일은 날짜별 '+N')는 순수 함수. 데스크톱 월·4주·주 뷰의 한 주는 `WeekRow.tsx`가 그린다. `calendarStore`(선택 날짜), 뷰·기준 날짜는 URL 쿼리, 모바일은 개수 점·그날 목록, 오늘 없는 기간이면 선택 해제 | FR-10~12, FR-16, FR-17, BR-16~20, P-16, P-20, P-23, P-30, R-07 |
| `features/categories` | 목록(BR-23 순서, 서버 순서 그대로), 추가, 이름 수정, 삭제 확인(소속 할일 안내), 기본 카테고리 조작 비활성 | FR-13, P-19, BR-12 |
| `pages/TodoFormPage.tsx` | 진입 화면 복귀: 진입 시 `navigate(path, { state: { from } })`로 현재 경로(쿼리 포함)를 넘기고, 저장·취소 후 `state.from`으로, 없으면 `/todos`로 이동 | P-17, P-23 |
| `api/client.ts` | `VITE_API_BASE_URL` + `/api/...`, `credentials: 'include'`(PR-S-04), 오류 형식 파싱, 401 시 토큰 갱신 1회 후 재요청(PR-L-12). 토큰 접근 코드 없음(쿠키는 httpOnly) | P-04, NFR-15, PR-L-12 |
| `components/` | 삭제·카테고리 삭제 공용 확인 대화상자, 입력란 오류, 폼·화면 상단 오류, '불러오는 중…'/'갱신 중…'(이전 데이터 유지는 `placeholderData: keepPreviousData`), '할일이 없습니다.' | P-19, P-21, P-22, PRD 4장 |
| `lib/` | 날짜 문자열 연산, 오늘 계산·재계산, 화면 모드(P-29), 제목 이모지(P-27), 개발 모드 로그(PR-S-13) | NFR-11, NFR-12, P-12, P-27, P-29 |
| `styles/`, `*.module.css` | 360px 기준, 768px 중단점 | NFR-13, P-08 |

프론트 의존성: `react`, `react-dom`, `react-router`, `@tanstack/react-query`, `zustand`. 개발용: `vite`, `@vitejs/plugin-react`, `typescript`, `vitest`, `@types/react`, `@types/react-dom`.

### 7.4 M-01 셋업 순서

```
# 1) DB: PostgreSQL 17에 todolist, todolist_test 두 데이터베이스를 만든다.
# 2) 백엔드
cd backend && npm init -y            # "type": "module", engines 추가
npm i express pg jsonwebtoken bcrypt
cp .env.example .env                 # .env.test는 DATABASE_URL만 todolist_test
npm run db:init
# 3) 프론트
npm create vite@latest frontend -- --template react-ts
cd frontend && npm i react-router @tanstack/react-query zustand
npm i -D vitest                      # .env.development에 VITE_API_BASE_URL
# 4) 루트: biome.json, .gitignore, README.md
```

M-01 완료 기준 순서: schema.sql → config·db·errors·error 미들웨어 → auth 미들웨어·`routes/auth.js`·`services/auth.js`(FR-01~04) → 가입·로그인·소유권 테스트의 뼈대(`test/helpers`).

## 8. 이 문서에서 정한 결정

PRD·도메인의 기능·규칙 수준 결정은 하지 않았다. 아래는 구조 설계에 필요해 최소한으로 정한 값이며, 이해관계자가 다르게 정하면 변경 이력을 남기고 수정한다.

| ID | 결정 | 근거 | 대안 |
|---|---|---|---|
| PD-01 | 저장소는 `frontend/`·`backend/` 평면 폴더이고 루트 `package.json`·워크스페이스는 두지 않는다. | 패키지 간 공유 코드가 없다. PR-C-02(모노레포 도구 금지). | npm workspaces: 공유 의존성이 없어 이득 없음 |
| PD-02 | 백엔드는 Node.js LTS(22 이상)·ESM이고 `node --watch`·`--env-file`·`node:test`를 쓴다. | 추가 도구(nodemon, dotenv, Jest) 없이 해결, 최신 Express·pg는 ESM과 잘 맞는다. | CommonJS: 이점 없음 |
| PD-03 | Express 5를 쓴다. | async 핸들러 오류가 자동 전달되어 래퍼가 필요 없다. | Express 4 + `asyncHandler` 래퍼 |
| PD-04 | 프론트 빌드는 Vite, 라우터는 `react-router`(`createBrowserRouter`)다. | P-23의 경로·쿼리·가드·리다이렉트·`location.state`를 직접 구현할 수 없다. Vite는 PRD P-04가 전제한다. | TanStack Router: 학습 비용. 직접 구현: 규모 큼 |
| PD-05 | 스타일은 CSS Modules(Vite 내장)이다. | 의존성 0, 반응형 규칙은 중단점 하나(P-08). | Tailwind·UI 라이브러리: 설정·학습 비용 |
| PD-06 | 입력 검증은 직접 작성한다(`domain/validate.js`). 프론트도 폼 라이브러리 없이 제어 컴포넌트로 쓴다. | 검증 대상이 이메일 형식·문자열 길이·필수·날짜·열거 값 정도라 약 60줄이다. 서버가 `fields`를 내려준다(NFR-15). | zod·joi, react-hook-form: 의존성 추가 |
| PD-07 | 환경변수는 Node `--env-file`로 불러오고 `config.js`에서만 읽는다. | dotenv 불필요(PD-02). | dotenv |
| PD-08 | 스키마는 `docs/schema.sql` 하나와 `scripts/db-init.js`(pg로 실행, `--reset` 지원)로 적용한다. 마이그레이션 도구는 쓰지 않는다. | `psql` 설치 여부와 무관, 운영 데이터가 없고(P-10) 2일 일정이다. | node-pg-migrate: 이력 관리가 필요한 시점에 도입 |
| PD-09 | 백엔드 테스트는 `node:test` + 내장 `fetch`(supertest 없음), 프론트는 Vitest(순수 함수만)다. API 테스트는 `todolist_test` DB를 쓴다. | 의존성 최소. Vitest는 Vite 설정을 공유한다. | Jest, supertest, React Testing Library: 2일 안에 이득이 작음 |
| PD-10 | 날짜 라이브러리를 쓰지 않는다. 백엔드는 pg DATE 파서로 문자열을 받아 문자열 비교(ISO 형식은 사전순 = 날짜순)하고, 프론트는 `lib/date.ts`에서 로컬 `new Date(y, m, d)`로 계산해 문자열로 돌려준다. | 필요한 연산이 오늘·±일·월·주 범위뿐이다. NFR-11. | dayjs·date-fns: 의존성 추가 |
| PD-11 | 포맷·린트는 Biome 하나(루트 `biome.json`)다. | 의존성 1개로 JS·TS를 처리한다. | ESLint + Prettier: 패키지·설정이 늘어남 |
| PD-12 | 커버리지 수치 게이트를 두지 않는다. 필수 대상은 PR-T-02·03이다. | 대상은 규칙(G-04)·소유권(R-04)이 정한다. 수치는 가치를 보장하지 않는다. | 80% 게이트: 2일 일정에서 비규칙 코드 테스트 부담 |
| PD-13 | API 경로·메서드는 7.2의 표로 정한다. `:id`는 정수(`INTEGER GENERATED ALWAYS AS IDENTITY`)이고, 정수가 아닌 `:id`는 존재하지 않는 것으로 보아 404 `NOT_FOUND`다. 단건 조회(`GET /api/todos/:id`)는 `today`를 받지 않고 상태를 포함하지 않는다. 쿼리 파라미터(`categoryId`·`status`·`today`·`from`·`to`)의 형식 오류(정수 아님, 날짜 아님, 허용 값 아님)는 400 `VALIDATION_ERROR`이고, 형식이 맞는 `categoryId`가 본인 카테고리가 아니거나 없으면 404 `NOT_FOUND`(P-14)다. | PRD P-25가 이 표에 위임한다. 문자열 `:id` 400은 NFR-15에 없는 코드 조합을 만든다. | UUID: 길이·가독성 부담 |
| PD-14 | 메트릭·구조화 로깅 라이브러리는 두지 않고, 헬스 체크는 `GET /api/health`는 `SELECT 1`로 DB 연결까지 확인해 정상이면 200 `{ ok: true, db: 'up' }`, DB 실패면 503 `{ ok: false, db: 'down' }`이다(v0.8). | 서버 기동만으로는 DB 연결 여부를 알 수 없다. `SELECT 1` 한 번이라 비용이 작다(P-10, P-25). | pino, 풀 상태·지연 시간 등 상세 지표: 운영 배포 시 도입 |
| PD-15 | `jsonwebtoken`과 `bcrypt`(네이티브)를 쓰고, 쿠키 읽기는 `req.headers.cookie`를 직접 파싱한다(`cookie-parser` 없음). | JWT·bcrypt는 직접 구현이 불가·위험하다. 쿠키 파싱은 약 5줄이다. refresh 토큰 생성·해시는 내장 `node:crypto`로 한다. 네이티브 bcrypt는 로그인 CPU 부하(NFR-05)에 유리하다. Windows에서 미리 빌드된 바이너리가 맞지 않아 설치가 실패하면 API가 같은 `bcryptjs`로 바꾸고 이 행을 갱신한다. | bcryptjs: 설치는 쉬우나 느림. cookie-parser |
| PD-16 | SQL은 별도 repository 파일 없이 `services/`에 둔다. | 3.3 근거. | `repositories/` 계층: 파일 2배, mock 유혹 |
| PD-17 | 상태 판정과 상태 필터는 `domain/status.js` 한 곳(JS)에 둔다. SQL은 사용자·카테고리·기간으로만 거른다. | 판정 로직 이중화 방지(NFR-12), DB 없이 단위 테스트 가능. P-11(사용자당 약 100건)에서 행 수가 작다. | SQL `CASE`: 판정 2곳. 사용자당 건수가 크게 늘면 재검토 |
| PD-18 | SCR-04의 진입 화면 복귀는 `navigate`의 `state.from`(경로 + 쿼리)으로 구현하고 없으면 `/todos`다. | P-17·P-23의 '진입 화면이 없을 때'를 만족하며, 캘린더 URL(뷰·날짜)도 복원된다. | `navigate(-1)`: 직접 접근 시 앱 밖으로 나갈 수 있음 |
| PD-19 | 상태 값 문자열은 ST-01~04 순으로 `completed`·`not_started`·`in_progress`·`overdue`다. 응답의 `status` 필드와 목록 `status` 쿼리 파라미터가 같은 값을 쓰고, 화면 표시 문구(완료·시작 전·진행 중·지연)는 프론트 `api/types.ts`의 표 하나가 바꾼다. 다른 값은 400 `VALIDATION_ERROR`(P-14). | 한글 값은 URL 인코딩·오타 위험. 값과 표시 문구를 분리한다. | 한글 값 그대로: URL에 인코딩 필요 |
| PD-20 | 할일 수정(`PATCH /api/todos/:id`) 본문은 편집 폼의 값 전체를 보낸다: `title`·`startDate`·`endDate` 필수, `description`·`categoryId`·`startTime`·`endTime` 선택. `startTime`·`endTime`은 날짜와 함께 기간을 이루므로 생략하면 시간 없음(`null`)으로 저장한다(BR-24). `categoryId`가 없으면 기존 카테고리를 유지한다(BR-11). `description`을 생략해도 기존 값을 유지하며, 비우려면 `null` 또는 빈 문자열을 보낸다. `null` 처리는 PD-27을 따른다. BR-07은 본문의 두 날짜만으로 `domain/validate.js`가 판정한다. | 편집 폼은 항상 전체 값을 가진다. 기존 값과 합치는 코드 없이 순수 함수로 BR-07을 판정한다. | 부분 수정: 기존 행 조회 후 병합 판정이 필요 |
| PD-21 | 완료 토글 본문은 `{ "completed": boolean }`이다. `true`면 `completed_at = now()`, `false`면 `completed_at = NULL`이다. 같은 값을 다시 보내도 오류가 아니다(멱등, `true` 재전송 시 `completed_at`은 유지). 응답은 상태를 포함하지 않는 할일이며 화면은 재조회 결과로 표시한다(P-15). | 연타·재시도에도 결과가 같다. `completedAt`은 표시하지 않는 기록용이다. | 서버 반전(toggle): 재시도 시 결과가 뒤집힘 |
| PD-22 | 오류 판정 순서는 인증(401) → 입력 형식·값(400 `VALIDATION_ERROR`) → 존재·소유권(404 `NOT_FOUND`) → 규칙(400 `DEFAULT_CATEGORY_IMMUTABLE`·`INVALID_PASSWORD`) → 중복(409)이다. 여러 입력 오류는 `fields`에 함께 담는다. | 타인 데이터는 규칙 위반보다 먼저 404가 되어 존재가 드러나지 않는다(BR-03). DB 없이 판정할 수 있는 것을 먼저 거른다. | - |
| PD-23 | 데스크톱 월 뷰 격자의 앞뒤 채움 칸(이전·다음 달 날짜)은 날짜 숫자와 할일을 표시하지 않는 빈 칸이며 선택할 수 없다. 모바일 월 뷰도 같다. | BR-17의 화면 기간(1일~말일) 밖이라 표시하면 '일부만 보이는' 오해가 생긴다. 칸 배치(`cellTodos.ts`)에서 분기 없이 처리된다. | 이전·다음 달 할일 함께 조회: 조회 기간이 BR-17과 달라짐 |
| PD-24 | 앱 첫 진입의 로그인 확인 `GET /api/me`는 query `meta`로 전역 401 처리(PR-L-12)에서 빼고, 401이면 '로그인 안 됨'으로 보관한다. 이후 `RequireAuth`가 보호 경로는 `/login`으로, 공개 경로(`/login`·`/signup`)는 그대로 보여 준다. 그 밖의 401은 PR-L-12대로 처리한다. | 미로그인 상태가 정상인 첫 진입에서 오류 처리·이동이 반복되지 않는다. | - |
| PD-25 | 성공 상태 코드: 생성(가입, 할일·카테고리 등록)은 201과 생성된 객체, 삭제(할일·카테고리), 로그아웃, 토큰 갱신, 비밀번호 변경은 204 본문 없음(비밀번호 변경은 새 토큰 쌍 쿠키 발급), 그 외(조회·수정·완료 토글·로그인)는 200이다. 200 본문: 로그인은 사용자(가입과 같은 형태), 이름 수정은 수정된 사용자, 카테고리 이름 수정은 수정된 카테고리, 할일 수정·완료 토글은 할일이다. | REST 관례, 프론트는 상태 코드가 아닌 성공 여부로만 분기한다. | 전부 200: 의미 손실 |
| PD-26 | refresh 토큰은 불투명 난수 + DB 해시 저장이며 JWT로 만들지 않는다. 같은 refresh 토큰으로 동시에 갱신하면(여러 탭) 먼저 도착한 요청만 성공하고 나머지 탭은 401로 로그인 화면에 간다. 같은 탭 안의 동시 401은 `api/client.ts`가 갱신 요청 하나로 묶는다. | 회전·폐기에 DB 조회가 필요해 refresh 토큰을 JWT로 만들어도 stateless 이점이 없고, 불투명 값은 서명 검증 코드가 필요 없다. 탭 간 경쟁 처리(유예 시간)는 2일 일정 대비 과설계. | refresh JWT(stateless): 로그아웃·비밀번호 변경 시 무효화 불가. 재사용 탐지(사용한 토큰을 보관하다 재사용 시 사용자 전체 폐기): 탈취 대응이 필요해지면 도입 |
| PD-27 | 요청 본문의 `null`은 ERD에서 NULL 허용인 컬럼에 대응하는 필드에만 허용한다. 요청으로 받는 필드 중 해당하는 것은 할일 `description`·`startTime`·`endTime`이다(`completed_at`은 서버가 정한다). 등록에서 `null`은 생략과 같고, 수정(`PATCH`)에서 `null`을 보내면 값을 비운다. NOT NULL 컬럼에 대응하는 필드(`email`·`password`·`name`·`title`·`startDate`·`endDate`·`categoryId`·`completed` 등)에 `null`을 보내면 400 `VALIDATION_ERROR`다. `categoryId`의 BR-11(등록은 기본, 수정은 유지)은 생략일 때만 적용된다. | `null`의 의미를 컬럼 NULL 허용 여부 하나로 정한다(7-erd.md 4장, DB-11). | `null`을 생략과 같게 처리: 수정에서 값을 비울 수단이 빈 문자열뿐이 됨 |
| PD-28 | API의 시각 필드(`createdAt`·`updatedAt`·`completedAt`)는 ISO 8601 UTC, `Date.prototype.toISOString()` 형식(`2026-11-04T09:00:00.000Z`)이다. 날짜 필드는 PR-C-05대로 `YYYY-MM-DD`다. | pg가 `TIMESTAMPTZ`를 `Date`로 돌려주고 `JSON.stringify`가 이 형식으로 직렬화해 변환 코드가 없다. | 오프셋 포함 현지 시각: 직렬화 코드 필요 |
| PD-29 | 응답 필드: 할일 응답(단건 조회·등록·수정·완료 토글·목록·캘린더)은 모두 `categoryName`(JOIN)을 포함한다. `todos.category_id`가 NOT NULL·FK라 `categoryName`은 `null`이 되지 않는다. 상태(`status`)는 `today`를 받는 목록·캘린더에만 있다(PD-13). 사용자 응답(가입·로그인·내 정보 조회·이름 수정)은 항상 `id`·`email`·`name`·`createdAt`·`updatedAt`을 포함한다. | 프론트가 응답마다 다른 모양을 다루지 않게 할일·사용자 형태를 하나로 통일한다. | 응답별 필드 차등: 타입이 여러 개로 늘어남 |
| PD-30 | Swagger UI는 `NODE_ENV=development`일 때만 `app.js`가 `GET /api/docs`(HTML 한 장)와 `GET /api/docs/swagger.yaml`(`backend/swagger.yaml` 원본)로 제공한다. UI는 CDN의 버전 고정 `swagger-ui-dist`를 불러오고 npm 의존성은 추가하지 않는다. 명세의 `servers`는 상대 경로(`/`)라 3000번에서 연 Swagger UI가 같은 출처로 호출한다. | 명세(`swagger.yaml`)는 이미 단일 출처로 있고 화면만 필요하다. 개발 도구라 운영·테스트 환경에서는 노출하지 않는다. PR-C-02(몇 줄로 되면 의존성 추가 금지). | swagger-ui-express + yaml 파서: 의존성 2개. 오프라인 개발이 필요해지면 `swagger-ui-dist`를 devDependency로 받아 정적 제공 |

### 8.1 커버리지 확인

| 대상 | 전체 | 어디에 구현되는가 |
|---|---|---|
| NFR-01~15 | 15 | NFR-01 폐기, 05 `scripts/seed-load.js`, 02 PR-S-03/`middleware/auth.js`, 03 PR-S-09/`db.js`, 04 `schema.sql`, 06 `services/auth.js`, 07 PR-L-05, 08 PR-L-04, 09 `domain/validate.js`, 10 PR-L-06, 11 PR-C-05, 12 `domain/status.js`/PR-L-11, 13·14 PR-N-10/Vite 기본 빌드, 15 `errors.js`/`middleware/error.js` |
| P-04·P-12·P-14~P-23 | 해당 항목 | 7.2·7.3 표의 '구현하는 ID' 열 |
| 금지 목록(PR-C-02) | DI, 리포지토리 계층, ORM, 캐시, 큐, 마이크로서비스, 모노레포 도구, 상태 라이브러리 추가 | 3.3, PD-01, PD-16 |
