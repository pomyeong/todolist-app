import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { authRouter } from './auth.js';
import { calendarRouter } from './calendar.js';
import { categoriesRouter } from './categories.js';
import { meRouter } from './me.js';
import { todosRouter } from './todos.js';

export const apiRouter = Router();

// PR-S-05: 공개는 /api/auth/*(signup·login·refresh·logout)와 /api/health(app.js)뿐이다.
apiRouter.use('/auth', authRouter);

// 여기에 추가한 라우터는 모두 auth가 먼저 걸린다. 경로 단위로 걸어 없는 /api 경로는 404로 남긴다.
const PROTECTED = {
  '/me': meRouter,
  '/categories': categoriesRouter,
  '/todos': todosRouter,
  '/calendar': calendarRouter,
};
for (const [path, router] of Object.entries(PROTECTED)) apiRouter.use(path, auth, router);
