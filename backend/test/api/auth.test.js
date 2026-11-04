import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { describe, test } from 'node:test';
import jwt from 'jsonwebtoken';
import { config } from '../../src/config.js';
import { client, query, signupUser, useServer } from '../helpers/index.js';

const ctx = useServer();
const sha256 = (v) => createHash('sha256').update(v).digest('hex');
const countUsers = async () => (await query('SELECT count(*)::int AS n FROM users')).rows[0].n;
const cookieHeader = (res, name) => res.setCookies.find((c) => c.startsWith(`${name}=`));
const body = (n, over) => ({
  email: `s${n}@test.local`,
  password: 'password123',
  name: '홍길동',
  ...over,
});

describe('회원가입 (T-BE-08)', () => {
  test('FR-01 가입 201, 두 쿠키(httpOnly·SameSite=Lax·Path·만료), 본문에 해시·토큰 없음', async () => {
    const c = client(ctx);
    const res = await c.post('/api/auth/signup', body(1));
    assert.equal(res.status, 201);
    const access = cookieHeader(res, 'access_token');
    const refresh = cookieHeader(res, 'refresh_token');
    assert.match(access, /Max-Age=900;.*Path=\/;.*HttpOnly.*SameSite=Lax/);
    assert.match(refresh, /Max-Age=604800;.*Path=\/api\/auth;.*HttpOnly.*SameSite=Lax/);
    assert.deepEqual(Object.keys(res.body).sort(), [
      'createdAt',
      'email',
      'id',
      'name',
      'updatedAt',
    ]);
    const text = JSON.stringify(res.body);
    assert.ok(!text.includes(c.jar.get('access_token').value) && !text.includes('$2b$'));
  });

  test('BR-10 가입 직후 기본 카테고리 정확히 1개', async () => {
    const c = await signupUser(ctx, 10);
    const { rows } = await query('SELECT name FROM categories WHERE user_id = $1 AND is_default', [
      c.user.id,
    ]);
    assert.deepEqual(rows, [{ name: '기본' }]);
  });

  test('SC-01 가입 쿠키로 바로 보호 API(GET /api/me) 200', async () => {
    const c = await signupUser(ctx, 11);
    const res = await c.get('/api/me');
    assert.equal(res.status, 200);
    assert.equal(res.body.email, 'u11@test.local');
  });

  test('E-01-1 중복 이메일(대소문자만 다른 경우 포함)은 409, 사용자 수 불변', async () => {
    await client(ctx).post('/api/auth/signup', body(2));
    const before = await countUsers();
    for (const email of ['s2@test.local', 'S2@Test.Local']) {
      const res = await client(ctx).post('/api/auth/signup', body(2, { email }));
      assert.equal(res.status, 409);
      assert.equal(res.body.error.code, 'DUPLICATE_EMAIL');
    }
    assert.equal(await countUsers(), before);
  });

  test('E-01-2 E-01-3 입력 위반은 400 VALIDATION_ERROR, 사용자 생성 안 됨', async () => {
    const before = await countUsers();
    const cases = [
      { password: 'a'.repeat(7) },
      { password: 'a'.repeat(65) },
      { email: 'bad-email' },
      { email: `${'a'.repeat(249)}@x.com` },
      { name: 'a'.repeat(51) },
      { name: '   ' },
    ];
    for (const over of cases) {
      const res = await client(ctx).post('/api/auth/signup', body(3, over));
      assert.equal(res.status, 400, JSON.stringify(over));
      assert.equal(res.body.error.code, 'VALIDATION_ERROR');
    }
    assert.equal(await countUsers(), before);
  });

  test('NFR-10 기본 카테고리 INSERT가 실패하면 사용자도 남지 않고, 로그에 평문 비밀번호 없음', async (t) => {
    const logs = [];
    t.mock.method(console, 'error', (...a) => logs.push(a.join(' ')));
    await query(`CREATE FUNCTION fail_cat() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN RAISE EXCEPTION 'forced'; END $$`);
    await query(
      'CREATE TRIGGER fail_cat BEFORE INSERT ON categories FOR EACH ROW EXECUTE FUNCTION fail_cat()',
    );
    try {
      const before = await countUsers();
      const res = await client(ctx).post(
        '/api/auth/signup',
        body(4, { password: 'plain-secret-pw' }),
      );
      assert.equal(res.status, 500);
      assert.equal(await countUsers(), before);
      assert.ok(logs.length > 0 && !logs.join('').includes('plain-secret-pw'));
    } finally {
      await query('DROP TRIGGER fail_cat ON categories');
      await query('DROP FUNCTION fail_cat()');
    }
  });

  test('NFR-06 password_hash는 $2b$10$, DB-13 token_hash는 64자 16진수이고 쿠키 원문과 다름', async () => {
    const c = await signupUser(ctx, 12);
    const u = await query('SELECT password_hash FROM users WHERE id = $1', [c.user.id]);
    assert.ok(u.rows[0].password_hash.startsWith('$2b$10$'));
    const r = await query('SELECT token_hash FROM refresh_tokens WHERE user_id = $1', [c.user.id]);
    const raw = c.jar.get('refresh_token').value;
    assert.match(r.rows[0].token_hash, /^[0-9a-f]{64}$/);
    assert.notEqual(r.rows[0].token_hash, raw);
    assert.equal(r.rows[0].token_hash, sha256(raw));
  });
});

describe('로그인·로그아웃 (T-BE-08)', () => {
  test('FR-02 로그인 200, 가입과 같은 사용자 형태, 두 쿠키 발급', async () => {
    const u = await signupUser(ctx, 20);
    const c = client(ctx);
    const res = await c.post('/api/auth/login', {
      email: 'U20@test.local',
      password: 'password123',
    });
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, u.user);
    assert.ok(c.jar.has('access_token') && c.jar.has('refresh_token'));
  });

  test('E-02-1 틀린 비밀번호와 없는 이메일은 같은 401 INVALID_CREDENTIALS', async () => {
    await signupUser(ctx, 21);
    const wrong = await client(ctx).post('/api/auth/login', {
      email: 'u21@test.local',
      password: 'nope-nope',
    });
    const none = await client(ctx).post('/api/auth/login', {
      email: 'none@test.local',
      password: 'nope-nope',
    });
    assert.equal(wrong.status, 401);
    assert.deepEqual(wrong.body, none.body);
    assert.equal(wrong.body.error.code, 'INVALID_CREDENTIALS');
  });

  test('FR-02 로그인 필수값 누락은 400 VALIDATION_ERROR', async () => {
    const res = await client(ctx).post('/api/auth/login', { email: 'u@test.local' });
    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  });

  test('FR-03 로그아웃 204 후 refresh 행 삭제, 이전 refresh 토큰으로 갱신하면 401', async () => {
    const c = await signupUser(ctx, 22);
    const raw = c.jar.get('refresh_token').value;
    const res = await c.post('/api/auth/logout');
    assert.equal(res.status, 204);
    assert.ok(cookieHeader(res, 'access_token').includes('Expires=Thu, 01 Jan 1970'));
    const rows = await query('SELECT 1 FROM refresh_tokens WHERE token_hash = $1', [sha256(raw)]);
    assert.equal(rows.rowCount, 0);
    const old = client(ctx);
    old.jar.set('refresh_token', { value: raw, path: '/api/auth' });
    assert.equal((await old.post('/api/auth/refresh')).status, 401);
  });

  test('FR-03 쿠키 없이 로그아웃해도 204', async () => {
    assert.equal((await client(ctx).post('/api/auth/logout')).status, 204);
  });
});

describe('인증 미들웨어 (T-BE-07)', () => {
  const tokenFor = (payload, secret, opts) => jwt.sign(payload, secret, opts);
  const withAccess = (token) => {
    const c = client(ctx);
    c.jar.set('access_token', { value: token, path: '/' });
    return c;
  };

  test('E-02-2 쿠키 없이 보호 라우트는 401 UNAUTHORIZED', async () => {
    const res = await client(ctx).get('/api/me');
    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, 'UNAUTHORIZED');
  });

  test('E-C1 서명이 다른 토큰·만료 토큰은 401', async () => {
    const forged = tokenFor({ sub: '1' }, 'x'.repeat(48), { algorithm: 'HS384' });
    const expired = tokenFor(
      { sub: '1', exp: Math.floor(Date.now() / 1000) - 10 },
      config.jwtSecret,
      {
        algorithm: 'HS384',
      },
    );
    for (const t of [forged, expired])
      assert.equal((await withAccess(t).get('/api/me')).status, 401);
  });

  test('PR-S-03 같은 키의 HS256 토큰과 alg:none 토큰은 401', async () => {
    const hs256 = tokenFor({ sub: '1' }, config.jwtSecret, { algorithm: 'HS256' });
    const none = `${Buffer.from('{"alg":"none","typ":"JWT"}').toString('base64url')}.${Buffer.from(
      '{"sub":"1"}',
    ).toString('base64url')}.`;
    for (const t of [hs256, none]) assert.equal((await withAccess(t).get('/api/me')).status, 401);
  });

  test('P-04 access 토큰은 HS384, exp - iat = 900, 페이로드는 sub(+iat·exp)만', async () => {
    const c = await signupUser(ctx, 30);
    const decoded = jwt.decode(c.jar.get('access_token').value, { complete: true });
    assert.equal(decoded.header.alg, 'HS384');
    assert.equal(decoded.payload.exp - decoded.payload.iat, 900);
    assert.deepEqual(Object.keys(decoded.payload).sort(), ['exp', 'iat', 'sub']);
  });
});

describe('내 정보 (T-BE-09)', () => {
  test('FR-14 로그인 쿠키로 200 { id, email, name, ... }, 비밀번호 해시 없음', async () => {
    const c = await signupUser(ctx, 40);
    const res = await c.get('/api/me');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, c.user);
    assert.ok(!('passwordHash' in res.body) && !('password_hash' in res.body));
  });
});

describe('토큰 갱신 (T-BE-16)', () => {
  test('P-04 유효한 refresh 쿠키로 204, 새 두 쿠키, access 쿠키 없이도 갱신, 새 access로 보호 API 200', async () => {
    const c = await signupUser(ctx, 50);
    const oldAccess = c.jar.get('access_token').value;
    c.jar.delete('access_token');
    const res = await c.post('/api/auth/refresh');
    assert.equal(res.status, 204);
    assert.ok(cookieHeader(res, 'access_token') && cookieHeader(res, 'refresh_token'));
    assert.ok(c.jar.get('access_token').value);
    assert.equal(typeof oldAccess, 'string');
    assert.equal((await c.get('/api/me')).status, 200);
  });

  test('P-04 회전: 갱신 후 이전 refresh 토큰 재사용은 401 UNAUTHORIZED', async () => {
    const c = await signupUser(ctx, 51);
    const old = c.jar.get('refresh_token').value;
    assert.equal((await c.post('/api/auth/refresh')).status, 204);
    const replay = client(ctx);
    replay.jar.set('refresh_token', { value: old, path: '/api/auth' });
    const res = await replay.post('/api/auth/refresh');
    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, 'UNAUTHORIZED');
  });

  test('DB-13 같은 refresh 토큰으로 동시에 2번 호출하면 하나만 204', async () => {
    const c = await signupUser(ctx, 52);
    const raw = c.jar.get('refresh_token').value;
    const make = () => {
      const x = client(ctx);
      x.jar.set('refresh_token', { value: raw, path: '/api/auth' });
      return x.post('/api/auth/refresh');
    };
    const statuses = (await Promise.all([make(), make()])).map((r) => r.status).sort();
    assert.deepEqual(statuses, [204, 401]);
  });

  test('P-04 만료·DB에 없음·쿠키 없음은 401이고 두 쿠키를 삭제한다', async () => {
    const c = await signupUser(ctx, 53);
    await query(
      "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, now() - interval '1 second')",
      [c.user.id, sha256('expired-token')],
    );
    for (const value of ['expired-token', 'unknown-token', undefined]) {
      const x = client(ctx);
      if (value) x.jar.set('refresh_token', { value, path: '/api/auth' });
      const res = await x.post('/api/auth/refresh');
      assert.equal(res.status, 401);
      for (const name of ['access_token', 'refresh_token']) {
        assert.ok(cookieHeader(res, name).includes('Expires=Thu, 01 Jan 1970'), `${name} 삭제`);
      }
    }
  });

  test('PR-S-03 refresh_token 쿠키는 Path=/api/auth라 /api/todos 요청에 실리지 않는다', async () => {
    const res = await client(ctx).post('/api/auth/signup', body(54));
    const refresh = cookieHeader(res, 'refresh_token');
    assert.match(refresh, /Path=\/api\/auth;/);
    assert.ok(!'/api/todos'.startsWith('/api/auth'));
  });

  test('DB-13 갱신을 여러 번 해도 그 사용자의 refresh 행 수가 늘지 않는다', async () => {
    const c = await signupUser(ctx, 55);
    const count = async () =>
      (await query('SELECT count(*)::int AS n FROM refresh_tokens WHERE user_id = $1', [c.user.id]))
        .rows[0].n;
    const before = await count();
    for (let i = 0; i < 3; i++) assert.equal((await c.post('/api/auth/refresh')).status, 204);
    assert.equal(await count(), before);
  });
});
