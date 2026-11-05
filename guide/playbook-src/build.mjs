// guide/ai-playbook.md 생성: 본문(head.md, body.md) + 부록 A(부트스트랩 파일 원본) + 부록 B(재사용 기반 코드).
// 원본 파일을 바꾼 뒤 `node guide/playbook-src/build.mjs`로 다시 만든다. 부록은 손으로 고치지 않는다.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '..', '..');
const read = (p) => readFileSync(join(repo, p), 'utf8').replace(/\r\n/g, '\n').trimEnd();
const lang = (p) =>
  ({ md: 'markdown', json: 'json', js: 'js', mjs: 'js', ts: 'ts', tsx: 'tsx', css: 'css', html: 'html', txt: 'text', sql: 'sql' })[
    p.split('.').pop()
  ] ?? 'text';
// 원본 안에 ``` 가 있어도 깨지지 않게 네 개짜리 울타리를 쓴다
const block = (path, body, note) =>
  `#### \`${path}\`${note ? `\n\n${note}` : ''}\n\n\`\`\`\`${lang(path)}\n${body}\n\`\`\`\`\n`;
const file = (path, note, from = path) => block(path, read(from), note);

const A = [
  ['CLAUDE.md', '`<앱 이름>`을 APP으로 바꾼다. 문서 목록 순서가 곧 우선순위다.', 'guide/playbook-src/claude-template.md'],
  ['.claude/skills/develop-backend/SKILL.md'],
  ['.claude/skills/develop-frontend/SKILL.md'],
  ['.claude/agents/business-analyst.md'],
  ['.claude/agents/document-engineer.md'],
  ['.claude/agents/technical-writer.md'],
  ['.claude/agents/api-designer.md'],
  ['.claude/agents/backend-expert.md'],
  ['.claude/agents/frontend-expert.md'],
  ['.claude/agents/ui-designer.md'],
  ['.claude/agents/security-auditor.md'],
  ['.mcp.json', 'context7(라이브러리 문서)·playwright·chrome-devtools(브라우저 점검)·postgresql(DB 조회)은 필수, supabase·webpixels는 선택.'],
  ['.claude/settings.local.json', '켤 MCP 서버 목록. 선택 서버는 빼도 된다.'],
  ['biome.json', '루트 하나를 백엔드·프론트가 공유한다.'],
  ['.gitignore', '`.env*`는 무시하고 `.env.example`과 `frontend/.env.development`(비밀값 없음)만 커밋한다.'],
  ['prompts/PRD.txt', '4장 단계 2에서 `<…>`를 입력 시트로 채운다.', 'guide/playbook-src/PRD.txt'],
  ['backend/package.json', '`name`의 todolist만 SLUG로 바꾼다. 버전은 이 프로젝트에서 검증한 값.'],
  ['backend/.env.example', '이 파일을 복사해 `.env`·`.env.test`를 만든다(2.2-5).'],
  ['frontend/package.json'],
  ['frontend/tsconfig.json'],
  ['frontend/vite.config.ts', '포트 5173은 백엔드 `CORS_ORIGIN` 기본값과 같아야 한다.'],
  ['frontend/.env.development'],
];

const B = [
  ['backend/src/config.js', '환경변수 단일 입구. 그대로 쓴다.'],
  ['backend/src/db.js', 'pg Pool, DATE를 문자열로 받기, 트랜잭션 헬퍼. 그대로 쓴다.'],
  ['backend/src/errors.js', '오류 코드 상수와 AppError. **바꿀 곳**: `ERROR` 목록을 새 앱의 오류 코드(NFR)로.'],
  ['backend/src/middleware/error.js', '오류 응답 형식 한 곳. 그대로 쓴다.'],
  ['backend/src/middleware/cors.js', '허용 출처 하나만. 그대로 쓴다.'],
  ['backend/src/middleware/auth.js', 'access 토큰 쿠키 검증. 토큰 발급·갱신(`services/auth.js`)은 사용자 테이블 구조에 맞춰 새로 작성.'],
  ['backend/src/app.js', '앱 조립·헬스 체크·개발 환경 Swagger UI. **바꿀 곳**: `<title>`.'],
  ['backend/src/server.js', '그대로 쓴다.'],
  ['backend/src/routes/index.js', '인증 경계. **바꿀 곳**: 하위 라우터 목록.'],
  ['backend/scripts/db-init.js', '`docs/schema.sql` 적용. **바꿀 곳**: `--reset`의 `DROP TABLE` 목록(자식 테이블부터).'],
  ['backend/test/helpers/index.js', 'API 통합 테스트 헬퍼(쿠키 저장 클라이언트). **바꿀 곳**: `resetDb`의 `TRUNCATE` 목록, `signupUser`의 가입 본문.'],
  ['frontend/index.html', '첫 화면 전 화면 모드 적용 스크립트 포함. **바꿀 곳**: `<title>`.'],
  ['frontend/src/main.tsx', '쿼리 클라이언트·라우터·전역 CSS 연결. 그대로 쓴다.'],
  ['frontend/src/api/client.ts', 'fetch 래퍼(401 시 refresh 1회 후 재요청, CORS 쿠키). 그대로 쓴다.'],
  ['frontend/src/app/RequireAuth.tsx', '인증 가드. 그대로 쓴다(`features/auth` 스토어·훅은 새로 작성).'],
  ['frontend/src/lib/theme.ts', '화면 모드 판정(순수 함수). 그대로 쓴다.'],
  ['frontend/src/lib/themeStore.ts', '화면 모드 저장·적용. 그대로 쓴다.'],
  ['frontend/src/i18n/messages.ts', '언어 목록·사전·서버 문구 번역·언어 판별. **바꿀 곳**: 사전 키·문구는 새 앱 화면 문구로, `SERVER` 표는 새 서버 오류 문구로(ko 사전이 기준 타입이라 ja·en 키가 빠지면 타입 오류). `LANGS`·`translateMessage`·`detectLang`은 그대로.'],
  ['frontend/src/i18n/index.ts', '언어 스토어·`useT`. **바꿀 곳**: `useCategoryLabel`은 TodoList 전용이라 지운다.'],
  ['frontend/src/components/LanguageSelect.tsx', '그대로 쓴다.'],
  ['frontend/src/components/ThemeSelect.tsx', '그대로 쓴다.'],
  ['frontend/src/components/FormError.tsx', '폼·화면 상단 오류. 서버 문구를 선택한 언어로 표시. 그대로 쓴다.'],
  ['frontend/src/components/FormError.module.css'],
  ['frontend/src/components/FieldError.tsx', '입력란 옆 오류(같은 묶음 입력란 테두리를 빨강으로 바꾸는 표식 포함). 그대로 쓴다.'],
  ['frontend/src/components/FieldError.module.css'],
  ['frontend/src/styles/global.css', '디자인 토큰(밝은·어두운)·기본 요소·상태 칩. **바꿀 곳**: 색 값은 새 스타일 가이드 2장, 상태색(`--st-*`)은 새 앱의 상태에 맞춘다.'],
];

// 본문 2.2-3에 추출 스크립트를 넣는다(새 폴더에서 AI가 이것만 옮겨 적으면 부록은 읽지 않아도 된다)
const head = read('guide/playbook-src/head.md').replace('{{EXTRACT}}', () =>
  file('guide/extract.mjs', '', 'guide/playbook-src/extract.mjs'),
);
const body = read('guide/playbook-src/body.md');
const out = [
  head,
  '',
  body,
  '',
  '---',
  '',
  '## 부록 A. 부트스트랩 파일 원본 (2.2-3에서 그대로 만든다)',
  '',
  ...A.map(([p, note, from]) => file(p, note, from)),
  '## 부록 B. 재사용 기반 코드 (구현 단계 11·12의 출발점)',
  '',
  '> TodoList에서 도메인과 무관하게 쓰인 파일들이다. 주석의 규칙 ID(PR-…, P-…)는 TodoList 문서 기준이므로 새 문서 ID로 바꾼다. 이모지 규칙, 캘린더, 할일·카테고리 같은 도메인 코드는 넣지 않았다 — 필요하면 TodoList 저장소에서 가져온다.',
  '',
  ...B.map(([p, note]) => file(p, note)),
].join('\n');

writeFileSync(join(repo, 'guide/ai-playbook.md'), `${out.trimEnd()}\n`);
console.log(`ai-playbook.md: ${out.length} chars, 부록 A ${A.length}개, 부록 B ${B.length}개`);
