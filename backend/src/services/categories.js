import { query, withTransaction } from '../db.js';
import { AppError, ERROR, notFound } from '../errors.js';

const COLUMNS =
  'id, name, is_default AS "isDefault", created_at AS "createdAt", updated_at AS "updatedAt"';

const duplicate = (err) => {
  if (err.code === '23505' && err.constraint === 'uq_categories_user_name') {
    return new AppError(409, ERROR.DUPLICATE_CATEGORY, '이미 있는 카테고리 이름입니다.');
  }
  return err;
};
const immutable = () =>
  new AppError(
    400,
    ERROR.DEFAULT_CATEGORY_IMMUTABLE,
    '기본 카테고리는 수정하거나 삭제할 수 없습니다.',
  );

export async function list(userId) {
  // BR-23: 기본 먼저, 나머지는 생성 순
  const { rows } = await query(
    `SELECT ${COLUMNS} FROM categories WHERE user_id = $1 ORDER BY is_default DESC, created_at, id`,
    [userId],
  );
  return rows;
}

export async function create(userId, { name }) {
  try {
    const { rows } = await query(
      `INSERT INTO categories (user_id, name) VALUES ($1, $2) RETURNING ${COLUMNS}`,
      [userId, name],
    );
    return rows[0];
  } catch (err) {
    throw duplicate(err);
  }
}

// PD-22: 존재·소유권(404) → 기본 카테고리(400) 순으로 판정한다.
async function findOwned(userId, id) {
  const { rows } = await query('SELECT is_default FROM categories WHERE id = $1 AND user_id = $2', [
    id,
    userId,
  ]);
  if (rows.length === 0) throw notFound();
  if (rows[0].is_default) throw immutable();
}

export async function rename(userId, id, { name }) {
  await findOwned(userId, id);
  try {
    const { rows } = await query(
      `UPDATE categories SET name = $3, updated_at = now() WHERE id = $1 AND user_id = $2 RETURNING ${COLUMNS}`,
      [id, userId, name],
    );
    return rows[0];
  } catch (err) {
    throw duplicate(err);
  }
}

// BR-14: 소속 할일을 기본 카테고리로 옮긴 뒤 삭제(한 트랜잭션, NFR-10).
export async function remove(userId, id) {
  await findOwned(userId, id);
  await withTransaction(async (db) => {
    await db.query(
      `UPDATE todos SET category_id = (SELECT id FROM categories WHERE user_id = $2 AND is_default), updated_at = now()
       WHERE category_id = $1 AND user_id = $2`,
      [id, userId],
    );
    await db.query('DELETE FROM categories WHERE id = $1 AND user_id = $2', [id, userId]);
  });
}
