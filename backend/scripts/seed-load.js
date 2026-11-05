// 실행 계획 확인용 시드(T-DB-06, NFR-04): 사용자 1000명(각자 기본 카테고리) × 할일 100건.
// 계정: load1@test.local ~ load1000@test.local / 비밀번호 LOAD_PASSWORD. 다시 실행하면 기존 시드 계정을 지우고 새로 넣는다.
import { close, query, withTransaction } from '../src/db.js';
import { hashPassword } from '../src/services/auth.js';

const USERS = 1000;
const TODOS_PER_USER = 100;
const LOAD_PASSWORD = 'loadtest1234';
const EMAIL_LIKE = 'load%@test.local';
const TODO_BATCH = 10000;

const started = Date.now();
const passwordHash = await hashPassword(LOAD_PASSWORD); // NFR-05: bcrypt는 한 번만

const day = 24 * 60 * 60 * 1000;
const iso = (ms) => new Date(ms).toISOString().slice(0, 10);
const todayMs = Date.parse(`${iso(Date.now())}T00:00:00Z`);

try {
  await withTransaction(async (db) => {
    const old = 'SELECT id FROM users WHERE email LIKE $1';
    await db.query(`DELETE FROM todos WHERE user_id IN (${old})`, [EMAIL_LIKE]);
    await db.query(`DELETE FROM refresh_tokens WHERE user_id IN (${old})`, [EMAIL_LIKE]);
    await db.query(`DELETE FROM categories WHERE user_id IN (${old})`, [EMAIL_LIKE]);
    await db.query('DELETE FROM users WHERE email LIKE $1', [EMAIL_LIKE]);

    const n = Array.from({ length: USERS }, (_, i) => i + 1);
    const users = await db.query(
      `INSERT INTO users (email, password_hash, name)
       SELECT * FROM unnest($1::text[], $2::text[], $3::text[]) RETURNING id`,
      [n.map((i) => `load${i}@test.local`), n.map(() => passwordHash), n.map((i) => `부하${i}`)],
    );
    const cats = await db.query(
      `INSERT INTO categories (user_id, name, is_default)
       SELECT unnest($1::int[]), '기본', true RETURNING id, user_id`,
      [users.rows.map((r) => r.id)],
    );

    // 오늘 기준 ±60일에 0~20일 기간: 월·주 경계에 걸치는 할일이 섞인다. 약 30%는 완료.
    const cols = { u: [], c: [], t: [], s: [], e: [], done: [] };
    for (const { id: categoryId, user_id: userId } of cats.rows) {
      for (let k = 0; k < TODOS_PER_USER; k++) {
        const start = todayMs + Math.floor(Math.random() * 121 - 60) * day;
        cols.u.push(userId);
        cols.c.push(categoryId);
        cols.t.push(`부하 할일 ${k + 1}`);
        cols.s.push(iso(start));
        cols.e.push(iso(start + Math.floor(Math.random() * 21) * day));
        cols.done.push(Math.random() < 0.3);
      }
    }
    for (let i = 0; i < cols.u.length; i += TODO_BATCH) {
      const part = (a) => a.slice(i, i + TODO_BATCH);
      await db.query(
        `INSERT INTO todos (user_id, category_id, title, start_date, end_date, completed, completed_at)
         SELECT u, c, t, s, e, d, CASE WHEN d THEN now() END
         FROM unnest($1::int[], $2::int[], $3::text[], $4::date[], $5::date[], $6::bool[]) AS x(u, c, t, s, e, d)`,
        [part(cols.u), part(cols.c), part(cols.t), part(cols.s), part(cols.e), part(cols.done)],
      );
    }
  });
  const { rows } = await query(
    `SELECT (SELECT count(*) FROM users WHERE email LIKE $1)::int AS users,
            (SELECT count(*) FROM todos t JOIN users u ON u.id = t.user_id WHERE u.email LIKE $1)::int AS todos`,
    [EMAIL_LIKE],
  );
  console.log(
    `시드 완료: 사용자 ${rows[0].users}, 할일 ${rows[0].todos}, ${((Date.now() - started) / 1000).toFixed(1)}초`,
  );
} catch (err) {
  console.error(`시드 실패: ${err.message}`);
  process.exitCode = 1;
} finally {
  await close();
}
