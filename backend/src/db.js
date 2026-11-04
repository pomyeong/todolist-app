import pg from 'pg';
import { config } from './config.js';

// DATE(OID 1082)는 'YYYY-MM-DD' 문자열 그대로 받는다. Date 객체로 바꾸면 시간대 때문에 날짜가 밀린다(NFR-11).
pg.types.setTypeParser(1082, (value) => value);

const pool = new pg.Pool({ connectionString: config.databaseUrl, max: config.dbPoolMax });

export function query(text, params) {
  return pool.query(text, params);
}

// fn(client)를 한 트랜잭션으로 실행한다. 오류면 ROLLBACK 후 다시 던지고, 어느 경우든 커넥션을 반납한다(PR-L-06).
export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export function close() {
  return pool.end();
}
