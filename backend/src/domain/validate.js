// 입력 검증 순수 함수(PR-L-07: import·I/O 없음). 모두 { value, fields }를 돌려주고,
// fields가 비어 있지 않으면 호출 쪽이 errors.assertValid로 400 VALIDATION_ERROR를 던진다.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const INT_RE = /^\d+$/;
const INT_MAX = 2147483647; // PostgreSQL INTEGER 상한(DB-01)

const MSG = {
  required: '필수 항목입니다.',
  type: '형식이 올바르지 않습니다.',
  email: '이메일 형식이 올바르지 않습니다.',
  date: '날짜 형식(YYYY-MM-DD)이 올바르지 않습니다.',
  time: '시간 형식(HH:MM)이 올바르지 않습니다.',
  len: (min, max) =>
    min > 0 ? `${min}자 이상 ${max}자 이하여야 합니다.` : `${max}자 이하여야 합니다.`,
};

// 필수 문자열: trim 후 min~max자(BR-22). 공백만이면 누락.
function text(fields, name, raw, min, max) {
  if (raw === undefined || raw === null) {
    fields[name] = MSG.required;
    return undefined;
  }
  if (typeof raw !== 'string') {
    fields[name] = MSG.type;
    return undefined;
  }
  const v = raw.trim();
  if (v === '') fields[name] = MSG.required;
  else if (v.length < min || v.length > max) fields[name] = MSG.len(min, max);
  return v;
}

// 비밀번호: trim하지 않는다(BR-22). 8~64자(BR-21).
function password(fields, name, raw) {
  if (raw === undefined || raw === null || raw === '') fields[name] = MSG.required;
  else if (typeof raw !== 'string') fields[name] = MSG.type;
  else if (raw.length < 8 || raw.length > 64) fields[name] = MSG.len(8, 64);
  return raw;
}

export function isDate(v) {
  if (typeof v !== 'string' || !DATE_RE.test(v)) return false;
  const [y, m, d] = v.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

function date(fields, name, raw) {
  if (raw === undefined || raw === null || raw === '') fields[name] = MSG.required;
  else if (!isDate(raw)) fields[name] = MSG.date;
  return raw;
}

// BR-24: 선택 시간 'HH:MM'(00:00~23:59). 생략·null·빈 문자열은 시간 없음(PD-27).
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
function time(fields, name, raw) {
  if (raw === undefined || raw === null || raw === '') return null;
  if (typeof raw !== 'string' || !TIME_RE.test(raw)) fields[name] = MSG.time;
  return raw;
}

// 경로 :id → 정수 또는 null(정수가 아니면 404, PD-13).
export function parseId(raw) {
  if (typeof raw !== 'string' || !INT_RE.test(raw)) return null;
  const n = Number(raw);
  return n >= 1 && n <= INT_MAX ? n : null;
}

export function validateSignup(body = {}) {
  const fields = {};
  const email = text(fields, 'email', body.email, 1, 254);
  if (!fields.email && !EMAIL_RE.test(email)) fields.email = MSG.email;
  password(fields, 'password', body.password);
  const name = text(fields, 'name', body.name, 1, 50);
  return { value: { email: email?.toLowerCase(), password: body.password, name }, fields };
}

export function validateLogin(body = {}) {
  const fields = {};
  const email = typeof body.email === 'string' ? body.email.trim() : body.email;
  if (typeof email !== 'string' || email === '') fields.email = MSG.required;
  if (typeof body.password !== 'string' || body.password === '') fields.password = MSG.required;
  return { value: { email: email?.toLowerCase?.(), password: body.password }, fields };
}

export function validateCategoryName(body = {}) {
  const fields = {};
  const name = text(fields, 'name', body.name, 1, 30);
  return { value: { name }, fields };
}

export function validateName(body = {}) {
  const fields = {};
  const name = text(fields, 'name', body.name, 1, 50);
  return { value: { name }, fields };
}

export function validatePasswordChange(body = {}) {
  const fields = {};
  if (typeof body.currentPassword !== 'string' || body.currentPassword === '') {
    fields.currentPassword = MSG.required;
  }
  password(fields, 'newPassword', body.newPassword);
  return {
    value: { currentPassword: body.currentPassword, newPassword: body.newPassword },
    fields,
  };
}

// 할일 등록·수정 본문(PD-20). 생략한 description·categoryId는 undefined로 남긴다(수정에서 기존 값 유지).
export function validateTodo(body = {}) {
  const fields = {};
  const title = text(fields, 'title', body.title, 1, 100);

  let description = body.description;
  if (description !== undefined && description !== null) {
    if (typeof description !== 'string') fields.description = MSG.type;
    else {
      description = description.trim();
      if (description.length > 1000) fields.description = MSG.len(0, 1000);
      if (description === '') description = null; // DB-11
    }
  }

  const startDate = date(fields, 'startDate', body.startDate);
  const endDate = date(fields, 'endDate', body.endDate);
  if (!fields.startDate && !fields.endDate && startDate > endDate) {
    fields.endDate = '종료일은 시작일과 같거나 이후여야 합니다.'; // BR-07
  }
  const startTime = time(fields, 'startTime', body.startTime);
  const endTime = time(fields, 'endTime', body.endTime);
  if (
    !fields.startTime &&
    !fields.endTime &&
    startTime &&
    endTime &&
    startDate === endDate &&
    startTime > endTime
  ) {
    fields.endTime = '종료 시간은 시작 시간과 같거나 이후여야 합니다.'; // BR-24
  }

  const categoryId = body.categoryId;
  if (
    categoryId !== undefined &&
    !(Number.isInteger(categoryId) && categoryId >= 1 && categoryId <= INT_MAX)
  ) {
    fields.categoryId = MSG.type; // null도 실패(PD-27)
  }

  return {
    value: { title, description, startDate, endDate, startTime, endTime, categoryId },
    fields,
  };
}

export function validateCompleted(body = {}) {
  const fields = {};
  if (typeof body.completed !== 'boolean') fields.completed = MSG.type;
  return { value: { completed: body.completed }, fields };
}

function today(fields, query) {
  date(fields, 'today', query.today);
  return query.today;
}

// 목록 조회 조건(PD-13, P-12). statusValues는 domain/status.js의 STATUS_VALUES(PD-19).
export function validateTodoQuery(query, statusValues) {
  const fields = {};
  const t = today(fields, query);
  let categoryId;
  if (query.categoryId !== undefined) {
    categoryId = parseId(query.categoryId);
    if (categoryId === null) fields.categoryId = MSG.type;
  }
  if (query.status !== undefined && !statusValues.includes(query.status)) fields.status = MSG.type;
  return { value: { today: t, categoryId, status: query.status }, fields };
}

export function validateCalendarQuery(query) {
  const fields = {};
  const t = today(fields, query);
  const from = date(fields, 'from', query.from);
  const to = date(fields, 'to', query.to);
  if (!fields.from && !fields.to && from > to)
    fields.to = '종료일은 시작일과 같거나 이후여야 합니다.';
  return { value: { today: t, from, to }, fields };
}
