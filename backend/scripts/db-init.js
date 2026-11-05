// 스키마 적용(PD-08). 사용: npm run db:init [-- --reset]
// 테스트 DB: node --env-file=.env.test scripts/db-init.js --reset
import { readFile } from 'node:fs/promises';
import { close, query } from '../src/db.js';

const reset = process.argv.includes('--reset');
const schema = await readFile(new URL('../../docs/schema.sql', import.meta.url), 'utf8');

try {
  if (reset) {
    await query('DROP TABLE IF EXISTS refresh_tokens, todos, categories, users');
  }
  await query(schema);
  console.log(`스키마 적용 완료${reset ? '(--reset)' : ''}`);
} catch (err) {
  console.error(`스키마 적용 실패: ${err.message}`);
  process.exitCode = 1;
} finally {
  await close();
}
