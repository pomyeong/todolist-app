import { Router } from 'express';
import { parseId, validateCategoryName } from '../domain/validate.js';
import { assertValid, notFound } from '../errors.js';
import * as categories from '../services/categories.js';

export const categoriesRouter = Router();

// PD-13: 정수가 아닌 :id는 없는 것과 같다.
function idOf(req) {
  const id = parseId(req.params.id);
  if (id === null) throw notFound();
  return id;
}

categoriesRouter.get('/', async (req, res) => {
  res.json(await categories.list(req.userId));
});

categoriesRouter.post('/', async (req, res) => {
  const input = assertValid(validateCategoryName(req.body));
  res.status(201).json(await categories.create(req.userId, input));
});

categoriesRouter.patch('/:id', async (req, res) => {
  const input = assertValid(validateCategoryName(req.body)); // PD-22: 입력 검증이 먼저
  res.json(await categories.rename(req.userId, idOf(req), input));
});

categoriesRouter.delete('/:id', async (req, res) => {
  await categories.remove(req.userId, idOf(req));
  res.status(204).end();
});
