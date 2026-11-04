import { Router } from 'express';
import { validateName, validatePasswordChange } from '../domain/validate.js';
import { assertValid } from '../errors.js';
import { changePassword, getMe, updateName } from '../services/users.js';
import { setAuthCookies } from './auth.js';

export const meRouter = Router();

meRouter.get('/', async (req, res) => {
  res.json(await getMe(req.userId));
});

// BR-05: validateName이 name 외 필드(email 등)를 걸러 무시한다.
meRouter.patch('/', async (req, res) => {
  res.json(await updateName(req.userId, assertValid(validateName(req.body))));
});

meRouter.put('/password', async (req, res) => {
  const input = assertValid(validatePasswordChange(req.body));
  setAuthCookies(res, await changePassword(req.userId, input));
  res.status(204).end();
});
