import { unauthorized } from '../errors.js';
import { ACCESS_COOKIE, verifyAccessToken } from '../services/auth.js';

// cookie-parser 없이 Cookie 헤더에서 값 하나를 꺼낸다(PD-15).
export function readCookie(req, name) {
  for (const part of (req.headers.cookie ?? '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name)
      return decodeURIComponent(part.slice(i + 1).trim());
  }
  return undefined;
}

export function auth(req, _res, next) {
  const userId = verifyAccessToken(readCookie(req, ACCESS_COOKIE) ?? '');
  if (userId === null) throw unauthorized();
  req.userId = userId;
  next();
}
