import bcrypt from 'bcrypt';
import { query } from '../db.js';
import { AppError, ERROR, notFound } from '../errors.js';
import { hashPassword, issueTokens } from './auth.js';

const USER_COLUMNS = 'id, email, name, created_at AS "createdAt", updated_at AS "updatedAt"';

export async function getMe(userId) {
  const { rows } = await query(`SELECT ${USER_COLUMNS} FROM users WHERE id = $1`, [userId]);
  if (rows.length === 0) throw notFound();
  return rows[0];
}

export async function updateName(userId, { name }) {
  const { rows } = await query(
    `UPDATE users SET name = $2, updated_at = now() WHERE id = $1 RETURNING ${USER_COLUMNS}`,
    [userId, name],
  );
  if (rows.length === 0) throw notFound();
  return rows[0];
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  const { rows } = await query('SELECT password_hash AS "passwordHash" FROM users WHERE id = $1', [
    userId,
  ]);
  if (rows.length === 0) throw notFound();
  if (!(await bcrypt.compare(currentPassword, rows[0].passwordHash))) {
    throw new AppError(400, ERROR.INVALID_PASSWORD, '현재 비밀번호가 올바르지 않습니다.');
  }
  const passwordHash = await hashPassword(newPassword); // PR-L-06: 트랜잭션 밖에서 계산
  // P-04: 한 문장으로 다른 세션 무효화와 비밀번호 교체를 원자적으로 처리한다.
  await query(
    `WITH revoked AS (DELETE FROM refresh_tokens WHERE user_id = $1)
     UPDATE users SET password_hash = $2, updated_at = now() WHERE id = $1`,
    [userId, passwordHash],
  );
  return issueTokens({ query }, userId);
}
