import { AppError, ERROR, notFound, validationError } from '../errors.js';

export function notFoundHandler(_req, _res, next) {
  next(notFound());
}

// NFR-15 형식 응답은 여기서만 만든다(PR-N-07).
export function errorHandler(err, req, res, _next) {
  let error = err;
  // PR-S-07: 본문 한도 초과(413)·JSON 파싱 실패는 400 VALIDATION_ERROR로 바꾼다.
  if (err.type === 'entity.too.large')
    error = validationError(undefined, '요청 본문이 너무 큽니다.');
  else if (err.type === 'entity.parse.failed')
    error = validationError(undefined, '요청 본문이 올바른 JSON이 아닙니다.');

  if (!(error instanceof AppError)) {
    // PR-S-08: 본문·쿠키·비밀번호는 남기지 않는다.
    console.error(
      JSON.stringify({
        time: new Date().toISOString(),
        method: req.method,
        path: req.path,
        message: err.message,
        stack: err.stack,
      }),
    );
    error = new AppError(500, ERROR.INTERNAL_ERROR, '일시적인 오류가 발생했습니다.');
  }

  const body = { code: error.code, message: error.message };
  if (error.fields) body.fields = error.fields;
  res.status(error.status).json({ error: body });
}
