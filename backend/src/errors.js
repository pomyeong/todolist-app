// 오류 코드(NFR-15)는 이 파일에만 문자열로 둔다(PR-C-01).
export const ERROR = Object.freeze({
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DEFAULT_CATEGORY_IMMUTABLE: 'DEFAULT_CATEGORY_IMMUTABLE',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_EMAIL: 'DUPLICATE_EMAIL',
  DUPLICATE_CATEGORY: 'DUPLICATE_CATEGORY',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
});

export class AppError extends Error {
  constructor(status, code, message, fields) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export const validationError = (fields, message = '입력값을 확인해 주세요.') =>
  new AppError(400, ERROR.VALIDATION_ERROR, message, fields);
export const notFound = () => new AppError(404, ERROR.NOT_FOUND, '대상을 찾을 수 없습니다.');
export const unauthorized = () => new AppError(401, ERROR.UNAUTHORIZED, '로그인이 필요합니다.');

// domain/validate.js의 결과({ value, fields })를 받아 오류면 VALIDATION_ERROR를 던진다(PR-L-07: domain은 import 없음).
export function assertValid({ value, fields }) {
  if (Object.keys(fields).length > 0) throw validationError(fields);
  return value;
}
