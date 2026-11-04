import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { describe, test } from 'node:test';
import { client, query, signupUser, useServer } from '../helpers/index.js';

const ctx = useServer();
const sha256 = (v) => createHash('sha256').update(v).digest('hex');
const cookieHeader = (res, name) => res.setCookies.find((c) => c.startsWith(`${name}=`));
const hashOf = async (id) =>
  (await query('SELECT password_hash FROM users WHERE id = $1', [id])).rows[0].password_hash;
const refreshHashes = async (id) =>
  (
    await query('SELECT token_hash FROM refresh_tokens WHERE user_id = $1 ORDER BY token_hash', [
      id,
    ])
  ).rows.map((r) => r.token_hash);
const login = (n, password) =>
  client(ctx).post('/api/auth/login', { email: `u${n}@test.local`, password });
const changePw = (c, over) =>
  c.put('/api/me/password', {
    currentPassword: 'password123',
    newPassword: 'newpassword456',
    ...over,
  });

describe('이름 수정 PATCH /api/me (T-BE-15)', () => {
  test('FR-14 이름 앞뒤 공백은 trim되어 200, 키 5개, email 그대로, 이후 GET /api/me에 반영, Set-Cookie 없음', async () => {
    const c = await signupUser(ctx, 100);
    const res = await c.patch('/api/me', { name: '  김철수  ' });
    assert.equal(res.status, 200);
    assert.equal(res.body.name, '김철수');
    assert.deepEqual(Object.keys(res.body).sort(), [
      'createdAt',
      'email',
      'id',
      'name',
      'updatedAt',
    ]);
    assert.equal(res.body.email, 'u100@test.local');
    assert.equal(res.setCookies.length, 0);
    assert.equal((await c.get('/api/me')).body.name, '김철수');
  });

  test('BR-05 본문의 email은 무시되어 응답·DB email 그대로, 새 이메일로 로그인 401', async () => {
    const c = await signupUser(ctx, 101);
    const res = await c.patch('/api/me', { name: '새이름', email: 'x@test.local' });
    assert.equal(res.status, 200);
    assert.equal(res.body.email, 'u101@test.local');
    const { rows } = await query('SELECT email FROM users WHERE id = $1', [c.user.id]);
    assert.equal(rows[0].email, 'u101@test.local');
    const attempt = await client(ctx).post('/api/auth/login', {
      email: 'x@test.local',
      password: 'password123',
    });
    assert.equal(attempt.status, 401);
  });

  test('E-11-1 51자·공백만·null·누락은 400 VALIDATION_ERROR(fields.name), 이름 불변', async () => {
    const c = await signupUser(ctx, 102);
    for (const payload of [{ name: 'a'.repeat(51) }, { name: '   ' }, { name: null }, {}]) {
      const res = await c.patch('/api/me', payload);
      assert.equal(res.status, 400, JSON.stringify(payload));
      assert.equal(res.body.error.code, 'VALIDATION_ERROR');
      assert.ok('name' in res.body.error.fields);
    }
    assert.equal((await c.get('/api/me')).body.name, '사용자102');
  });
});

describe('비밀번호 변경 PUT /api/me/password (T-BE-15)', () => {
  test('E-11-2 현재 비밀번호가 틀리면 400 INVALID_PASSWORD, 쿠키·해시·refresh 행 불변', async () => {
    const c = await signupUser(ctx, 110);
    const hash = await hashOf(c.user.id);
    const tokens = await refreshHashes(c.user.id);
    const res = await changePw(c, { currentPassword: 'wrong-password' });
    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'INVALID_PASSWORD');
    assert.ok(!res.body.error.fields);
    assert.equal(res.setCookies.length, 0);
    assert.equal((await c.get('/api/me')).status, 200);
    assert.equal(await hashOf(c.user.id), hash);
    assert.deepEqual(await refreshHashes(c.user.id), tokens);
    assert.equal((await login(110, 'password123')).status, 200);
    assert.equal((await login(110, 'newpassword456')).status, 401);
  });

  test('E-11-3 새 비밀번호 7자·65자는 400 VALIDATION_ERROR(fields.newPassword), 해시 불변', async () => {
    const c = await signupUser(ctx, 111);
    const hash = await hashOf(c.user.id);
    for (const newPassword of ['a'.repeat(7), 'a'.repeat(65)]) {
      const res = await changePw(c, { newPassword });
      assert.equal(res.status, 400);
      assert.equal(res.body.error.code, 'VALIDATION_ERROR');
      assert.ok('newPassword' in res.body.error.fields);
    }
    assert.equal(await hashOf(c.user.id), hash);
    assert.equal((await login(111, 'password123')).status, 200);
  });

  test('PD-22 입력 위반이 현재 비밀번호 불일치보다 먼저 판정된다, currentPassword 누락은 fields.currentPassword', async () => {
    const c = await signupUser(ctx, 112);
    const both = await changePw(c, {
      currentPassword: 'wrong-password',
      newPassword: 'a'.repeat(7),
    });
    assert.equal(both.status, 400);
    assert.equal(both.body.error.code, 'VALIDATION_ERROR');
    const missing = await c.put('/api/me/password', { newPassword: 'newpassword456' });
    assert.equal(missing.status, 400);
    assert.equal(missing.body.error.code, 'VALIDATION_ERROR');
    assert.ok('currentPassword' in missing.body.error.fields);
  });

  test('FR-15 성공 204 본문 없음, 두 쿠키 재발급, 해시 교체($2b$10$), 새 비밀번호만 로그인 가능', async () => {
    const c = await signupUser(ctx, 113);
    const before = await hashOf(c.user.id);
    const res = await changePw(c);
    assert.equal(res.status, 204);
    assert.equal(res.body, undefined);
    assert.match(
      cookieHeader(res, 'access_token'),
      /Max-Age=900;.*Path=\/;.*HttpOnly.*SameSite=Lax/,
    );
    assert.match(
      cookieHeader(res, 'refresh_token'),
      /Max-Age=604800;.*Path=\/api\/auth;.*HttpOnly.*SameSite=Lax/,
    );
    const after = await hashOf(c.user.id);
    assert.ok(after.startsWith('$2b$10$'));
    assert.notEqual(after, before);
    assert.equal((await login(113, 'newpassword456')).status, 200);
    const old = await login(113, 'password123');
    assert.equal(old.status, 401);
    assert.equal(old.body.error.code, 'INVALID_CREDENTIALS');
  });

  test('P-04 비밀번호 변경 시 다른 세션의 refresh 토큰은 무효화되고 refresh 행은 새 것 1개만 남는다', async () => {
    const a = await signupUser(ctx, 114);
    const b = client(ctx);
    assert.equal(
      (await b.post('/api/auth/login', { email: 'u114@test.local', password: 'password123' }))
        .status,
      200,
    );
    const oldA = a.jar.get('refresh_token').value;
    assert.equal((await changePw(a)).status, 204);

    const bRes = await b.post('/api/auth/refresh');
    assert.equal(bRes.status, 401);
    assert.equal(bRes.body.error.code, 'UNAUTHORIZED');
    const replay = client(ctx);
    replay.jar.set('refresh_token', { value: oldA, path: '/api/auth' });
    assert.equal((await replay.post('/api/auth/refresh')).status, 401);

    const newA = a.jar.get('refresh_token').value;
    const hashes = await refreshHashes(a.user.id);
    assert.deepEqual(hashes, [sha256(newA)]);
    assert.notEqual(hashes[0], sha256(oldA));

    assert.equal((await a.get('/api/me')).status, 200);
    assert.equal((await a.post('/api/auth/refresh')).status, 204);
    assert.equal((await a.get('/api/me')).status, 200);
  });
});

describe('인증 필요 (T-BE-15)', () => {
  test('E-02-2 쿠키 없이 PATCH /api/me, PUT /api/me/password는 401 UNAUTHORIZED', async () => {
    const patch = await client(ctx).patch('/api/me', { name: '이름' });
    const put = await changePw(client(ctx));
    for (const res of [patch, put]) {
      assert.equal(res.status, 401);
      assert.equal(res.body.error.code, 'UNAUTHORIZED');
    }
  });
});
