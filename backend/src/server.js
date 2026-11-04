import { createApp } from './app.js';
import { config } from './config.js';
import { close } from './db.js';

const server = createApp().listen(config.port, () => {
  console.log(`서버 시작: http://localhost:${config.port}`);
});

// PR-S-09: 종료 시 풀을 닫는다.
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(() => close().then(() => process.exit(0)));
  });
}
