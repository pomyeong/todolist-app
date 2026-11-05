// ai-playbook.md 부록의 파일 블록을 꺼내 원본 파일과 같은지 확인한다(부트스트랩 재현성).
// 사용: node guide/playbook-src/build.mjs && node guide/playbook-src/verify.mjs
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const md = readFileSync(join(repo, 'guide/ai-playbook.md'), 'utf8');
// #### `경로` (+ 설명 한 줄) + ````lang … ````
const re = /#### `([^`]+)`\n(?:\n(?!````)[^\n]+\n)?\n````[a-z]*\n([\s\S]*?)\n````\n/g;
const templated = {
  'CLAUDE.md': 'guide/playbook-src/claude-template.md',
  'prompts/PRD.txt': 'guide/playbook-src/PRD.txt',
  'guide/extract.mjs': 'guide/playbook-src/extract.mjs',
};
let total = 0;
const diff = [];
for (const [, path, body] of md.matchAll(re)) {
  total++;
  const orig = readFileSync(join(repo, templated[path] ?? path), 'utf8').replace(/\r\n/g, '\n').trimEnd();
  if (orig !== body) diff.push(path);
}
console.log(`블록 ${total}개, 원본과 다름 ${diff.length}개${diff.length ? `: ${diff.join(', ')}` : ''}`);
process.exitCode = diff.length || total === 0 ? 1 : 0;
