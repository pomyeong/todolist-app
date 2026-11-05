import { query } from '../db.js';
import { withStatus } from '../domain/status.js';
import { notFound } from '../errors.js';

// 응답 컬럼(PR-N-05)과 카테고리명 JOIN(PR-L-08, 양쪽 user_id, PR-L-05). source는 todos 또는 CTE 이름.
const selectFrom = (source) => `
  SELECT t.id, t.category_id AS "categoryId", c.name AS "categoryName", t.title, t.description,
         t.start_date AS "startDate", t.end_date AS "endDate",
         to_char(t.start_time, 'HH24:MI') AS "startTime", to_char(t.end_time, 'HH24:MI') AS "endTime", t.completed, t.completed_at AS "completedAt",
         t.created_at AS "createdAt", t.updated_at AS "updatedAt"
  FROM ${source} t JOIN categories c ON c.id = t.category_id AND c.user_id = t.user_id`;
// BR-20: 목록·캘린더가 공유하는 정렬. 마지막 키 id로 순서를 고정한다.
const ORDER_BY = 'ORDER BY t.end_date, t.created_at, t.id';

const one = ({ rows }) => {
  if (rows.length === 0) throw notFound();
  return rows[0];
};

export async function getOne(userId, id) {
  return one(
    await query(`${selectFrom('todos')} WHERE t.id = $1 AND t.user_id = $2`, [id, userId]),
  );
}

// categoryId가 없으면 기본 카테고리(BR-11), 있으면 본인 것만(BR-04). 0행이면 404.
export async function create(
  userId,
  { title, description, startDate, endDate, startTime, endTime, categoryId },
) {
  return one(
    await query(
      `WITH ins AS (
         INSERT INTO todos (user_id, category_id, title, description, start_date, end_date, start_time, end_time)
         SELECT $1, id, $3, $4, $5, $6, $7, $8 FROM categories
         WHERE user_id = $1 AND (CASE WHEN $2::int IS NULL THEN is_default ELSE id = $2 END)
         RETURNING *)
       ${selectFrom('ins')}`,
      [
        userId,
        categoryId ?? null,
        title,
        description ?? null,
        startDate,
        endDate,
        startTime,
        endTime,
      ],
    ),
  );
}

// PD-20: 생략한 categoryId·description은 기존 값 유지, 시간은 날짜와 함께 덮어쓴다(생략 = null). 지정한 카테고리가 본인 것이 아니면 0행 → 404.
export async function update(
  userId,
  id,
  { title, description, startDate, endDate, startTime, endTime, categoryId },
) {
  return one(
    await query(
      `WITH upd AS (
         UPDATE todos t SET title = $3,
           description = CASE WHEN $4::bool THEN $5 ELSE t.description END,
           start_date = $6, end_date = $7, start_time = $9, end_time = $10,
           category_id = COALESCE($8, t.category_id), updated_at = now()
         WHERE t.id = $1 AND t.user_id = $2
           AND ($8::int IS NULL OR EXISTS (SELECT 1 FROM categories WHERE id = $8 AND user_id = $2))
         RETURNING t.*)
       ${selectFrom('upd')}`,
      [
        id,
        userId,
        title,
        description !== undefined,
        description ?? null,
        startDate,
        endDate,
        categoryId ?? null,
        startTime,
        endTime,
      ],
    ),
  );
}

export async function remove(userId, id) {
  const { rowCount } = await query('DELETE FROM todos WHERE id = $1 AND user_id = $2', [
    id,
    userId,
  ]); // BR-09
  if (rowCount === 0) throw notFound();
}

// PD-21·DB-08: 완료 시각은 처음 완료할 때만 정하고, 취소하면 NULL.
export async function setCompleted(userId, id, { completed }) {
  return one(
    await query(
      `WITH upd AS (
         UPDATE todos SET completed = $3,
           completed_at = CASE WHEN $3 THEN COALESCE(completed_at, now()) ELSE NULL END, updated_at = now()
         WHERE id = $1 AND user_id = $2 RETURNING *)
       ${selectFrom('upd')}`,
      [id, userId, completed],
    ),
  );
}

// 카테고리 필터는 SQL(고정 조각 + 바인딩, PR-L-04), 상태 필터는 판정 후 JS(PD-17).
export async function list(userId, { categoryId, status, today }) {
  if (categoryId !== undefined) {
    const owned = await query('SELECT 1 FROM categories WHERE id = $1 AND user_id = $2', [
      categoryId,
      userId,
    ]);
    if (owned.rowCount === 0) throw notFound(); // P-14
  }
  const { rows } = await query(
    `${selectFrom('todos')} WHERE t.user_id = $1 AND ($2::int IS NULL OR t.category_id = $2) ${ORDER_BY}`,
    [userId, categoryId ?? null],
  );
  return withStatus(rows, today, status);
}

// BR-17·18: 기간과 하루라도 겹치는 할일. 완료 포함(BR-19).
export async function calendar(userId, { from, to, today }) {
  const { rows } = await query(
    `${selectFrom('todos')} WHERE t.user_id = $1 AND t.start_date <= $3 AND t.end_date >= $2 ${ORDER_BY}`,
    [userId, from, to],
  );
  return withStatus(rows, today);
}
