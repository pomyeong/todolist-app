import { Router } from 'express';
import { validateCalendarQuery } from '../domain/validate.js';
import { assertValid } from '../errors.js';
import { calendar } from '../services/todos.js';

export const calendarRouter = Router();

calendarRouter.get('/', async (req, res) => {
  res.json(await calendar(req.userId, assertValid(validateCalendarQuery(req.query))));
});
