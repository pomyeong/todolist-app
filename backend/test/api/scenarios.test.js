// 사용자 시나리오(docs/3-user-scenario.md) 정상 흐름을 3.0 예시 데이터로 단계별 검증한다.
// 예외 흐름(E-xx)은 영역별 테스트 파일에 있고, 여기에는 빠져 있던 E-05-1만 둔다.
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { client, useServer } from '../helpers/index.js';

const ctx = useServer();
const TODAY = '2026-11-04';
let seq = 0;

async function signup(email = `auto${++seq}@example.com`) {
  const c = client(ctx);
  const res = await c.post('/api/auth/signup', { email, password: 'password123', name: '학생' });
  assert.equal(res.status, 201);
  return c;
}

// 3.0 예시 데이터: 카테고리 '기본'·'업무'·'학습', 할일 T1~T4(T4 완료).
async function seed() {
  const c = await signup();
  const cats = Object.fromEntries((await c.get('/api/categories')).body.map((x) => [x.name, x.id]));
  for (const name of ['업무', '학습'])
    cats[name] = (await c.post('/api/categories', { name })).body.id;
  const add = async (title, cat, startDate, endDate) =>
    (await c.post('/api/todos', { title, categoryId: cats[cat], startDate, endDate })).body;
  const t = {
    T1: await add('보고서 작성', '업무', '2026-10-28', '2026-11-03'),
    T2: await add('시험 공부', '학습', '2026-11-02', '2026-11-10'),
    T3: await add('여행 준비', '기본', '2026-11-20', '2026-12-02'),
    T4: await add('장보기', '기본', TODAY, TODAY),
  };
  await c.patch(`/api/todos/${t.T4.id}/completed`, { completed: true });
  return { c, cats, t };
}

// 다른 사용자 U2와 카테고리 C9·할일 T9.
async function seedU2() {
  const u2 = await signup();
  const c9 = (await u2.post('/api/categories', { name: 'C9' })).body;
  const t9 = (
    await u2.post('/api/todos', {
      title: 'T9',
      categoryId: c9.id,
      startDate: TODAY,
      endDate: TODAY,
    })
  ).body;
  return { c9, t9 };
}

const list = async (c, qs = '') => (await c.get(`/api/todos?today=${TODAY}${qs}`)).body;
const titles = (rows) => rows.map((r) => r.title);
const cal = async (c, from, to, today = TODAY) => {
  const res = await c.get(`/api/calendar?from=${from}&to=${to}&today=${today}`);
  assert.equal(res.status, 200);
  return res.body;
};

describe('SC-01 회원가입', () => {
  test('가입 → 기본 카테고리 1개, 자동 로그인, 목록 0건, 이메일·이름 앞뒤 공백 제거', async () => {
    const c = client(ctx);
    const res = await c.post('/api/auth/signup', {
      email: '  u1@example.com ',
      password: 'password123',
      name: ' 학생 ',
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.email, 'u1@example.com');
    assert.equal(res.body.name, '학생');
    assert.deepEqual(titles(await list(c)), []);
    assert.deepEqual(
      (await c.get('/api/categories')).body.map((x) => x.name),
      ['기본'],
    );
  });
});

describe('SC-02 로그인 / 로그아웃 / 인증 보호', () => {
  test('로그인 → 내 데이터만 보임(BR-03) → 로그아웃 → 보호 API 401, refresh도 401', async () => {
    const { t9, c9 } = await seedU2();
    await signup('sc02@example.com');
    const c = client(ctx);
    assert.equal(
      (await c.post('/api/auth/login', { email: 'sc02@example.com', password: 'password123' }))
        .status,
      200,
    );
    assert.equal((await c.get('/api/me')).body.name, '학생');
    assert.ok(!(await list(c)).some((r) => r.id === t9.id));
    assert.ok(!(await cal(c, '2026-11-01', '2026-11-30')).some((r) => r.id === t9.id));
    assert.ok(!(await c.get('/api/categories')).body.some((x) => x.id === c9.id));
    assert.equal((await c.post('/api/auth/logout')).status, 204);
    assert.equal((await c.get(`/api/todos?today=${TODAY}`)).status, 401);
    assert.equal((await c.post('/api/auth/refresh')).status, 401);
  });
});

describe('SC-03 카테고리 등록·이름 수정·삭제', () => {
  test('정렬 → 운동 추가 → 학습→시험 → 업무 삭제 시 T1이 기본으로 → 기본 필터 T1, T4, T3', async () => {
    const { c, cats, t } = await seed();
    assert.deepEqual(
      (await c.get('/api/categories')).body.map((x) => x.name),
      ['기본', '업무', '학습'],
    );
    assert.equal((await c.post('/api/categories', { name: '운동' })).status, 201);
    assert.equal((await c.patch(`/api/categories/${cats.학습}`, { name: '시험' })).status, 200);
    assert.equal((await c.get(`/api/todos/${t.T2.id}`)).body.categoryName, '시험');
    assert.equal((await c.delete(`/api/categories/${cats.업무}`)).status, 204);
    const t1 = (await c.get(`/api/todos/${t.T1.id}`)).body;
    assert.equal(t1.categoryName, '기본');
    assert.deepEqual(titles(await list(c, `&categoryId=${cats.기본}`)), [
      '보고서 작성',
      '장보기',
      '여행 준비',
    ]);
    assert.deepEqual(
      (await c.get('/api/categories')).body.map((x) => x.name).sort(),
      ['기본', '시험', '운동'].sort(),
    );
  });
});

describe('SC-04 할일 등록', () => {
  test('T2 저장(completed=false, 진행 중) + A-04-1~4', async () => {
    const c = await signup();
    const study = (await c.post('/api/categories', { name: '학습' })).body.id;
    const t2 = await c.post('/api/todos', {
      title: '시험 공부',
      startDate: '2026-11-02',
      endDate: '2026-11-10',
      categoryId: study,
    });
    assert.equal(t2.status, 201);
    assert.equal(t2.body.completed, false);
    const a1 = await c.post('/api/todos', { title: 'A1', startDate: TODAY, endDate: TODAY });
    assert.equal(a1.body.categoryName, '기본');
    await c.post('/api/todos', { title: 'A2', startDate: '2026-10-28', endDate: '2026-11-03' });
    await c.post('/api/todos', { title: 'A4', startDate: '2026-11-20', endDate: '2026-11-20' });
    const status = Object.fromEntries((await list(c)).map((r) => [r.title, r.status]));
    assert.deepEqual(status, {
      '시험 공부': 'in_progress',
      A1: 'in_progress',
      A2: 'overdue',
      A4: 'not_started',
    });
  });
});

describe('SC-05 할일 수정', () => {
  test('설명 추가·종료일 11-12 → 진행 중, A-05-1~3, E-05-1 입력 위반은 변경 없음', async () => {
    const { c, cats, t } = await seed();
    const url = `/api/todos/${t.T2.id}`;
    const base = { title: '시험 공부', startDate: '2026-11-02' };
    const r = await c.patch(url, { ...base, description: '3장까지', endDate: '2026-11-12' });
    assert.equal(r.status, 200);
    assert.equal(r.body.endDate, '2026-11-12');
    assert.equal(r.body.categoryName, '학습'); // A-05-1
    assert.equal((await list(c)).find((x) => x.id === t.T2.id).status, 'in_progress');
    assert.equal(
      (await c.patch(url, { ...base, endDate: '2026-11-12', categoryId: cats.업무 })).body
        .categoryName,
      '업무',
    ); // A-05-2
    await c.patch(url, { ...base, endDate: '2026-11-03' }); // A-05-3
    assert.equal((await list(c)).find((x) => x.id === t.T2.id).status, 'overdue');

    const before = (await c.get(url)).body;
    for (const bad of [
      { ...base, title: '  ', endDate: '2026-11-12' },
      { ...base, endDate: undefined },
      { ...base, startDate: '2026-11-10', endDate: '2026-11-02' },
      { ...base, title: 'a'.repeat(101), endDate: '2026-11-12' },
      { ...base, endDate: '2026-11-12', description: 'a'.repeat(1001) },
    ]) {
      const res = await c.patch(url, bad);
      assert.equal(res.status, 400, JSON.stringify(bad));
      assert.equal(res.body.error.code, 'VALIDATION_ERROR');
    }
    assert.deepEqual((await c.get(url)).body, before);
  });
});

describe('SC-06 할일 완료 / 완료 취소', () => {
  test('T2 완료↔취소, A-06-1 T1 지연 복귀, A-06-2 T3 완료, A-06-3 T4 진행 중', async () => {
    const { c, t } = await seed();
    const toggle = (id, completed) => c.patch(`/api/todos/${id}/completed`, { completed });
    const st = async (id) => (await list(c)).find((x) => x.id === id).status;
    await toggle(t.T2.id, true);
    assert.equal(await st(t.T2.id), 'completed');
    assert.equal(
      (await cal(c, '2026-11-01', '2026-11-30')).find((x) => x.id === t.T2.id).status,
      'completed',
    );
    await toggle(t.T2.id, false);
    assert.equal(await st(t.T2.id), 'in_progress');
    await toggle(t.T1.id, true);
    assert.equal(await st(t.T1.id), 'completed');
    await toggle(t.T1.id, false);
    assert.equal(await st(t.T1.id), 'overdue');
    await toggle(t.T3.id, true);
    assert.equal(await st(t.T3.id), 'completed');
    await toggle(t.T4.id, false);
    assert.equal(await st(t.T4.id), 'in_progress');
  });
});

describe('SC-07 할일 삭제', () => {
  test('T3 삭제 → 목록·11월·12월 캘린더에 없음, 다시 조회 404', async () => {
    const { c, t } = await seed();
    assert.equal((await c.delete(`/api/todos/${t.T3.id}`)).status, 204);
    assert.ok(!(await list(c)).some((x) => x.id === t.T3.id));
    assert.ok(!(await cal(c, '2026-11-01', '2026-11-30')).some((x) => x.id === t.T3.id));
    assert.ok(!(await cal(c, '2026-12-01', '2026-12-31')).some((x) => x.id === t.T3.id));
    assert.equal((await c.get(`/api/todos/${t.T3.id}`)).status, 404);
  });
});

describe('SC-08 할일 목록 조회와 필터', () => {
  test('정렬 T1, T4, T2, T3 / 카테고리·상태·AND 필터 / A-08-1 / A-08-2 자정 이후', async () => {
    const { c, cats, t } = await seed();
    await seedU2();
    assert.deepEqual(titles(await list(c)), ['보고서 작성', '장보기', '시험 공부', '여행 준비']);
    assert.deepEqual(titles(await list(c, `&categoryId=${cats.업무}`)), ['보고서 작성']);
    assert.deepEqual(titles(await list(c, '&status=in_progress')), ['시험 공부']);
    assert.deepEqual(titles(await list(c, `&categoryId=${cats.업무}&status=in_progress`)), []);
    assert.deepEqual(titles(await list(c, `&categoryId=${cats.학습}&status=in_progress`)), [
      '시험 공부',
    ]);
    assert.deepEqual(titles(await list(c, '&status=completed')), ['장보기']);
    assert.deepEqual(titles(await list(c, '&status=not_started')), ['여행 준비']);
    assert.deepEqual(titles(await list(c, '&status=overdue')), ['보고서 작성']);
    await c.patch(`/api/todos/${t.T4.id}/completed`, { completed: false });
    const next = (await c.get('/api/todos?today=2026-11-05')).body;
    assert.equal(next.find((x) => x.id === t.T4.id).status, 'overdue');
  });
});

describe('SC-09 캘린더 월 뷰', () => {
  test('11월 4건(BR-20 순서), 10월 T1만, 12월 T3만, A-09-1 날짜별 개수, A-09-2 11-04 4건 순서', async () => {
    const { c } = await seed();
    await seedU2();
    const nov = await cal(c, '2026-11-01', '2026-11-30');
    assert.deepEqual(titles(nov), ['보고서 작성', '장보기', '시험 공부', '여행 준비']);
    assert.deepEqual(
      nov.map((x) => x.status),
      ['overdue', 'completed', 'in_progress', 'not_started'],
    );
    assert.deepEqual(titles(await cal(c, '2026-10-01', '2026-10-31')), ['보고서 작성']);
    assert.deepEqual(titles(await cal(c, '2026-12-01', '2026-12-31')), ['여행 준비']);
    // 모바일 개수 점: 할일 기간이 날짜를 포함하는 개수
    const count = (d) => nov.filter((x) => x.startDate <= d && d <= x.endDate).length;
    assert.deepEqual(
      ['2026-11-01', '2026-11-02', '2026-11-04', '2026-11-05', '2026-11-11', '2026-11-20'].map(
        count,
      ),
      [1, 2, 2, 1, 0, 1],
    );
    for (const title of ['회의', '운동'])
      await c.post('/api/todos', { title, startDate: TODAY, endDate: TODAY });
    assert.deepEqual(titles(await cal(c, TODAY, TODAY)), ['장보기', '회의', '운동', '시험 공부']);
  });
});

describe('SC-10 캘린더 주 뷰 / 일 뷰', () => {
  test('주 11-01~07, 11-08~14, 10-25~31 / 일 11-04, 11-03, 11-05', async () => {
    const { c } = await seed();
    assert.deepEqual(titles(await cal(c, '2026-11-01', '2026-11-07')), [
      '보고서 작성',
      '장보기',
      '시험 공부',
    ]);
    assert.deepEqual(titles(await cal(c, '2026-11-08', '2026-11-14')), ['시험 공부']);
    assert.deepEqual(titles(await cal(c, '2026-10-25', '2026-10-31')), ['보고서 작성']);
    const day = await cal(c, TODAY, TODAY);
    assert.deepEqual(
      day.map((x) => [x.title, x.status]),
      [
        ['장보기', 'completed'],
        ['시험 공부', 'in_progress'],
      ],
    );
    const d3 = await cal(c, '2026-11-03', '2026-11-03');
    assert.deepEqual(
      d3.map((x) => [x.title, x.status]),
      [
        ['보고서 작성', 'overdue'],
        ['시험 공부', 'in_progress'],
      ],
    );
    assert.deepEqual(titles(await cal(c, '2026-11-05', '2026-11-05')), ['시험 공부']);
  });
});

describe('SC-11 내 정보', () => {
  test('조회 → 이름 김학생 → 비밀번호 변경: 현재 세션 유지, 다른 세션 refresh 무효, 새 비밀번호로 로그인', async () => {
    const email = 'sc11@example.com';
    const c = await signup(email);
    const other = client(ctx);
    await other.post('/api/auth/login', { email, password: 'password123' });
    assert.equal((await c.get('/api/me')).body.email, email);
    assert.equal((await c.patch('/api/me', { name: '김학생' })).body.name, '김학생');
    assert.equal((await c.get('/api/me')).body.name, '김학생');
    const pw = await c.put('/api/me/password', {
      currentPassword: 'password123',
      newPassword: 'newpass1234',
    });
    assert.equal(pw.status, 204);
    assert.equal((await c.get('/api/me')).status, 200);
    assert.equal((await c.post('/api/auth/refresh')).status, 204);
    assert.equal((await other.post('/api/auth/refresh')).status, 401);
    assert.equal(
      (await client(ctx).post('/api/auth/login', { email, password: 'password123' })).status,
      401,
    );
    assert.equal(
      (await client(ctx).post('/api/auth/login', { email, password: 'newpass1234' })).status,
      200,
    );
    assert.equal((await c.get('/api/me')).body.email, email);
  });
});

describe('SC-12 캘린더에서 편집', () => {
  test('11-05 칸의 T2를 단건 조회해 편집값을 채우고 저장하면 캘린더에 반영', async () => {
    const { c } = await seed();
    const t2 = (await cal(c, '2026-11-05', '2026-11-05'))[0];
    const one = (await c.get(`/api/todos/${t2.id}`)).body;
    assert.equal(one.title, '시험 공부');
    await c.patch(`/api/todos/${t2.id}`, {
      title: one.title,
      startDate: one.startDate,
      endDate: '2026-11-12',
    });
    assert.ok((await cal(c, '2026-11-12', '2026-11-12')).some((x) => x.id === t2.id));
  });
});

describe('SC-13 대표 종단 시나리오', () => {
  test('가입 → 학습 추가 → T2 등록 → 필터 1건 → 월 뷰 → 완료 → 필터 0건·캘린더 완료 → 로그아웃 401', async () => {
    const c = await signup('sc13@example.com');
    assert.deepEqual(await list(c), []);
    const study = (await c.post('/api/categories', { name: '학습' })).body.id;
    const t2 = (
      await c.post('/api/todos', {
        title: '시험 공부',
        startDate: '2026-11-02',
        endDate: '2026-11-10',
        categoryId: study,
      })
    ).body;
    const filter = `&categoryId=${study}&status=in_progress`;
    assert.deepEqual(titles(await list(c, filter)), ['시험 공부']);
    assert.equal((await cal(c, '2026-11-01', '2026-11-30'))[0].status, 'in_progress');
    await c.patch(`/api/todos/${t2.id}/completed`, { completed: true });
    assert.deepEqual(await list(c, filter), []);
    assert.equal((await cal(c, '2026-11-01', '2026-11-30'))[0].status, 'completed');
    await c.post('/api/auth/logout');
    assert.equal((await c.get(`/api/todos?today=${TODAY}`)).status, 401);
  });
});
