import { Router } from 'express';
import { STATUS_VALUES } from '../domain/status.js';
import { parseId, validateCompleted, validateTodo, validateTodoQuery } from '../domain/validate.js';
import { assertValid, notFound } from '../errors.js';
import * as todos from '../services/todos.js';

export const todosRouter = Router();

// PD-13: 정수가 아닌 :id는 없는 것과 같다.
function idOf(req) {
  const id = parseId(req.params.id);
  if (id === null) throw notFound();
  return id;
}

todosRouter.get('/', async (req, res) => {
  res.json(await todos.list(req.userId, assertValid(validateTodoQuery(req.query, STATUS_VALUES))));
});

todosRouter.post('/', async (req, res) => {
  res.status(201).json(await todos.create(req.userId, assertValid(validateTodo(req.body))));
});

todosRouter.get('/:id', async (req, res) => {
  res.json(await todos.getOne(req.userId, idOf(req)));
});

todosRouter.patch('/:id', async (req, res) => {
  const input = assertValid(validateTodo(req.body)); // PD-22: 입력 검증이 먼저
  res.json(await todos.update(req.userId, idOf(req), input));
});

todosRouter.delete('/:id', async (req, res) => {
  await todos.remove(req.userId, idOf(req));
  res.status(204).end();
});

todosRouter.patch('/:id/completed', async (req, res) => {
  const input = assertValid(validateCompleted(req.body));
  res.json(await todos.setCompleted(req.userId, idOf(req), input));
});
