// 환경변수는 이 파일에서만 읽는다(PR-S-01). 잘못되면 import 시점에 throw해 기동을 멈춘다.
const env = process.env;

if (!env.DATABASE_URL) {
  throw new Error('설정 오류: DATABASE_URL이 없습니다.');
}
// HS384 키가 384비트 이상이 되도록 48자 이상(PR-S-01)
if (!env.JWT_SECRET || env.JWT_SECRET.length < 48) {
  throw new Error('설정 오류: JWT_SECRET은 48자 이상이어야 합니다.');
}

export const config = Object.freeze({
  databaseUrl: env.DATABASE_URL,
  jwtSecret: env.JWT_SECRET,
  port: Number(env.PORT) || 3000,
  dbPoolMax: Number(env.DB_POOL_MAX) || 20,
  nodeEnv: env.NODE_ENV || 'development',
});
