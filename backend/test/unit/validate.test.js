import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { STATUS_VALUES as STATUS } from '../../src/domain/status.js';
import {
  parseId,
  validateCalendarQuery,
  validateCategoryName,
  validateName,
  validatePasswordChange,
  validateSignup,
  validateTodo,
  validateTodoQuery,
} from '../../src/domain/validate.js';

const ok = (r) => assert.deepEqual(r.fields, {});
const bad = (r, field) =>
  assert.ok(r.fields[field], `${field} 실패 기대: ${JSON.stringify(r.fields)}`);
const signup = (over) => ({ email: 'a@x.com', password: 'password', name: '홍길동', ...over });
const todo = (over) => ({ title: '할일', startDate: '2026-11-04', endDate: '2026-11-04', ...over });
const email = (n) => `${'a'.repeat(n - 6)}@x.com`;

describe('회원가입 검증', () => {
  test('BR-21 비밀번호 7자·65자 실패, 8자·64자 통과', () => {
    bad(validateSignup(signup({ password: 'a'.repeat(7) })), 'password');
    bad(validateSignup(signup({ password: 'a'.repeat(65) })), 'password');
    ok(validateSignup(signup({ password: 'a'.repeat(8) })));
    ok(validateSignup(signup({ password: 'a'.repeat(64) })));
  });
  test("BR-22 비밀번호는 trim하지 않는다(' 1234567'은 8자로 통과)", () => {
    const r = validateSignup(signup({ password: ' 1234567' }));
    ok(r);
    assert.equal(r.value.password, ' 1234567');
  });
  test('E-01-2 이메일 254자 통과·255자 실패, 형식 오류 실패', () => {
    ok(validateSignup(signup({ email: email(254) })));
    bad(validateSignup(signup({ email: email(255) })), 'email');
    bad(validateSignup(signup({ email: 'not-an-email' })), 'email');
  });
  test('DB-03 이메일은 trim 후 소문자로 반환', () => {
    assert.equal(validateSignup(signup({ email: '  A@X.Com ' })).value.email, 'a@x.com');
  });
  test('E-01-3 이름 50자 통과·51자 실패, 공백만 실패, 앞뒤 공백 trim', () => {
    ok(validateSignup(signup({ name: 'a'.repeat(50) })));
    bad(validateSignup(signup({ name: 'a'.repeat(51) })), 'name');
    bad(validateSignup(signup({ name: '   ' })), 'name');
    assert.equal(validateSignup(signup({ name: '  홍길동 ' })).value.name, '홍길동');
  });
  test('PD-22 여러 필드가 틀리면 fields에 모두 담긴다', () => {
    const r = validateSignup({ email: 'x', password: '1', name: '' });
    assert.deepEqual(Object.keys(r.fields).sort(), ['email', 'name', 'password']);
  });
});

describe('이름·비밀번호 변경 검증', () => {
  test('BR-22 이름 50/51자', () => {
    ok(validateName({ name: 'a'.repeat(50) }));
    bad(validateName({ name: 'a'.repeat(51) }), 'name');
  });
  test('BR-21 새 비밀번호 7자 실패, 현재 비밀번호 누락 실패', () => {
    bad(
      validatePasswordChange({ currentPassword: 'x', newPassword: 'a'.repeat(7) }),
      'newPassword',
    );
    bad(validatePasswordChange({ newPassword: 'a'.repeat(8) }), 'currentPassword');
  });
});

describe('카테고리 이름 검증', () => {
  test('E-03-3 카테고리 30자 통과·31자 실패, 공백만 실패', () => {
    ok(validateCategoryName({ name: 'a'.repeat(30) }));
    bad(validateCategoryName({ name: 'a'.repeat(31) }), 'name');
    bad(validateCategoryName({ name: '  ' }), 'name');
  });
});

describe('할일 검증', () => {
  test('E-04-3 제목 100자 통과·101자 실패, 공백 제목 실패', () => {
    ok(validateTodo(todo({ title: 'a'.repeat(100) })));
    bad(validateTodo(todo({ title: 'a'.repeat(101) })), 'title');
    bad(validateTodo(todo({ title: '   ' })), 'title');
  });
  test('E-04-3 설명 1000자 통과·1001자 실패, 빈 설명은 null(DB-11)', () => {
    ok(validateTodo(todo({ description: 'a'.repeat(1000) })));
    bad(validateTodo(todo({ description: 'a'.repeat(1001) })), 'description');
    assert.equal(validateTodo(todo({ description: '   ' })).value.description, null);
  });
  test('PD-27 title: null 실패, description: null 통과, categoryId: null 실패', () => {
    bad(validateTodo(todo({ title: null })), 'title');
    ok(validateTodo(todo({ description: null })));
    bad(validateTodo(todo({ categoryId: null })), 'categoryId');
  });
  test('NFR-11 2026-13-01, 2026-02-30, 2026-1-1은 형식 오류, 2026-02-28은 통과', () => {
    for (const d of ['2026-13-01', '2026-02-30', '2026-1-1']) {
      bad(validateTodo(todo({ startDate: d, endDate: '2026-12-31' })), 'startDate');
    }
    ok(validateTodo(todo({ startDate: '2026-02-28', endDate: '2026-02-28' })));
  });
  test('E-04-2 BR-07 시작일 > 종료일 실패, 같은 날 통과', () => {
    bad(validateTodo(todo({ startDate: '2026-11-10', endDate: '2026-11-02' })), 'endDate');
    ok(validateTodo(todo({ startDate: '2026-11-10', endDate: '2026-11-10' })));
  });
  test('E-04-1 제목·날짜 누락 실패', () => {
    const r = validateTodo({});
    assert.deepEqual(Object.keys(r.fields).sort(), ['endDate', 'startDate', 'title']);
  });
});

describe('조회 조건 검증', () => {
  test('PD-13 categoryId=abc 실패, 경로 id abc는 null', () => {
    bad(validateTodoQuery({ today: '2026-11-04', categoryId: 'abc' }, STATUS), 'categoryId');
    assert.equal(parseId('abc'), null);
    assert.equal(parseId('12'), 12);
  });
  test('E-08-1 today 누락·2026-13-01 실패', () => {
    bad(validateTodoQuery({}, STATUS), 'today');
    bad(validateTodoQuery({ today: '2026-13-01' }, STATUS), 'today');
  });
  test('E-08-3 status=done 실패, PD-19의 4개 값 통과', () => {
    bad(validateTodoQuery({ today: '2026-11-04', status: 'done' }, STATUS), 'status');
    for (const s of STATUS) ok(validateTodoQuery({ today: '2026-11-04', status: s }, STATUS));
  });
  test('E-09-2 from > to 실패, 같은 날 통과', () => {
    const q = { today: '2026-11-04', from: '2026-11-30', to: '2026-11-01' };
    bad(validateCalendarQuery(q), 'to');
    ok(validateCalendarQuery({ ...q, to: '2026-11-30' }));
  });
});
