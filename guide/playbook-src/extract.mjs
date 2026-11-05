// ai-playbook.md 부록 A(또는 B)의 파일 블록을 프로젝트 루트에 만든다. 부록을 AI가 읽지 않아도 되게 한다.
// 사용(프로젝트 루트에서): node guide/extract.mjs <A|B> <APP> <SLUG>   예) node guide/extract.mjs A 가계부 budget
// 이미 있는 파일은 건너뛴다(덮어쓰지 않음). 치환: todolist→SLUG, TodoList·<앱 이름>→APP.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const [part, app, slug] = process.argv.slice(2);
if (!/^[AB]$/.test(part ?? '') || !app || !/^[a-z][a-z0-9]*$/.test(slug ?? '')) {
  console.error('사용: node guide/extract.mjs <A|B> <APP> <SLUG(영문 소문자·숫자)>');
  process.exit(1);
}
const md = readFileSync(new URL('./ai-playbook.md', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const start = md.indexOf(`\n## 부록 ${part}.`);
const end = part === 'A' ? md.indexOf('\n## 부록 B.') : md.length;
const re = /#### `([^`]+)`\n(?:\n(?!````)[^\n]+\n)?\n````[a-z]*\n([\s\S]*?)\n````\n/g;
let made = 0;
let total = 0;
for (const [, path, body] of md.slice(start, end).matchAll(re)) {
  total++;
  if (existsSync(path)) {
    console.log(`있음, 건너뜀: ${path}`);
    continue;
  }
  mkdirSync(dirname(path), { recursive: true });
  const text = body.replaceAll('todolist', slug).replaceAll('TodoList', app).replaceAll('<앱 이름>', app);
  writeFileSync(path, `${text}\n`);
  made++;
  console.log(`생성: ${path}`);
}
console.log(`부록 ${part}: 블록 ${total}개 중 ${made}개 생성`);
if (total === 0) process.exitCode = 1;
