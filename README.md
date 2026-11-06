# TodoList

개인 할일(기간·시간·카테고리)과 월/4주/주/일 캘린더를 제공하는 웹 앱. 한국어·日本語·English, 시스템/주간/다크 화면 모드를 지원한다. 설계 문서는 [docs/](docs/)에 있다.

- 운영: https://todolist-pmsong.vercel.app (프론트) · https://todolist-pmsong-be.vercel.app/api/health (백엔드 헬스 체크)

## 디렉토리

- `backend/` — Node.js + Express 5 API 서버
- `frontend/` — React 19 + TypeScript + Vite
- `docs/` — 설계 문서
- `test/e2e/` — 시나리오 E2E 리포트([report.md](test/e2e/report.md))와 운영 스모크 검사([smoke-prod/report.md](test/e2e/smoke-prod/report.md)), 스크린샷
- `guide/` — 개발 과정 튜토리얼([tutorial.md](guide/tutorial.md))과 비슷한 앱을 만들 때 AI에 한 번에 읽히는 플레이북([ai-playbook.md](guide/ai-playbook.md))

## 실행 순서

반드시 DB → 백엔드 → 프론트 순서로 실행한다(docs/5-project-principle.md 7.4).

1. **DB**: PostgreSQL 17에 `todolist`, `todolist_test` 데이터베이스를 만든다.
2. **백엔드**

   ```
   cd backend
   npm install
   cp .env.example .env   # 값 채우기
   npm run db:init        # 스키마 적용
   npm run dev
   ```

   - 헬스 체크: http://localhost:3000/api/health → 정상 `{"ok":true,"db":"up"}`, DB 실패 503 `{"ok":false,"db":"down"}`
   - API 문서(Swagger UI): http://localhost:3000/api/docs — `NODE_ENV=development`일 때만 열린다(PD-30). 명세 원본은 `backend/swagger.yaml`, UI 스크립트는 CDN에서 받는다.
3. **프론트**

   ```
   cd frontend
   npm install
   npm run dev            # .env.development의 VITE_API_BASE_URL(http://localhost:3000)로 API 직접 호출(CORS)
   ```

## 테스트

```
cd backend && npm test     # 단위 + API 통합 + 소유권(실제 앱 + todolist_test DB, .env.test 필요) — 124건
cd frontend && npm test    # 순수 함수 단위 테스트(Vitest) — 165건
```

화면은 코드 E2E 대신 Playwright MCP로 시나리오를 실행해 [test/e2e/report.md](test/e2e/report.md)에 기록한다(PR-T-05).

## 운영 배포 (Vercel + Supabase)

같은 저장소에 Vercel 프로젝트 두 개를 연결해 `main` 푸시마다 자동 배포한다. DB는 Supabase PostgreSQL(싱가포르 `ap-southeast-1`)이고 `docs/schema.sql`로 만든다.

| 프로젝트 | Root Directory | 프레임워크 | 설정 파일 | 환경변수 |
| --- | --- | --- | --- | --- |
| `todolist-pmsong-be` | `backend` | Express(진입점 `src/app.js` default export) | `backend/vercel.json`: 함수 리전 `sin1`(DB와 같은 지역) | `DATABASE_URL`(pooler), `JWT_SECRET`(48자 이상), `NODE_ENV=production`, `CORS_ORIGIN=https://todolist-pmsong.vercel.app`, `DB_POOL_MAX`, 토큰 만료 |
| `todolist-pmsong` | `frontend` | Vite | `frontend/vercel.json`: `/api/*` → 백엔드 rewrite, 나머지 → `index.html`(SPA) | `VITE_API_BASE_URL=https://todolist-pmsong.vercel.app`(자기 주소) |

- 브라우저는 프론트 주소의 `/api/...`만 호출하고 Vercel이 백엔드로 넘긴다. `*.vercel.app`은 공개 접미사라 백엔드를 직접 부르면 다른 사이트가 되어 `SameSite=Lax` 인증 쿠키가 실리지 않는다.
- 운영 env 사본은 `.env prod`처럼 두고 커밋하지 않는다(`.gitignore`의 `.env *`).
- 배포 확인: 백엔드 헬스 200 → `https://todolist-pmsong.vercel.app/api/health` 200 → 로그인 후 새로고침해도 유지 → 스모크 검사. 배포 직후 화면이 그대로면 강력 새로고침(Ctrl+Shift+R).

## 기존 DB 업그레이드

스키마 단일 출처는 `docs/schema.sql`이고 마이그레이션 도구는 쓰지 않는다(PR-S-10). 데이터를 버려도 되면 `npm run db:init -- --reset`으로 다시 만든다. 기존 데이터를 지키려면 해당 변경의 SQL을 개발 DB(`todolist`)에 직접 실행한다.

### 할일 시작·종료 시간 (2026-11-05, BR-24, DB-14)

`todos.start_time`·`end_time` 컬럼과 `ck_todos_times` 제약을 추가한다. 두 컬럼은 NULL 허용이라 기존 할일은 '시간 없음'으로 남는다. 여러 번 실행해도 결과가 같다.

```sql
BEGIN;
ALTER TABLE todos
  ADD COLUMN IF NOT EXISTS start_time TIME(0),
  ADD COLUMN IF NOT EXISTS end_time   TIME(0);
ALTER TABLE todos
  DROP CONSTRAINT IF EXISTS ck_todos_times,
  ADD CONSTRAINT ck_todos_times CHECK (
    start_date < end_date OR start_time IS NULL OR end_time IS NULL OR start_time <= end_time
  );
COMMIT;
```

- 실행: `psql "$DATABASE_URL" -f <위 SQL 파일>` 또는 pgAdmin 쿼리 창.
- 확인: `SELECT column_name FROM information_schema.columns WHERE table_name = 'todos' AND column_name LIKE '%_time';` → `start_time`, `end_time`
- 테스트 DB(`todolist_test`)는 테스트가 데이터를 매번 비우므로 `node --env-file=.env.test scripts/db-init.js --reset`으로 다시 만든다.

## 포맷·린트

루트 `biome.json`을 공유한다. 커밋 전 `npx @biomejs/biome check`를 통과시킨다(루트에서 `npx biome`을 치면 무관한 패키지를 받으므로 패키지 이름을 쓰거나 `backend`·`frontend` 안에서 `npx biome check`). 프론트는 `npx tsc -b`도 통과시킨다.

## 검증 기록

- T-DB-04(2026-11-04): `todolist_test`에서 제약 위반 8건이 모두 기대한 오류로 실패함 — 23505 `uq_users_email`·`uq_categories_user_name`·`uq_categories_user_default`·`uq_refresh_tokens_hash`, 23514 `ck_users_email_lower`·`ck_todos_dates`·`ck_todos_completed`, 23503 `fk_todos_category`.

### 시드 데이터 (T-DB-05)

```
cd backend
npm run seed:load      # 개발 DB(todolist)에 입력. 다시 실행하면 기존 시드 계정을 지우고 새로 넣는다.
```

- 사용자 1000명, 사용자당 할일 100건(총 100,000건). 각 사용자는 기본 카테고리 1개를 가진다(BR-10).
- 할일 기간: 실행일 기준 ±60일 시작, 0~20일 길이(월·주 경계에 걸치는 할일 포함). 약 30%는 완료.
- 비밀번호 해시는 bcrypt로 한 번만 만들어 재사용한다(NFR-05). 실행 시간 약 3초.

#### 시드 계정

| 항목     | 값                                  |
| -------- | ----------------------------------- |
| 이메일   | `load{n}@test.local` (n = 1 ~ 1000) |
| 비밀번호 | `loadtest1234` (공통)               |

### 실행 계획 검증 (T-DB-06)

시드 데이터(사용자 1000명 × 할일 100건) 위에서 `load500@test.local` 사용자로 `EXPLAIN (ANALYZE, BUFFERS)`를 실행했다(2026-11-04, PostgreSQL 17.11, 로컬 단일 머신, `ANALYZE` 후). SQL은 `services/todos.js`·`services/categories.js`와 같은 WHERE·JOIN·ORDER BY다.

| 쿼리                                                                                                            | `todos` 접근                                         | 그 밖의 접근                             | 실행 시간 |
| --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------- | --------- |
| 목록(필터 없음) `WHERE t.user_id = $1 AND ($2 IS NULL OR t.category_id = $2) ORDER BY end_date, created_at, id` | Index Scan `idx_todos_user_category` (100행)         | categories: `uq_categories_user_name`    | 0.117 ms  |
| 목록(카테고리 필터)                                                                                             | Index Scan `idx_todos_user_category` (100행)         | categories: `uq_categories_user_name`    | 0.165 ms  |
| 캘린더(월 11-01~11-30) `start_date <= $3 AND end_date >= $2`                                                    | Index Scan `idx_todos_user_category` (100행 중 33행) | categories: `uq_categories_user_name`    | 0.051 ms  |
| 카테고리 삭제 시 할일 이동 `UPDATE todos … WHERE category_id = $1 AND user_id = $2`                             | Index Scan `idx_todos_user_category` (100행)         | categories: `uq_categories_user_default` | 1.533 ms  |

- 네 쿼리 모두 `todos` 순차 스캔(Seq Scan)이 없어 인덱스를 추가하지 않았다(DB-10). 정렬은 사용자당 100행을 메모리 quicksort(32kB 이하)로 처리한다.
- 캘린더는 플래너가 `idx_todos_user_dates` 대신 `idx_todos_user_category`를 골랐다. 사용자당 100행이라 `user_id` 범위만 좁히면 충분하다는 판단이며, 데이터 분포가 바뀌면 다시 측정한다.

### 반응형·브라우저 점검 (T-QA-02, 2026-11-05)

Playwright(playwright-core)로 로컬 브라우저를 구동해 가입 → 로그아웃 → 로그인 → 카테고리 추가·이름 수정·삭제 → 할일 등록·필터·완료 토글·편집·삭제(대화상자) → 캘린더 월(날짜 선택·다음 달)·주·일 → 내 정보까지 한 흐름으로 수행했다. 화면마다 `document.documentElement.scrollWidth <= 폭`을 확인했다.

| 브라우저 | 폭 | 결과 |
| --- | --- | --- |
| Chrome 156.0.8078.80 | 360, 767, 768, 1280 | 전체 통과 |
| Edge 156.0.4314.58 | 360, 1280 | 전체 통과 |
| Firefox 157.0 (Playwright 빌드) | 1280 | 전체 통과 |
| WebKit 27.2 (Playwright 빌드, Safari 엔진) | 360, 1280 | 전체 통과 |

- 767px은 모바일(내비 두 줄 86px, 목록 행 3줄 카드, 월 뷰 개수 점), 768px은 데스크톱(내비 한 줄 64px, 목록 행 1줄, 월 뷰 칸 제목)이다.
- 360px에서 대화상자 패널이 좌우 16px 안쪽에 들어온다.
- Safari 앱은 Windows에 없어 같은 엔진인 Playwright WebKit 빌드로 대신 점검했다. 실제 macOS·iOS Safari는 점검하지 않았다. Firefox도 설치본이 아닌 Playwright 배포 빌드다.

### 시나리오 셀프 체크 (T-QA-03, 2026-11-05)

`npm run db:init -- --reset`으로 비운 개발 DB에서 Chrome(1000px, 일부 360px)으로 수행했다. 상태 판정이 '오늘=2026-11-04'를 전제하는 시나리오는 브라우저 시계를 2026-11-04로 맞췄다.

| 대상 | 결과 |
| --- | --- |
| SC-13 대표 종단(가입 → 등록 → 조회 → 완료 → 로그아웃) | 통과 |
| SC-01~09 정상·예외(E-01-1~E-09-2, E-C1, E-C2) | 전체 통과 |
| SC-10~12(주·일 뷰, 내 정보, 캘린더에서 편집 이동) | 전체 통과 |
| Must FR(FR-01~10, FR-13) 수용 기준 | 100% 충족 |
| Should·Could FR(FR-11, FR-12, FR-14, FR-15, FR-16) | 구현, 수용 기준 전체 통과(제외 없음) |
| 백엔드 `npm test`(단위 + API 통합 + 소유권) | 98건 통과 |

- 실측 확인(모의 아님):
  - 백엔드 프로세스를 실제로 중단하고 완료 토글 → 프록시 502, 체크 원상태, 화면 상단 '서버에 연결할 수 없습니다.'(E-06-2)
  - 백엔드 비밀키로 만든 만료 access 토큰 → `401 → POST /api/auth/refresh 204 → 재요청 200`, 화면 유지(FR-04)
  - DB에서 refresh 토큰 `expires_at`을 과거로 바꾼 뒤 조회 → refresh 401 → `/login`(FR-04)
- 화면에서 만들 수 없는 잘못된 필터·기간(E-08, E-09)은 API로 확인했다.
- 캘린더 URL의 없는 날짜(`date=2026-13-45`, `2026-02-30`)는 오늘 기준으로 표시하도록 고쳤다(`lib/date.ts` `isValidDate`).
- 발견·수정: 카테고리 이름 수정의 409 문구가 '닫기'·Esc 후에도 남던 문제를 고쳤다(`CategoryList.tsx`, T-FE-10 범위).

### 시나리오 E2E (2026-11-06)

Playwright MCP(Chromium)로 로컬 개발 서버에서 SC-01~15를 수행했다. 데스크톱 1280×900, 모바일 360×780. **98건 중 98건 통과**. 수행 중 찾은 모바일 4주 뷰 'M/D' 표기 누락(P-30)은 `dayLabel()`로 고친 뒤 재확인했다. 상세와 스크린샷 36장: [test/e2e/report.md](test/e2e/report.md).

### 운영 스모크 검사 (2026-11-06)

https://todolist-pmsong.vercel.app 에서 SC-13 종단 흐름을 축으로 SC-01~15 핵심 단계를 수행했다. 상세: [test/e2e/smoke-prod/report.md](test/e2e/smoke-prod/report.md).

| 차수 | 결과 | 후속 조치 |
| --- | --- | --- |
| 1차 | 15/15 통과, 관찰 2건 | 카테고리 연속 추가 시 입력 유실 → 보낸 값이 그대로일 때만 입력란 비움. 응답 지연 → 백엔드 함수 리전 `iad1` → `sin1` |
| 2차 | 20/20 통과, 5xx 0건 | 관찰 2건 해소 확인. `/api/todos` 0.14~0.16s |
