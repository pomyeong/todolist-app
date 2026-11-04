# 부하 테스트

## 시드 데이터 (T-DB-05)

```
cd backend
npm run seed:load      # 개발 DB(todolist)에 입력. 다시 실행하면 기존 시드 계정을 지우고 새로 넣는다.
```

- 사용자 1000명, 사용자당 할일 100건(총 100,000건). 각 사용자는 기본 카테고리 1개를 가진다(BR-10).
- 할일 기간: 실행일 기준 ±60일 시작, 0~20일 길이(월·주 경계에 걸치는 할일 포함). 약 30%는 완료.
- 비밀번호 해시는 bcrypt로 한 번만 만들어 재사용한다(NFR-05). 실행 시간 약 3초.

### k6 계정 규칙

| 항목     | 값                                  |
| -------- | ----------------------------------- |
| 이메일   | `load{n}@test.local` (n = 1 ~ 1000) |
| 비밀번호 | `loadtest1234` (공통)               |

VU 번호 `n`으로 계정을 고르고, 로그인은 VU당 한 번만 한다(PR-T-08). 쿠키는 k6 쿠키 저장소가 유지한다.

## 실행 계획 검증 (T-DB-06)

시드 데이터(사용자 1000명 × 할일 100건) 위에서 `load500@test.local` 사용자로 `EXPLAIN (ANALYZE, BUFFERS)`를 실행했다(2026-11-04, PostgreSQL 17.11, 로컬 단일 머신, `ANALYZE` 후). SQL은 `services/todos.js`·`services/categories.js`와 같은 WHERE·JOIN·ORDER BY다.

| 쿼리                                                                                                            | `todos` 접근                                         | 그 밖의 접근                             | 실행 시간 |
| --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------- | --------- |
| 목록(필터 없음) `WHERE t.user_id = $1 AND ($2 IS NULL OR t.category_id = $2) ORDER BY end_date, created_at, id` | Index Scan `idx_todos_user_category` (100행)         | categories: `uq_categories_user_name`    | 0.117 ms  |
| 목록(카테고리 필터)                                                                                             | Index Scan `idx_todos_user_category` (100행)         | categories: `uq_categories_user_name`    | 0.165 ms  |
| 캘린더(월 11-01~11-30) `start_date <= $3 AND end_date >= $2`                                                    | Index Scan `idx_todos_user_category` (100행 중 33행) | categories: `uq_categories_user_name`    | 0.051 ms  |
| 카테고리 삭제 시 할일 이동 `UPDATE todos … WHERE category_id = $1 AND user_id = $2`                             | Index Scan `idx_todos_user_category` (100행)         | categories: `uq_categories_user_default` | 1.533 ms  |

- 네 쿼리 모두 `todos` 순차 스캔(Seq Scan)이 없어 인덱스를 추가하지 않았다(DB-10). 정렬은 사용자당 100행을 메모리 quicksort(32kB 이하)로 처리한다.
- 캘린더는 플래너가 `idx_todos_user_dates` 대신 `idx_todos_user_category`를 골랐다. 사용자당 100행이라 `user_id` 범위만 좁히면 충분하다는 판단이며, 데이터 분포가 바뀌면 다시 측정한다.
