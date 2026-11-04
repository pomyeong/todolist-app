import express from 'express';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { apiRouter } from './routes/index.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '16kb' }));
  // PD-14: 기동 확인만 한다(DB 미조회).
  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.use('/api', apiRouter);
  app.use('/api', notFoundHandler);
  app.use(errorHandler);
  return app;
}
