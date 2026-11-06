import { fileURLToPath } from 'node:url';
import express from 'express';
import { config } from './config.js';
import { query } from './db.js';
import { cors } from './middleware/cors.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { apiRouter } from './routes/index.js';

const SPEC_PATH = fileURLToPath(new URL('../swagger.yaml', import.meta.url));
const SWAGGER_UI = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14';
const DOCS_HTML = `<!doctype html>
<html lang="ko">
<head><meta charset="utf-8"><title>TodoList API</title>
<link rel="stylesheet" href="${SWAGGER_UI}/swagger-ui.css"></head>
<body><div id="swagger-ui"></div>
<script src="${SWAGGER_UI}/swagger-ui-bundle.js"></script>
<script>SwaggerUIBundle({ url: '/api/docs/swagger.yaml', dom_id: '#swagger-ui' });</script>
</body></html>`;

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors); // 오류 응답에도 CORS 헤더가 붙도록 맨 앞에 둔다
  app.use(express.json({ limit: '16kb' }));
  // PD-14: 기동과 DB 연결을 확인한다. DB 실패는 오류 미들웨어가 아닌 503 상태 본문으로 답한다.
  app.get('/api/health', async (_req, res) => {
    try {
      await query('SELECT 1');
      res.json({ ok: true, db: 'up' });
    } catch {
      res.status(503).json({ ok: false, db: 'down' });
    }
  });
  // PD-30: Swagger UI는 개발 환경에서만 연다. 그 밖의 환경은 등록하지 않아 404다.
  if (config.nodeEnv === 'development') {
    app.get('/api/docs', (_req, res) => res.type('html').send(DOCS_HTML));
    app.get('/api/docs/swagger.yaml', (_req, res) => res.type('yaml').sendFile(SPEC_PATH));
  }
  app.use('/api', apiRouter);
  app.use('/api', notFoundHandler);
  app.use(errorHandler);
  return app;
}

// Vercel Express 프리셋은 src/app.js의 default export(앱 인스턴스)를 함수 진입점으로 쓴다. 로컬은 server.js가 listen한다.
export default createApp();
