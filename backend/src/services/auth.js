import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { query, withTransaction } from '../db.js';
import { AppError, ERROR, unauthorized } from '../errors.js';

// PR-S-02: PRD가 확정한 값은 상수로 둔다. 토큰 만료는 환경변수(config)에서 온다.
const BCRYPT_COST = 10;
const JWT_ALGORITHM = 'HS384';
const ACCESS_TTL_SEC = config.accessTtlSec;
const REFRESH_TTL_SEC = config.refreshTtlSec;
export const ACCESS_COOKIE = 'access_token';
export const REFRESH_COOKIE = 'refresh_token';

const cookieBase = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: config.nodeEnv === 'production',
});
export const accessCookieOptions = () => ({ ...cookieBase(), path: '/' });
export const refreshCookieOptions = () => ({ ...cookieBase(), path: '/api/auth' });
export const ACCESS_MAX_AGE_MS = ACCESS_TTL_SEC * 1000;
export const REFRESH_MAX_AGE_MS = REFRESH_TTL_SEC * 1000;

const USER_COLUMNS = 'id, email, name, created_at AS "createdAt", updated_at AS "updatedAt"';
const DEFAULT_CATEGORY_NAME = '기본'; // BR-10

export const hashPassword = (password) => bcrypt.hash(password, BCRYPT_COST);
const sha256 = (value) => createHash('sha256').update(value).digest('hex');

// access 토큰: 페이로드는 sub만(PR-S-03).
function signAccessToken(userId) {
  return jwt.sign({ sub: String(userId) }, config.jwtSecret, {
    algorithm: JWT_ALGORITHM,
    expiresIn: ACCESS_TTL_SEC,
  });
}

// 유효하면 사용자 ID, 아니면 null. HS384 외 알고리즘(none, HS256 등)은 거부한다.
export function verifyAccessToken(token) {
  try {
    const payload = jwt.verify(token, config.jwtSecret, { algorithms: [JWT_ALGORITHM] });
    const id = Number(payload.sub);
    return Number.isInteger(id) ? id : null;
  } catch {
    return null;
  }
}

// 새 refresh 토큰을 저장하고 토큰 쌍을 돌려준다. db는 query 또는 트랜잭션 client.
export async function issueTokens(db, userId) {
  const refreshToken = randomBytes(32).toString('base64url');
  await db.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, now() + make_interval(secs => $3))`,
    [userId, sha256(refreshToken), REFRESH_TTL_SEC],
  );
  return { accessToken: signAccessToken(userId), refreshToken };
}

export async function signup({ email, password, name }) {
  const passwordHash = await hashPassword(password); // PR-L-06: 트랜잭션 밖에서 계산
  try {
    return await withTransaction(async (client) => {
      const { rows } = await client.query(
        `INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING ${USER_COLUMNS}`,
        [email, passwordHash, name],
      );
      const user = rows[0];
      await client.query(
        'INSERT INTO categories (user_id, name, is_default) VALUES ($1, $2, true)',
        [user.id, DEFAULT_CATEGORY_NAME],
      );
      return { user, ...(await issueTokens(client, user.id)) };
    });
  } catch (err) {
    if (err.code === '23505' && err.constraint === 'uq_users_email') {
      throw new AppError(409, ERROR.DUPLICATE_EMAIL, '이미 가입된 이메일입니다.');
    }
    throw err;
  }
}

export async function login({ email, password }) {
  const { rows } = await query(
    `SELECT ${USER_COLUMNS}, password_hash AS "passwordHash" FROM users WHERE email = $1`,
    [email],
  );
  const found = rows[0];
  // E-02-1: 이메일 없음과 비밀번호 틀림을 구분하지 않는다.
  if (!found || !(await bcrypt.compare(password, found.passwordHash))) {
    throw new AppError(401, ERROR.INVALID_CREDENTIALS, '이메일 또는 비밀번호가 올바르지 않습니다.');
  }
  const { passwordHash: _omit, ...user } = found;
  await query('DELETE FROM refresh_tokens WHERE user_id = $1 AND expires_at <= now()', [user.id]); // DB-13
  return { user, ...(await issueTokens({ query }, user.id)) };
}

// DB-13: 한 문장 DELETE로 사용 처리해 같은 토큰의 동시 사용은 하나만 성공한다.
export async function rotate(refreshToken) {
  if (!refreshToken) throw unauthorized();
  const { rows } = await query(
    'DELETE FROM refresh_tokens WHERE token_hash = $1 AND expires_at > now() RETURNING user_id',
    [sha256(refreshToken)],
  );
  if (rows.length === 0) throw unauthorized();
  return issueTokens({ query }, rows[0].user_id);
}

export async function logout(refreshToken) {
  if (refreshToken)
    await query('DELETE FROM refresh_tokens WHERE token_hash = $1', [sha256(refreshToken)]);
}
