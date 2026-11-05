import { config } from '../config.js';

// PR-S-04: 프론트 출처 하나만 쿠키 포함 요청을 허용한다. 다른 출처에는 CORS 헤더를 주지 않아 브라우저가 응답을 막는다.
export function cors(req, res, next) {
  res.vary('Origin');
  if (req.headers.origin !== config.corsOrigin) return next();
  res.set({
    'Access-Control-Allow-Origin': config.corsOrigin,
    'Access-Control-Allow-Credentials': 'true',
  });
  if (req.method !== 'OPTIONS') return next();
  res.set({
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '600',
  });
  res.sendStatus(204);
}
