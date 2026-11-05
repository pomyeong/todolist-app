import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

// config.js는 import 시점에 환경변수를 읽으므로 자식 프로세스에서 확인한다.
function load(overrides) {
  const r = spawnSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      "const { config } = await import('./src/config.js'); console.log(JSON.stringify(config));",
    ],
    { env: { ...process.env, ...overrides }, encoding: 'utf8' },
  );
  return r.status === 0 ? { config: JSON.parse(r.stdout) } : { error: r.stderr };
}

test('PR-S-01 토큰 만료: 값이 없으면 기본 15분·7일, 지정하면 그 값', () => {
  assert.deepEqual(
    (({ accessTtlSec, refreshTtlSec }) => ({ accessTtlSec, refreshTtlSec }))(
      load({ JWT_ACCESS_EXPIRES_MINUTES: '', REFRESH_TOKEN_TTL_DAYS: '' }).config,
    ),
    { accessTtlSec: 900, refreshTtlSec: 604800 },
  );
  const { config } = load({ JWT_ACCESS_EXPIRES_MINUTES: '5', REFRESH_TOKEN_TTL_DAYS: '30' });
  assert.equal(config.accessTtlSec, 300);
  assert.equal(config.refreshTtlSec, 30 * 86400);
});

test('PR-S-01 토큰 만료가 양의 정수가 아니면 기동하지 않음', () => {
  for (const bad of ['0', '-1', '1.5', '15m', 'abc']) {
    for (const name of ['JWT_ACCESS_EXPIRES_MINUTES', 'REFRESH_TOKEN_TTL_DAYS']) {
      const { error } = load({ [name]: bad });
      assert.match(error ?? '', new RegExp(`${name}은 양의 정수`), `${name}=${bad}`);
    }
  }
});
