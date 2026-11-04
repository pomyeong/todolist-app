# TodoList

개인 할일(기간·카테고리)과 월/주/일 캘린더를 제공하는 웹 앱. 설계 문서는 [docs/](docs/)에 있다.

## 디렉토리

- `backend/` — Node.js + Express 5 API 서버
- `frontend/` — React 19 + TypeScript + Vite
- `load-test/` — k6 부하 테스트
- `docs/` — 설계 문서

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
3. **프론트**

   ```
   cd frontend
   npm install
   npm run dev            # /api 는 Vite 프록시로 백엔드에 전달
   ```

## 포맷·린트

루트 `biome.json`을 공유한다. 커밋 전 `npx @biomejs/biome check`를 통과시킨다.

## 검증 기록

- T-DB-04(2026-11-04): `todolist_test`에서 제약 위반 8건이 모두 기대한 오류로 실패함 — 23505 `uq_users_email`·`uq_categories_user_name`·`uq_categories_user_default`·`uq_refresh_tokens_hash`, 23514 `ck_users_email_lower`·`ck_todos_dates`·`ck_todos_completed`, 23503 `fk_todos_category`.
- T-DB-06(2026-11-04): 실행 계획 결과는 [load-test/README.md](load-test/README.md).
