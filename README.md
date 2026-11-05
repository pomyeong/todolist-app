# TodoList

개인 할일(기간·카테고리)과 월/주/일 캘린더를 제공하는 웹 앱. 설계 문서는 [docs/](docs/)에 있다.

## 디렉토리

- `backend/` — Node.js + Express 5 API 서버
- `frontend/` — React 19 + TypeScript + Vite
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

- 767px은 모바일(내비 두 줄 86px, 목록 행 3줄 카드, 월 뷰 개수 점), 768px은 데스크톱(내비 한 줄 64px, 목록 행 1줄, 월 뷰 칸 제목)이다.
- 360px에서 대화상자 패널이 좌우 16px 안쪽에 들어온다.
- Safari는 접근할 수 있는 환경이 없어 점검하지 않았다. Firefox는 설치본이 아닌 Playwright 배포 빌드다.

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

- 대체 확인: 서버 500(E-06-2)은 브라우저에서 응답을 모의했고, 토큰 만료는 쿠키 삭제로 재현했다. 화면에서 만들 수 없는 잘못된 필터·기간(E-08, E-09)은 API로 확인했다.
- 발견·수정: 카테고리 이름 수정의 409 문구가 '닫기'·Esc 후에도 남던 문제를 고쳤다(`CategoryList.tsx`, T-FE-10 범위).
