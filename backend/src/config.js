// 환경변수는 이 파일에서만 읽는다(PR-S-01). 잘못되면 import 시점에 throw해 기동을 멈춘다.
const env = process.env;

if (!env.DATABASE_URL) {
  throw new Error('설정 오류: DATABASE_URL이 없습니다.');
}
// HS384 키가 384비트 이상이 되도록 48자 이상(PR-S-01)
// 운영에서 허용 출처를 기본값(localhost)으로 두면 화면이 API를 못 부르므로 필수로 한다(PR-S-04).
if (env.NODE_ENV === 'production' && !env.CORS_ORIGIN) {
  throw new Error('설정 오류: production에서는 CORS_ORIGIN이 필요합니다.');
}
if (!env.JWT_SECRET || env.JWT_SECRET.length < 48) {
  throw new Error('설정 오류: JWT_SECRET은 48자 이상이어야 합니다.');
}

// 토큰 만료(PR-S-01): 양의 정수만 받는다. 0·음수·소수·오타는 기동을 멈춘다.
function positiveInt(name, fallback) {
  if (env[name] === undefined || env[name] === '') return fallback;
  const n = Number(env[name]);
  if (!Number.isInteger(n) || n <= 0) throw new Error(`설정 오류: ${name}은 양의 정수여야 합니다.`);
  return n;
}

export const config = Object.freeze({
  databaseUrl: env.DATABASE_URL,
  jwtSecret: env.JWT_SECRET,
  port: Number(env.PORT) || 3000,
  dbPoolMax: Number(env.DB_POOL_MAX) || 20,
  nodeEnv: env.NODE_ENV || 'development',
  corsOrigin: env.CORS_ORIGIN || 'http://localhost:5173',
  accessTtlSec: positiveInt('JWT_ACCESS_EXPIRES_MINUTES', 15) * 60,
  refreshTtlSec: positiveInt('REFRESH_TOKEN_TTL_DAYS', 7) * 24 * 60 * 60,
});
