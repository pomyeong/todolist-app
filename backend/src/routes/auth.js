import { Router } from 'express';
import { validateLogin, validateSignup } from '../domain/validate.js';
import { assertValid } from '../errors.js';
import { readCookie } from '../middleware/auth.js';
import * as authService from '../services/auth.js';

export const authRouter = Router();

export function setAuthCookies(res, { accessToken, refreshToken }) {
  res.cookie(authService.ACCESS_COOKIE, accessToken, {
    ...authService.accessCookieOptions(),
    maxAge: authService.ACCESS_MAX_AGE_MS,
  });
  res.cookie(authService.REFRESH_COOKIE, refreshToken, {
    ...authService.refreshCookieOptions(),
    maxAge: authService.REFRESH_MAX_AGE_MS,
  });
}

// 발급 때와 같은 path·옵션이어야 브라우저가 지운다(PR-S-03).
function clearAuthCookies(res) {
  res.clearCookie(authService.ACCESS_COOKIE, authService.accessCookieOptions());
  res.clearCookie(authService.REFRESH_COOKIE, authService.refreshCookieOptions());
}

authRouter.post('/signup', async (req, res) => {
  const { user, ...tokens } = await authService.signup(assertValid(validateSignup(req.body)));
  setAuthCookies(res, tokens);
  res.status(201).json(user);
});

authRouter.post('/login', async (req, res) => {
  const { user, ...tokens } = await authService.login(assertValid(validateLogin(req.body)));
  setAuthCookies(res, tokens);
  res.json(user);
});

authRouter.post('/refresh', async (req, res) => {
  try {
    setAuthCookies(res, await authService.rotate(readCookie(req, authService.REFRESH_COOKIE)));
    res.status(204).end();
  } catch (err) {
    clearAuthCookies(res);
    throw err;
  }
});

authRouter.post('/logout', async (req, res) => {
  await authService.logout(readCookie(req, authService.REFRESH_COOKIE));
  clearAuthCookies(res);
  res.status(204).end();
});
