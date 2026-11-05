# AI 협업 웹앱 개발 플레이북 (문서 우선 · 1인 + AI)

> 새 프로젝트 폴더에서 이 파일 하나를 AI(Claude Code)에 읽히면, 개발 환경(에이전트·스킬·MCP·설정·DB·패키지)을 만들고 설계 문서 9종 → 구현 → 검증까지 단계별로 진행한다.
> 출처: TodoList 앱(2026-11) 실제 진행에서 검증한 방식. 진행 기록은 `tutorial.md`. 부록 A·B는 그 프로젝트의 실제 파일 원본이다(`guide/playbook-src/build.mjs`로 생성).
>
> **AI가 읽는 법(컨텍스트 절약)**: 이 파일은 약 98KB다. 본문(0~10장, `## 부록 A` 앞까지, 약 27KB)만 읽는다. 부록은 읽지 않고 2.2-3의 추출 스크립트로 파일을 만든다. 부록 B의 특정 파일이 필요하면 그 경로 제목(예: `#### ` + 백틱 경로)을 grep해 그 블록만 읽는다. `@guide/ai-playbook.md`처럼 @로 붙이면 전체가 들어가므로 쓰지 않는다.

---

## 0. 사용법 — 사람이 할 일은 이것뿐

1. **준비물 설치**: 1장 표를 보고 설치·확인한다(한 번만).
2. **새 폴더 + 이 파일**: 빈 폴더를 만들고 이 파일을 `guide/ai-playbook.md`로 복사한 뒤 그 폴더에서 Claude Code를 연다.
3. **첫 프롬프트**(부트스트랩, 2장):
   ```text
   guide/ai-playbook.md 를 부록 앞까지만 읽고 2장 부트스트랩을 실행해줘.
   앱 이름: <예: 가계부>, 슬러그: <예: budget>, PostgreSQL 사용자/비밀번호: <예: postgres / ****>
   ```
4. **Claude Code 재시작** → MCP 서버 사용 승인(2.4).
5. **설계 시작 프롬프트**(4장):
   ```text
   guide/ai-playbook.md 를 부록 앞까지만 읽고 4장 단계 1부터 진행해줘. 입력 시트는 아래와 같아.
   <5장 입력 시트를 채워 붙여넣기>
   ```
6. 이후 AI가 단계마다 산출물 요약과 결정이 필요한 질문을 보여주고 멈춘다(게이트). 확인하면 `다음`이라고만 답한다. 게이트 없이 끝까지 가려면 `자동 진행`이라고 말한다.
7. 커밋·푸시는 원할 때 `커밋해줘` / `푸시해줘`.

## 1. 준비물 (사람이 설치, AI가 2.2에서 확인)

| 항목 | 버전 | 확인 명령 | 비고 |
|---|---|---|---|
| Node.js | 22 이상 | `node -v` | npm 포함 |
| PostgreSQL | 17 | 2.2-5에서 Node로 접속해 확인 | 서비스 실행 중, 슈퍼유저 비밀번호를 알 것. Windows는 설치해도 `psql`이 PATH에 없는 경우가 많아 `psql`에 의존하지 않는다 |
| Git | 최신 | `git --version` | Windows는 Git Bash 포함 |
| Chrome | 최신 | `"C:/Program Files/Google/Chrome/Application/chrome.exe" --version` (Windows) | 브라우저 점검(Playwright가 이 실행 파일을 씀) |
| Claude Code | 최신 | `claude --version` | 프로젝트 폴더에서 실행 |
| GitHub CLI(선택) | 최신 | `gh --version` | 원격 저장소·푸시 |

## 2. 부트스트랩 (AI가 실행)

### 2.1 입력값
- `APP`: 화면에 보일 앱 이름(예: 가계부). `SLUG`: 영문 소문자·하이픈 없는 이름(예: budget) — DB·패키지·쿠키 등에 쓴다.
- `DB_USER`, `DB_PASSWORD`: PostgreSQL 접속 정보. 모르면 사용자에게 묻는다(추측 금지).

### 2.2 실행 순서 (각 단계 결과를 짧게 보고)
1. **준비물 확인**: 1장 확인 명령을 실행해 버전을 표로 보고한다. 빠진 것이 있으면 멈추고 설치를 요청한다.
2. **저장소**: `git init`(이미 있으면 생략). 폴더는 3단계 스크립트가 만든다(`docs/wireframe`만 직접 만든다).
3. **파일 생성**: 아래 추출 스크립트를 `guide/extract.mjs`로 **그대로** 만들고 실행한다. 부록 A 파일 22개가 표시된 경로에 생긴다(이미 있는 파일은 건너뜀).
   ```bash
   node guide/extract.mjs A "<APP>" <SLUG>
   ```
   - 치환은 `todolist` → `SLUG`, `TodoList`·`<앱 이름>` → `APP`뿐이다. 부록을 손으로 옮겨 적지 않는다(옮기다 틀리는 것을 막는다).
   - `prompts/PRD.txt`는 4장 단계 2에서 입력 시트로 채운다.
   - 출력 끝이 `블록 22개 중 22개 생성`이 아니면 멈추고 보고한다.

#### `guide/extract.mjs`

````js
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
````

4. **패키지 설치**: `cd backend && npm install`, `cd frontend && npm install`(각 1~3분). 실패하면 오류 원문을 보고한다. 네트워크·프록시 문제면 사용자에게 알리고 멈춘다. `bcrypt` 설치 스크립트 경고는 무시한다(10장).
5. **DB 생성**: `backend`에서 실행한다(설치된 `pg` 사용, `psql` 불필요). 이미 있으면 그대로 두고 지우지 않는다. 비밀번호에 `@ : / #` 등이 있으면 URL 인코딩한다.
   ```bash
   cd backend && node -e 'const{Client}=require("pg");const[u,...d]=process.argv.slice(1);(async()=>{const c=new Client({connectionString:u});await c.connect();for(const n of d){const r=await c.query("SELECT 1 FROM pg_database WHERE datname=$1",[n]);if(!r.rowCount)await c.query(`CREATE DATABASE "${n}"`);console.log(r.rowCount?"있음":"생성",n)}await c.end()})().catch(e=>{console.error(e.code,e.message);process.exit(1)})' "postgresql://<DB_USER>:<DB_PASSWORD>@localhost:5432/postgres" <SLUG> <SLUG>_test
   ```
   - 오류는 맨 앞 코드로 판단한다(한국어 Windows의 PostgreSQL은 메시지가 깨져 보일 수 있다). `28P01` → 비밀번호가 틀림, 사용자에게 다시 묻는다. `ECONNREFUSED` → PostgreSQL 서비스가 꺼져 있다(Windows 서비스 `postgresql-x64-17`). `3D000`·`28000` → 사용자 이름 확인. 추측으로 재시도하지 않는다.
6. **환경 파일**(커밋하지 않음):
   - `backend/.env`: `.env.example`을 복사하고 `DATABASE_URL=postgresql://<DB_USER>:<DB_PASSWORD>@localhost:5432/<SLUG>`, `JWT_SECRET=` 에 `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` 결과.
   - `backend/.env.test`: 같은 내용에서 DB만 `<SLUG>_test`.
7. **확인**: `cd backend && npx biome --version`, `git status`(`.env`·`.env.test`가 목록에 없어야 함), 5단계 명령을 다시 실행해 두 DB가 `있음`으로 나오는지.
8. **첫 커밋**: `chore: 부트스트랩 — 에이전트·스킬·MCP·설정·패키지 (ai-playbook 2장)`.
9. **안내**: 사용자에게 2.4(재시작·MCP 승인)와 0장 5번 프롬프트를 알려주고 멈춘다.

### 2.3 부트스트랩 완료 기준
- [ ] 추출 스크립트 출력이 `블록 22개 중 22개 생성`(손으로 고친 파일 없음)
- [ ] DB `<SLUG>`, `<SLUG>_test` 존재, `.env`·`.env.test` 생성·미추적
- [ ] backend·frontend `npm install` 성공, biome 실행됨
- [ ] 첫 커밋 완료

### 2.4 Claude Code 재시작과 MCP 승인 (사람)
- `.mcp.json`은 세션 시작 때만 읽힌다. Claude Code를 종료하고 같은 폴더에서 다시 연다.
- `.claude/settings.local.json`의 `enabledMcpjsonServers`에 적힌 서버만 켜진다(승인 창이 뜨면 승인). 필요 없는 서버(supabase, webpixels)는 목록에서 빼도 된다.
- 확인: `/mcp` → context7·playwright·chrome-devtools·postgresql이 connected. 서버는 처음 쓸 때 `npx`로 내려받으므로 첫 연결에 수십 초 걸릴 수 있다.
- **failed일 때**: `/mcp`에서 그 서버를 다시 연결 → 그래도 안 되면 터미널에서 명령을 직접 실행해 오류를 본다(예: `npx -y @playwright/mcp@latest --help`). 흔한 원인은 사내 프록시·npm 레지스트리 차단, 오래된 Node.
- **MCP 없이도 진행된다**: 필수 단계는 MCP에 의존하지 않는다. context7 대신 설치된 패키지의 타입·README, playwright·chrome-devtools 대신 `playwright-core` + 로컬 Chrome 스크립트(9.2), postgresql 대신 `node -e` + `pg`로 한다. 대체했으면 보고에 적는다.

## 3. AI 작업 규칙 (항상 지킨다)

1. **응답 언어**: 사용자가 정한 언어(기본 한국어). 코드 식별자·기술 용어는 원어.
2. **오버엔지니어링 금지·스택 고정**: 요청 범위만 한다. PRD 6장 기술 스택과 구조 원칙(레이어·디렉토리)만 쓴다. 몇 줄로 되면 라이브러리를 추가하지 않는다. 스택 변경·의존성 추가는 사용자 승인 후 구조 원칙 문서(PD)에 이유를 적고 한다.
3. **문서 우선**: 기능·규칙·화면·데이터가 바뀌면 코드보다 문서를 먼저 고친다.
4. **문서 우선순위**(충돌 시 위쪽이 이김): 도메인 정의서 > PRD > 사용자 시나리오 > 와이어프레임 > 스타일 가이드 > 프로젝트 구조 원칙 > 아키텍처 > ERD(+DDL) > 실행 계획 > API 명세. 하위 문서가 상위와 다르면 하위를 고친다.
5. **단일 출처**: 규칙은 한 문서에만 쓰고 나머지는 ID로 참조한다. 코드에서도 상수·토큰·사전 한 곳.
6. **변경 이력**: 문서를 고칠 때마다 버전을 올리고 두 표에 한 줄씩 추가한다(6장 형식). API 명세의 근거 문서 버전표도 맞춘다. 완료된 Task 기록은 지우지 않고 `(v0.x: 이후 결정 …)` 주석을 단다.
7. **테스트**: 분기·계산이 있는 로직은 순수 함수로 빼고 단위 테스트. API는 실제 앱 + 테스트 DB로 통합 테스트(mock 금지). 화면은 Playwright로 실제 확인.
8. **보고**: 결과를 사실대로(통과·실패 수, 확인 못 한 것). 추측으로 완료라 하지 않는다.
9. **git**: 사용자가 "커밋"·"푸시"라고 할 때만(부트스트랩 첫 커밋은 예외). 메시지에 관련 ID(T-xx, P-xx, BR-xx). 사용자가 직접 고친 파일은 별도 커밋.
10. **되돌리기 어려운 작업**(DB 리셋, 삭제, 강제 푸시)은 먼저 확인. 개발 DB 스키마 변경은 데이터를 지키는 `ALTER`를 우선하고 README에 절차를 남긴다.
11. **게이트**: 4장 각 단계 끝에 ① 산출물 요약 ② 내가 정한 가정 ③ 사용자가 결정해야 할 질문(있을 때만, 선택지와 추천 포함)을 보이고 `다음`을 기다린다. 사용자가 `자동 진행`이라 하면 질문은 추천안으로 정하고 결정 표에 '가정'으로 남긴 채 계속한다.
12. **기반 코드**: 구현 단계에서 부록 B를 출발점으로 쓴다. 표시된 '바꿀 곳'만 앱에 맞게 고치고 나머지 구조·주석의 규칙 ID는 새 문서 ID에 맞춰 갱신한다.

## 4. 단계별 실행 (프롬프트 · 산출물 · 통과 기준)

각 단계는 "초안 → 셀프 품질 평가(개선 Top 5) → 반영 → 상위 문서와 정합성 점검 → 게이트" 순으로 한다. 설계 단계는 관련 서브에이전트(부록 A)를 쓴다.

| 단계 | 사용자 프롬프트(게이트 뒤 `다음`이면 생략 가능) | 산출물 | 통과 기준 |
|---|---|---|---|
| 1 도메인 | `입력 시트로 도메인 정의서를 작성해줘` | `docs/1-domain-definition.md` | 용어·엔티티·상태(ST)·BR·UC에 ID, 미결 사항 목록 |
| 2 PRD | `prompts/PRD.txt를 입력 시트로 채우고 PRD를 작성해줘` | `prompts/PRD.txt`, `docs/2-PRD.md` | FR 우선순위·수용 기준, 화면 SCR, NFR, 애매한 것은 P-xx 결정 |
| 3 시나리오 | `사용자 시나리오를 작성해줘` | `docs/3-user-scenario.md` | 고정 기준 날짜·예시 데이터, SC·대안·예외(응답 코드), FR→SC 100% |
| 4 와이어프레임 | `와이어프레임을 작성해줘` | `docs/4-wireframe.md` | 데스크톱·모바일 360px, 빈·오류·처리 중 상태, 배치 결정 L-xx |
| 5 구조 원칙 | `프로젝트 구조 설계 원칙을 작성해줘` | `docs/5-project-principle.md` | 8장 기본값 반영, 디렉토리 트리, API 경로 표 |
| 6 아키텍처 | `기술 아키텍처 다이어그램을 작성해줘` | `docs/6-arch-diagram.md` | 시스템·레이어·핵심 시퀀스(mermaid) |
| 7 ERD·DDL | `ERD와 schema.sql을 작성해줘` | `docs/7-erd.md`, `docs/schema.sql` | 속성↔컬럼↔API 대응표, 제약·인덱스 근거 |
| 8 실행 계획 | `실행 계획(WBS)을 작성해줘` | `docs/8-plan.md` | Task ID·선행·근거·완료 조건 체크박스, 크리티컬 패스, 2.3 진행 현황 |
| 9 API 명세 | `REST API 명세를 작성해줘` | `backend/swagger.yaml` | 모든 경로·오류 코드·예시, 근거 문서 버전표 |
| 10 스타일 가이드 | `(참고 이미지 첨부) 스타일 가이드를 작성해줘` | `docs/style-guide.md` | 토큰(밝은·어두운), 상태색 대비, 컴포넌트 규칙 |
| 11 백엔드 | `실행 계획 순서대로 T-CM·T-DB·T-BE Task를 /develop-backend로 진행해줘` | `backend/` | Task 완료 조건 체크, `npm test` 통과 |
| 12 프론트 | `/develop-frontend FE-01 ~ FE-xx 까지 선후행 작업을 고려해서 순서대로 에러없이 작업해줘` | `frontend/` | `tsc -b`·`vitest run` 통과, 스타일 가이드 적용 |
| 13 검증 | `T-QA Task(반응형·브라우저, 시나리오 셀프 체크)를 진행해줘` | README 검증 기록 | 9.2 체크리스트 |
| 14 점검 | `선행 테스크를 고려하여 모든 테스크가 에러없이 개발되었는지 확인하고, 코드 기준으로 docs와 swagger를 현행화해줘` | 실행 계획 2.3, 문서 동기화 | 완료 조건 전부 체크, 문서·코드 일치 |

- 단계 10은 와이어프레임 뒤 아무 때나 해도 된다(구현 전 권장).
- 단계 11·12에서 부록 B 기반 코드를 먼저 놓고 시작하면 T-BE-02~07, T-FE-02·04의 대부분이 끝난다.
- 기능 추가는 언제나: `<기능>을 추가해줘` → AI가 영향 문서 목록 → 위쪽 문서부터 수정(이력) → 코드 → 테스트 → 브라우저 → 보고.

### 4.1 자주 쓰는 프롬프트
- `작성한 문서를 품질 평가해서 개선 사항 Top 5를 뽑고 반영해줘. 상위 문서와 충돌하는 곳도 같이 고쳐줘.`
- `@docs/8-plan.md 에서 2장 Task 요약을 선후공정을 고려해 개발 순서와 개발 여부로 정리해 2.3에 추가해줘`
- `사용자 시나리오를 기반으로 백엔드 API에 대한 테스트를 수행해줘` (curl 버전: `curl 명령 기반으로`)
- `지금까지 변경한 문서를 기반으로 개발해 놓은 테스크에 반영되었는지 점검`
- `모바일 화면도 스타일 가이드 적용됐는지 점검해줘`
- `프런트엔드 화면 띄워줘` / `백엔드를 백그라운드로 실행해줘`

## 5. 프로젝트 입력 시트

```text
# 제품
- 한 줄 설명:
- 핵심 엔티티(명사):            예) 사용자, 할일, 카테고리
- 핵심 행동(동사):              예) 등록, 완료, 필터, 캘린더 보기
- 범위 외(하지 않을 것):

# 비즈니스
- 목표 사용자:
- 비즈니스 목표/지표:
- 일정 / 팀 / 예산:              예) 2일 / 1인 / 1인 수준

# 기술 제약 (기본값을 바꿀 때만 적는다)
- 플랫폼: 웹 우선, 모바일은 반응형
- 프론트: React 19 + TypeScript + Zustand + TanStack Query (+ Vite, CSS Modules)
- 백엔드: Node.js + JavaScript + Express 5 + pg (ORM 금지)
- DB: PostgreSQL 17
- 인증: JWT access(짧게) + refresh 토큰(DB 해시, 회전), httpOnly 쿠키
- 배포: 범위 외(로컬 단일 머신)

# UX
- 접근성 범위:
- 다국어(ko/ja/en)·화면 모드(시스템/주간/다크) 필요 여부: 기본 포함
- 참고 디자인(캡처·URL):
```

## 6. 문서 공통 형식

### 6.1 머리말 (모든 문서)

```markdown
# <제목>

## 문서 이력

### 버전 이력
| 버전 | 일자 | 작성자 | 상태 | 비고 |
|---|---|---|---|---|
| v0.1 | YYYY-MM-DD | 이름 | 초안 | 최초 작성 |

### 변경 이력
| 버전 | 일자 | 변경 위치 | 변경 내용 | 변경 사유 | 작성자 |
|---|---|---|---|---|---|

> 단일 출처 원칙: 용어·엔티티·ST·BR·UC는 도메인, FR·SCR·NFR·P는 PRD, SC는 시나리오, WF·L은 와이어프레임, PR·PD는 구조 원칙, DB-xx는 ERD가 정의한다. 이 문서는 ID를 참조만 한다. 충돌 시 <우선순위>를 따른다.
```

### 6.2 ID 체계

| 접두사 | 뜻 | 문서 |
|---|---|---|
| ST-xx | 상태(파생값) | 도메인 |
| BR-xx | 비즈니스 규칙 | 도메인 |
| UC-xx | 유스케이스 | 도메인 |
| G·M·R | 목표·마일스톤·리스크 | PRD |
| FR-xx / NFR-xx | 기능 / 비기능 요구사항 | PRD |
| SCR-xx | 화면 | PRD |
| P-xx | 제품 결정 | PRD |
| SC-xx / E-xx / A-xx | 시나리오 / 예외 / 대안 흐름 | 시나리오 |
| WF-xx / L-xx | 와이어프레임 / 배치 결정 | 와이어프레임 |
| SG-xx | 스타일 원칙 | 스타일 가이드 |
| PR-C/L/N/T/S-xx / PD-xx | 구조 원칙 / 구조 결정 | 구조 원칙 |
| AD-xx / SD-xx | 구조 / 시퀀스 다이어그램 | 아키텍처 |
| ERD-xx / DB-xx | ERD 그림 / DB 결정 | ERD |
| T-CM/DB/BE/FE/QA-xx | Task | 실행 계획 |

ID는 재사용·재번호하지 않는다. 없애면 행을 지우지 말고 '폐기(v0.x): 이유'로 표시한다.

### 6.3 결정 표 형식 (P-xx, PD-xx, DB-xx, L-xx 공통)

```markdown
| ID | 결정 내용 | 구분 | 근거(사용자 결정이면 버전) | (대안·기각 이유) |
```

## 7. 문서 템플릿 (섹션 골격)

**1-domain-definition.md**: 1 개요(목적, 해결할 문제) · 2 유비쿼터스 언어(용어 | 영문 | 정의) · 3 엔티티·속성(속성 | 필수 | 설명)·관계(mermaid erDiagram) · 4 상태 정의(ST | 우선순위 | 이름 | 판정식) · 5 비즈니스 규칙(BR | 대상 | 규칙) · 6 유스케이스(UC | 액터 | 흐름) · 7 미결 사항/가정.

**2-PRD.md**: 1 개요(비전, 대상) · 2 목표와 지표(G, 검증 방법) · 3 범위(포함/제외, 과설계 금지 목록) · 4 기능 요구사항(머리말: 오류 표시 위치·처리 중 상태 / FR 표: ID | 이름 | 우선순위 | 관련 ID | 수용 기준(성공·실패)) · 4.2 화면(SCR | 이름 | 주요 구성 | FR) · 5 비기능(NFR) · 6 기술 스택·제약 · 7 일정(M) · 8 리스크(R) · 9 결정(P).

**3-user-scenario.md**: 1 개요 · 2 시나리오 목록(SC | 이름 | UC | FR | 우선순위) · 3 상세(3.0 공통 전제: 기준 날짜, 예시 데이터, 공통 예외 E-C1~3 / SC별: 사전 조건, 단계 표(행동·시스템 반응·화면), 대안 A-xx, 예외 E-xx(조건 | 응답 코드 | 결과), 사후 조건, 관련 ID) · 4 추적성(UC→SC, FR→SC, 커버리지).

**4-wireframe.md**: 1 개요(저충실도, 표기 규칙) · 2 화면 흐름도(mermaid) · 3 WF별 ASCII(데스크톱·모바일) + 구성 요소 표(요소 | FR/BR/SC | 우선순위) · 처리 중·오류·빈 상태 · 4 추적성 · 5 배치 결정(L).

**5-project-principle.md**: 1 개요 · 2 공통 원칙(PR-C) · 3 레이어(PR-L) · 4 네이밍(PR-N) · 5 테스트(PR-T) · 6 설정·보안(PR-S) · 7 디렉토리 구조(트리 + 모듈 표 + API 경로 표 7.2 + 실행 순서) · 8 결정(PD) · 커버리지.

**6-arch-diagram.md**: 1 개요(다이어그램 목록) · 2 구조(AD-01 시스템, AD-02 백엔드 레이어, 프론트 구조) · 3 시퀀스(SD) · 4 커버리지.

**7-erd.md**: 1 개요 · 2 개념 ERD · 3 물리 ERD · 4 테이블 명세(컬럼 | 타입 | NULL | 기본값 | 제약 | 도메인 속성 | 근거) · 5 제약·인덱스(이름 | 테이블 | 종류 | 정의 | 용도) · 6 파생값(저장 안 함) · 7 속성↔컬럼↔API 대응표 · 8 결정(DB).

**8-plan.md**: 1 개요 · 2 Task 요약(ID | Task | 영역 | 우선순위 | 마일스톤 | 선행) + 2.1 크리티컬 패스 + 2.2 마일스톤 + 2.3 개발 순서와 진행 현황 · 3~7 영역별 Task 상세(근거, 작업 내용, `- [ ]` 완료 조건) · 8 커버리지.

**style-guide.md**: 1 원칙(SG) · 2 색(토큰 표, 상태색 쌍과 대비, 어두운 모드 토큰) · 3 글꼴 · 4 간격·모서리·선·그림자 · 5 컴포넌트(버튼, 세그먼트, 입력, 칩, 내비, 캘린더, 목록, 피드백) · 6 반응형 · 7 코드 적용 현황.

## 8. 기술 기본값과 코드 규칙 (검증된 선택)

### 백엔드 (Node + Express 5 + pg)
- 구조: `src/config.js`(환경변수 단일 입구, 잘못되면 기동 중단) · `db.js`(Pool, DATE OID 1082는 문자열 그대로) · `app.js`(조립) · `middleware/`(cors, auth, error) · `routes/`(HTTP 입출력만) · `services/`(SQL) · `domain/`(순수 함수: 검증, 상태 판정).
- 오류 형식 하나: `{ error: { code, message, fields? } }`, `AppError`를 던지고 오류 미들웨어 한 곳에서 응답. 500은 상세 비노출.
- 소유권: 모든 SQL에 `user_id = $n`, 남의 데이터는 404.
- 날짜 `'YYYY-MM-DD'`, 시각 `'HH:MM'` 문자열로 주고받기(시간대 밀림 방지). 상태 같은 파생값은 요청의 `today`로 계산하고 저장하지 않는다.
- 인증: access JWT(HS384, `sub`만) + refresh 불투명 토큰(SHA-256 해시 저장, 갱신 시 회전), httpOnly·`SameSite=Lax` 쿠키, 만료는 환경변수 기본값.
- CORS: 허용 출처 하나(`CORS_ORIGIN`), `credentials: true`, preflight 204. 몇 줄 미들웨어(패키지 불필요).
- 헬스 체크 `GET /api/health`(`SELECT 1`, 200/503). 개발 환경만 Swagger UI `/api/docs`(CDN).
- 스키마: `docs/schema.sql` 단일 출처 + `scripts/db-init.js --reset`. 마이그레이션 도구 없음. 운영 데이터가 생기면 README에 `ALTER` 절차 기록.
- 테스트: `node:test`, 실제 앱(포트 0) + 테스트 DB, 테스트 이름에 ID(`E-04-2 시작일 > 종료일은 400`).

### 프론트 (React 19 + TS + Vite)
- 구조: `api/`(fetch 래퍼: 401 시 refresh 1회 후 재요청, 오류 → ApiError) · `app/`(라우터, 가드, 레이아웃) · `features/<영역>/`(컴포넌트·훅·스토어, 영역끼리 import 금지) · `pages/` · `components/`(공용) · `lib/`(순수 유틸) · `i18n/` · `styles/global.css`(토큰).
- 상태: 서버 데이터는 TanStack Query, UI 상태는 Zustand, 화면 위치는 URL 쿼리.
- 낙관적 업데이트 없이 저장 성공 후 재조회(단순·정확).
- 스타일: CSS Modules + 전역 토큰(`var(--토큰)`만, 직접 색값 금지). 중단점 768px 하나.
- 다국어: `src/i18n/messages.ts` 사전(ko 기준 타입이라 키 누락 시 타입 오류), `useT()`, 언어는 localStorage + 브라우저 언어. 서버 오류 문구는 화면에서 알려진 문구만 번역.
- 화면 모드: `<html data-theme="light|dark">` + `:root[data-theme="dark"]` 토큰, `color-scheme`, index.html 인라인 스크립트로 첫 화면 전 적용, '시스템'은 `matchMedia` 변경 추적.
- 테스트: Vitest로 순수 함수만(날짜, 캘린더 배치, 검증, 이모지 규칙, 번역). 화면은 Playwright로 실측.

### 공통
- 린트·포맷: 루트 `biome.json` 하나를 공유, `dist` 제외.
- 커밋 메시지: `feat(frontend): … (T-FE-08, P-15)`, 끝에 공동 작성자 줄(도구 규칙에 따름).

## 9. 체크리스트

### 9.1 변경 1건 완료 기준 (DoD)
- [ ] 영향받는 문서를 모두 찾았다(위 우선순위 순, grep으로 옛 문구 검색)
- [ ] 문서 내용 + 버전 이력 + 변경 이력, swagger 근거 문서 버전표까지 맞췄다
- [ ] 분기 있는 로직은 순수 함수 + 단위 테스트
- [ ] 린트·타입 검사·백엔드·프론트 테스트 통과
- [ ] 브라우저 실측: 데스크톱 1280, 모바일 360, 밝은·어두운 모드, 가로 넘침 0
- [ ] DB 스키마가 바뀌면 테스트 DB 재생성, 개발 DB는 데이터 보존 `ALTER` + README 절차
- [ ] 결과 보고(통과 수, 확인 못 한 것, 남은 차이)

### 9.2 검증 단계
- [ ] 브라우저: Chrome·Edge·Firefox·WebKit, 폭 360·767·768·1280
- [ ] 시나리오 SC 전체를 기준 날짜로 고정해 수행(브라우저 시계 고정)
- [ ] 실제 장애: 백엔드 중단, 만료 access 토큰, 만료 refresh 토큰
- [ ] 소유권: 남의 데이터 조회·수정·삭제·지정이 모두 404
- [ ] 결과를 README 검증 기록에 남김

## 10. 함정 목록 (Windows + Git Bash + Node 환경에서 실제로 겪음)

| 함정 | 예방 |
|---|---|
| 문서가 CRLF라 문자열 치환 0회 일치 | 파일 줄바꿈을 감지해 패턴의 `\n`을 맞춘다 |
| JS `replace(a, b)`의 `b`에 `$'`·`$&`가 있으면 특수 해석 | `replace(a, () => b)` |
| `node -e "…"` 안의 백틱·`$`·정규식이 셸에서 깨짐 | 스크립트를 파일로 쓰고 실행 |
| Git Bash에서 curl로 한글 JSON 전송 시 깨짐 | 본문을 UTF-8 파일로 쓰고 `--data-binary @file` |
| `git checkout -- 파일` 후 CRLF로 바뀌어 포매터 실패 | LF로 정규화 |
| 결정을 바꿨는데 다른 문서 문장이 옛 내용으로 남음 | 기능마다 관련 ID를 모든 문서에서 grep |
| 개발 DB `--reset`은 데이터 삭제 | NULL 허용 컬럼 추가는 `ALTER … IF NOT EXISTS` |
| 다른 출처 API에서 쿠키 안 실림 | 같은 사이트 배치 + `SameSite=Lax` + `credentials: 'include'` |
| 캘린더 날짜 계산에 `Date`·`toISOString` 사용 | 날짜는 문자열, 로컬 컴포넌트로만 계산 |
| 화면 모드 전환 시 첫 화면 깜빡임 | index.html 인라인 스크립트로 `data-theme` 선적용 |
| 다크 모드에서 밝은 빨강 버튼 위 흰 글자 | 글자용 색과 채움용 색 토큰 분리(`--danger` / `--danger-fill`) |
| Windows에 PostgreSQL을 깔아도 `psql`이 PATH에 없음 | DB 생성·조회는 `backend`의 `pg`로 `node -e`(2.2-5) |
| `@guide/ai-playbook.md`로 붙이면 약 98KB 전체가 컨텍스트에 들어감 | 경로만 말하고 부록 앞까지 읽게 한다. 부록은 추출 스크립트로 |
| 부록 코드를 AI가 손으로 옮겨 적다 한 글자씩 틀림 | `guide/extract.mjs`로 기계적으로 만든다 |
| 루트에서 `npx biome`을 치면 무관한 `biome` 패키지를 내려받아 실행 | biome은 `backend`(또는 `frontend`)에서 실행한다 |
| npm 11이 `bcrypt` 설치 스크립트 경고(`install-scripts`) | 미리 빌드된 바이너리로 동작한다. 무시(승인 불필요) |
| 한국어 Windows PostgreSQL 오류 메시지가 깨져 보임 | 메시지 대신 오류 코드(`28P01` 등)로 판단 |

---

## 부록 A. 부트스트랩 파일 원본 (2.2-3에서 그대로 만든다)

#### `CLAUDE.md`

`<앱 이름>`을 APP으로 바꾼다. 문서 목록 순서가 곧 우선순위다.

````markdown
# <앱 이름>의 최상위 지침
## 반드시 지켜야 할 지침
- 모든 응답은 한국어로 할 것
- 오버엔지니어링 금지
- 기술 스택·아키텍처 고정: PRD 6장의 스택과 프로젝트 구조 원칙(레이어·디렉토리·API 경로)만 사용한다. 다른 프레임워크·라이브러리로 바꾸거나 의존성을 추가하려면 먼저 사용자 승인을 받고 구조 원칙 8장(PD)에 기록한다.
## 디렉토리 구조
- 백엔드: backend/ · 프론트엔드: frontend/ · 문서: docs/
## 문서 목록
문서끼리 충돌하면 위쪽 문서를 따른다. 코드보다 문서를 먼저 고친다.
| 문서 | 내용 |
|---|---|
| docs/1-domain-definition.md | 도메인 정의서 |
| docs/2-PRD.md | PRD |
| docs/3-user-scenario.md | 사용자 시나리오 |
| docs/4-wireframe.md | 와이어프레임 |
| docs/style-guide.md | 스타일 가이드 |
| docs/5-project-principle.md | 프로젝트 구조 설계 원칙 |
| docs/6-arch-diagram.md | 기술 아키텍처 다이어그램 |
| docs/7-erd.md | ERD |
| docs/schema.sql | DB 스키마 DDL |
| docs/8-plan.md | 실행 계획(WBS) |
| backend/swagger.yaml | REST API 명세 |
````

#### `.claude/skills/develop-backend/SKILL.md`

````markdown
---
name: develop-backend
description: 백엔드 개발을 위한 SKILL
arguments: TASK_NUMBER
disable-model-invocation: true
---

너는 유능한 백엔드 개발자이다. task 번호를 입력받아 문제를 해결한다.

### 작업 내용

- @docs/ 디렉토리의 문서와 docs/8-plan.md 문서의 ${TASK_NUMBER}의 내용을 읽어와 분석한다.
- 기존 코드 분석 : 코드베이스(backend 디렉토리)의 코드를 분석한다.
- 계획 수립 : 독립적인 서브에이전트를 활용해 기존 코드와 문서를 분석한 결과를 바탕으로 문제를 어떻게 해결해나갈지 계획을 수립한다.
- 테스트 작성 : 적절한 서브에이전트를 이용해 수립된 계획을 바탕으로 커버리지 90% 이상의 테스트 케이스를 작성한다.
- 문제 해결 : 적절한 서브에이전트를 이용해 수립된 계획을 바탕으로 백엔드 개발 문제를 해결한다.
- 테스트 작성과 문제 해결은 서브에이전트를 이용해 병렬로 수행한다.
- 테스트 수행 : 적절한 서브에이전트를 적용해 미리 작성한 테스트를 수행한다.
- 테스트가 성공적으로 완료되면 실행 계획 문서의 ${TASK_NUMBER}의 완료 조건 체크박스에 체크표시한다.
- 테스트가 실패하면 문제 해결 단계를 다시 진행한다.
- 완료조건을 충족하지 못할 때 문제해결 재시도는 3회로 제한하고 완료조건 미충족 요건을 보고한다.
- 기술 스택·아키텍처 고정: PRD 6장의 스택과 프로젝트 구조 원칙(레이어·디렉토리)을 벗어나지 않는다. 다른 라이브러리·패턴이 필요하다고 판단되면 구현하지 말고 이유와 함께 사용자에게 먼저 묻는다(승인 시 구조 원칙 8장 PD에 기록).
````

#### `.claude/skills/develop-frontend/SKILL.md`

````markdown
---
name: develop-frontend
description: 단계별 프론트엔드 개발을 위한 사용자 정의 SKILL
arguments: TASK_NUMBER
disable-model-invocation: true
---

너는 유능한 프론트엔드 개발자이다. task 번호 ${TASK_NUMBER}를 입력받아 다음과 같은 단계로 문제를 해결한다.

### 작업 내용

- @docs/ 디렉토리의 문서와 docs/8-plan.md 문서의 ${TASK_NUMBER}의 내용을 읽어와 분석한다.
- 기존 코드 분석 : 코드베이스(frontend 디렉토리)의 코드를 분석한다.
- 계획 수립 : 독립적인 서브에이전트를 활용해 기존 코드와 문서를 분석한 결과를 바탕으로 문제를 어떻게 해결해나갈지 계획을 수립한다.
- 테스트 작성 : 수립된 계획을 바탕으로 커버리지 90% 이상의 테스트 케이스를 작성한다.
- 문제 해결 : 수립된 계획을 바탕으로 프론트엔드 개발에 적합한 서브에이전트를 선택해서 해결한다.
- 테스트 작성과 문제 해결은 서브에이전트를 이용해 병렬로 수행한다.
- 테스트 수행 : 미리 작성한 테스트를 이용해 테스팅한다.
- 테스트가 성공적으로 완료되면 실행 계획 문서의 ${TASK_NUMBER}의 완료 조건 체크박스에 체크표시한다.
- 테스트가 실패하면 문제 해결 단계를 다시 진행한다.
- 완료조건을 충족하지 못할 때 문제해결 재시도는 3회로 제한하고 완료조건 미충족 요건을 보고한다.
- UI 컴포넌트를 개발할 때 반드시 스타일 가이드를 적용하도록 한다.
- 기술 스택·아키텍처 고정: PRD 6장의 스택과 프로젝트 구조 원칙(레이어·디렉토리)을 벗어나지 않는다. 다른 라이브러리·패턴이 필요하다고 판단되면 구현하지 말고 이유와 함께 사용자에게 먼저 묻는다(승인 시 구조 원칙 8장 PD에 기록).
````

#### `.claude/agents/business-analyst.md`

````markdown
---
name: business-analyst
description: "비즈니스 프로세스를 분석하거나, 이해관계자로부터 요구사항을 수집하거나, 운영 효율성과 측정 가능한 비즈니스 가치를 이끌어낼 프로세스 개선 기회를 식별할 때 사용하라."
tools: Read, Write, Edit, Glob, Grep, WebFetch, WebSearch
model: opus
---

# 개요

당신은 비즈니스 요구와 기술 솔루션을 연결하는 시니어 비즈니스 애널리스트다. 요구사항 도출, 프로세스 분석, 이해관계자 관리를 통해 실질적인 비즈니스 성과를 이끄는 것이 목표다.

## 호출되었을 때:

1. 비즈니스 목표, 현재 프로세스, 이해관계자의 니즈를 파악한다
2. 인터뷰/문서 분석으로 요구사항을 수집하고 우선순위를 정한다
3. 현황(as-is) 대비 개선안(to-be)과 갭을 분석한다
4. 추적 가능하고 테스트 가능한 형태로 요구사항을 문서화한다

##체크리스트:

- 요구사항 추적성 유지, 수용 기준(acceptance criteria) 명시
- 프로세스 매핑(현황/개선안), 병목·자동화 기회 식별
- 비용 대비 편익, ROI, 리스크 평가
- 이해관계자 승인 및 우선순위 합의
- 성공 지표(KPI) 정의

## 준수 사항

- 비즈니스 가치와 데이터 기반 의사결정을 항상 최우선한다.
````

#### `.claude/agents/document-engineer.md`

````markdown
---
name: document-engineer
description: "API 문서, 튜토리얼, 가이드 등 코드 변경에 발맞춰 유지되는 개발자 친화적 콘텐츠를 포함한 포괄적인 문서 시스템을 만들거나, 설계하거나, 전면 개편해야 할 때 이 에이전트를 사용하라."
tools: Read, Write, Edit, Glob, Grep, WebFetch, WebSearch
model: sonnet
---

# 개요

당신은 유지보수 가능하고 코드와 동기화되는 문서 시스템을 만드는 시니어 문서 엔지니어다. 정보 아키텍처 설계부터 API 문서 자동화까지, 검색 용이성과 최신성을 중시한다.

## 호출되었을 때:

1. 프로젝트 구조, 기존 문서, 문서 공백을 파악한다
2. 정보 아키텍처(내비게이션, 분류, 상호 참조)를 설계한다
3. OpenAPI 연동 등으로 API 문서를 최대한 자동 생성한다
4. 코드 예제가 실제로 동작하는지 검증하고 링크를 확인한다

## 체크리스트:

- API 문서 커버리지, 동작이 검증된 코드 예제
- 검색 기능, 버전 전환 UI, deprecation 안내
- 페이지 로드 속도, 모바일 반응형, 접근성(WCAG AA)
- 코드 변경 시 문서가 자동으로 갱신되는 파이프라인

## 준수 사항

- 명료성, 유지보수성, 사용자 경험을 항상 최우선하며 개발자가 실제로 찾아 쓰는 문서를 만든다.
````

#### `.claude/agents/technical-writer.md`

````markdown
---
name: technical-writer
description: "API 레퍼런스, 사용자 가이드, SDK 문서, 시작 가이드 등 기술 문서를 작성, 개선, 유지보수해야 할 때 이 에이전트를 사용하라."
tools: Read, Write, Edit, Glob, Grep, WebFetch, WebSearch
model: haiku
---

# 개요

당신은 명료하고 정확한 문서를 작성하는 시니어 기술 문서 작성자다. API 레퍼런스, 사용자 가이드, 튜토리얼을 통해 사용자가 제품을 성공적으로 사용하도록 돕는 것이 목표다.

## 호출되었을 때:

1. 문서화 대상과 대상 독자를 파악한다
2. 기존 문서와 제품 기능을 조사해 콘텐츠 공백을 식별한다
3. 작업 중심(task-based)으로 명확하게 작성하고 예제를 포함한다
4. 기술 정확성을 검증하고 리뷰를 거친다

## 체크리스트:

- 능동태와 간결한 문장, 일관된 용어
- 동작이 검증된 코드 예제, 에러/트러블슈팅 안내
- 논리적인 정보 구조와 내비게이션
- 접근성과 검색 최적화 고려

## 준수 사항

- API 문서는 실제 요청/응답 예제와 인증 방법을 포함해야 하며, 사용자 가이드는 단계별 지침과 흔한 시나리오를 다뤄야 한다.
- 명료성과 정확성, 사용자의 성공을 항상 최우선한다.
````

#### `.claude/agents/api-designer.md`

````markdown
---
name: api-designer
description: "새로운 API를 설계하거나, API 명세를 작성하거나, 확장성과 개발자 경험을 위해 기존 API 아키텍처를 리팩터링할 때 이 에이전트를 사용하라. REST/GraphQL 엔드포인트 설계, OpenAPI 문서화, 인증 패턴, API 버전 관리 전략이 필요할 때 호출한다."
tools: Read, Write, Edit, Bash, Glob, Grep
model: opus
---

# 개요

당신은 REST/GraphQL 설계에 전문성을 가진 시니어 API 설계자다. 개발자가 쓰기 좋은 일관되고 문서화가 잘 된 API를 설계하는 것이 목표다.

## 호출되었을 때:

1. 기존 API 패턴, 데이터 모델, 클라이언트 요구사항을 파악한다
2. 리소스와 오퍼레이션을 식별하고 REST/GraphQL 설계 원칙에 따라 설계한다
3. OpenAPI 3.1 명세 등으로 문서화한다

## 설계 체크리스트:

- 리소스 지향, 올바른 HTTP 메서드/상태 코드 사용
- 일관된 네이밍, 페이지네이션, 필터링
- 인증(OAuth2/JWT)과 권한 범위 설계
- 버전 관리 및 하위 호환성 전략
- 일관된 에러 응답 형식과 에러 코드 카탈로그
- Rate limiting, 캐시 정책
- 요청/응답 예제를 포함한 문서화

## 준수 사항

- 대량 연산, 웹훅, 벌크 API가 필요하면 멱등성·재시도·부분 성공 처리를 함께 설계한다.
- 개발자 경험과 장기적 확장성을 최우선한다.
````

#### `.claude/agents/backend-expert.md`

````markdown
---
name: backend-expert
description: "견고한 아키텍처, 확장성 계획, 프로덕션 수준의 구현이 필요한 서버 사이드 API, 마이크로서비스, 백엔드 시스템을 구축할 때 이 에이전트를 사용하라."
tools: Read, Write, Edit, Bash, Glob, Grep
model: sonnet
---

# 개요

당신은 서버 사이드 애플리케이션을 전문으로 하는 시니어 백엔드 개발자다. 확장 가능하고 안전하며 성능이 좋은 백엔드 시스템을 구축하는 것이 목표다.

## 호출되었을 때:

1. 기존 API 아키텍처, 데이터베이스 스키마, 서비스 의존성을 파악한다
2. 성능 요구사항과 보안 제약을 분석한다
3. 확립된 백엔드 표준에 따라 구현한다

## 개발 체크리스트:

- RESTful API 설계, 요청/응답 유효성 검증, 표준화된 에러 응답
- 정규화된 스키마 설계, 인덱싱, 트랜잭션/마이그레이션 관리
- 입력 검증, SQL 인젝션 방지, RBAC, 민감 데이터 암호화
- 캐싱(Redis 등)과 커넥션 풀링을 통한 성능 최적화
- 단위/통합 테스트로 80% 이상 커버리지
- 구조화된 로깅과 헬스 체크/메트릭 노출

## 준수사항

- 이 프로젝트에서는 PRD 6장 기술 스택과 docs/5-project-principle.md 구조로 고정한다. 위의 다른 프레임워크·구조(예: Vue·Angular·마이크로서비스) 관련 지식은 참고만 하고 제안·도입하지 않는다. 의존성 추가·스택 변경은 사용자 승인 후 PD에 기록한 다음에만 한다.
- 마이크로서비스 구조라면 서비스 경계, 서킷 브레이커, 이벤트 기반 통신을 함께 고려한다.
- 모든 구현에서 신뢰성, 보안, 성능을 최우선한다.
````

#### `.claude/agents/frontend-expert.md`

````markdown
---
name: frontend-expert
description: "React, Vue, Angular 프레임워크 전반에 걸쳐 다중 프레임워크 전문성과 풀스택 연동이 필요한 완전한 프론트엔드 애플리케이션을 구축할 때 사용하라."
tools: Read, Write, Edit, Bash, Glob, Grep
model: sonnet
---

# 개요

당신은 React, Vue, Angular에 전문성을 가진 시니어 프론트엔드 개발자다. 성능이 좋고 접근성이 뛰어나며 유지보수 가능한 UI를 구축하는 것이 목표다.

## 호출되었을 때:

1. 기존 컴포넌트 아키텍처, 디자인 토큰, 상태 관리 패턴을 파악한다
2. 확립된 패턴과의 정합성을 검증한다
3. TypeScript 기반으로 컴포넌트를 구현한다

## 개발 체크리스트:

- TypeScript strict 모드, 명확한 컴포넌트 인터페이스
- 반응형 레이아웃, 기존 상태 관리와의 연동
- 처음부터 고려한 접근성(WCAG)
- 구현과 함께 작성하는 테스트(커버리지 85% 이상 목표)
- 컴포넌트 API와 사용 패턴 문서화

## 준수 사항

- 이 프로젝트에서는 PRD 6장 기술 스택과 docs/5-project-principle.md 구조로 고정한다. 위의 다른 프레임워크·구조(예: Vue·Angular·마이크로서비스) 관련 지식은 참고만 하고 제안·도입하지 않는다. 의존성 추가·스택 변경은 사용자 승인 후 PD에 기록한 다음에만 한다.
- 실시간 기능이 필요하면 WebSocket/SSE 연동, 낙관적 업데이트, 연결 상태 관리를 함께 설계한다.
- 사용자 경험, 코드 품질, 접근성 준수를 항상 최우선한다.
````

#### `.claude/agents/ui-designer.md`

````markdown
---
name: ui-designer
description: "시각적 인터페이스를 설계하거나, 디자인 시스템을 만들거나, 컴포넌트 라이브러리를 구축하거나, 전문적인 시각 디자인·인터랙션 패턴·접근성 고려가 필요한 사용자 대면 심미성을 다듬을 때 이 에이전트를 사용하라."
tools: Read, Write, Edit, Bash, Glob, Grep
model: sonnet
---

# 개요

당신은 시각 디자인, 인터랙션 디자인, 디자인 시스템에 전문성을 가진 시니어 UI 디자이너다. 일관성, 접근성, 브랜드 정합성을 유지하면서 아름답고 기능적인 인터페이스를 만드는 것이 목표다.

## 호출되었을 때:

1. 브랜드 가이드라인, 기존 디자인 시스템/컴포넌트, 접근성 요구사항을 파악한다
2. 시각적 컨셉과 컴포넌트 시스템, 인터랙션 패턴을 설계한다
3. 디자인 결정과 접근성 주석을 포함해 개발자 인수인계 자료를 준비한다

## 설계 체크리스트:

- 컴포넌트 상태(hover/active/disabled 등) 변형 정의
- 다크 모드 및 반응형 대응
- 모션/애니메이션의 타이밍과 접근성(감소 모션 옵션)
- WCAG 기준 명암비·접근성 검증
- 디자인 토큰과 에셋을 포함한 명세 문서화

## 준수 사항

- 크로스 플랫폼 대응이 필요하면 웹/iOS/Android 각 플랫폼 관례를 함께 검토한다.
- 사용자 니즈, 디자인 일관성, 접근성을 항상 최우선한다.
````

#### `.claude/agents/security-auditor.md`

````markdown
---
name: security-auditor
description: "시스템, 인프라, 프로세스 전반에 걸쳐 포괄적인 보안 감사, 컴플라이언스 평가, 리스크 평가를 수행할 때 이 에이전트를 사용하라. 체계적인 취약점 분석, 컴플라이언스 갭 식별, 근거 기반 보안 발견사항이 필요할 때 호출한다."
tools: Read, Grep, Glob
model: opus
---

# 개요

당신은 철저한 보안 평가, 컴플라이언스 감사, 리스크 평가를 수행하는 시니어 보안 감사관이다. 취약점 평가, 컴플라이언스 검증, 보안 통제 평가를 통해 실행 가능한 발견사항을 제공하는 것이 목표다.

## 호출되었을 때:

1. 보안 정책과 컴플라이언스 요구사항, 감사 범위를 파악한다
2. 보안 통제, 설정, 감사 로그를 검토한다
3. 취약점, 컴플라이언스 갭, 리스크 노출을 분석한다
4. 근거를 갖춘 발견사항과 개선 권고안을 제공한다

## 감사 체크리스트:

- 감사 범위와 방법론을 명확히 정의
- 접근 제어(권한, MFA, 프로비저닝/디프로비저닝) 검토
- 데이터 보안(암호화, 분류, 보관/폐기 정책) 검토
- 인프라 보안(네트워크 분리, 방화벽, 패치 관리) 검토
- 애플리케이션 보안(인증, 세션 관리, 입력 검증, API 보안) 검토
- 관련 컴플라이언스 프레임워크(SOC 2, ISO 27001, GDPR, PCI DSS 등) 대비 갭 분석
- 발견사항을 심각도(critical/high/medium/low)로 분류하고 근거 증거 첨부
- 리스크 기반 우선순위의 개선 로드맵 제시

## 준수 사항

- 발견사항은 재현 가능한 근거(설정 파일, 로그, 테스트 결과)와 함께 문서화하고, 즉시 조치 가능한 것과 장기 과제를 구분해 제시한다.
- 감사 전 과정에서 독립성과 객관성, 리스크 기반 우선순위를 항상 최우선한다.
````

#### `.mcp.json`

context7(라이브러리 문서)·playwright·chrome-devtools(브라우저 점검)·postgresql(DB 조회)은 필수, supabase·webpixels는 선택.

````json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    },
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"]
    },
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?features=docs%2Caccount%2Cdatabase%2Cdebugging%2Cdevelopment%2Cfunctions%2Cbranching"
    },
    "postgresql": {
      "command": "npx",
      "args": ["-y", "@henkey/postgres-mcp-server"]
    },
    "webpixels": {
      "command": "npx",
      "args": ["-y", "@webpixels/mcp"]
    }
  }
}
````

#### `.claude/settings.local.json`

켤 MCP 서버 목록. 선택 서버는 빼도 된다.

````json
{
  "enabledMcpjsonServers": [
    "context7",
    "playwright",
    "chrome-devtools",
    "supabase",
    "postgresql",
    "webpixels"
  ]
}
````

#### `biome.json`

루트 하나를 백엔드·프론트가 공유한다.

````json
{
  "files": {
    "includes": ["backend/**", "frontend/**", "!**/dist", "biome.json"]
  },
  "formatter": {
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "semicolons": "always"
    }
  },
  "yaml": {
    "formatter": {
      "quoteStyle": "single"
    }
  }
}
````

#### `.gitignore`

`.env*`는 무시하고 `.env.example`과 `frontend/.env.development`(비밀값 없음)만 커밋한다.

````text
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Diagnostic reports (https://nodejs.org/api/report.html)
report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Directory for instrumented libs generated by jscoverage/JSCover
lib-cov

# Coverage directory used by tools like istanbul
coverage
*.lcov

# nyc test coverage
.nyc_output

# Grunt intermediate storage (https://gruntjs.com/creating-plugins#storing-task-files)
.grunt

# Bower dependency directory (https://bower.io/)
bower_components

# node-waf configuration
.lock-wscript

# Compiled binary addons (https://nodejs.org/api/addons.html)
build/Release

# Dependency directories
node_modules/
jspm_packages/

# Snowpack dependency directory (https://snowpack.dev/)
web_modules/

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional stylelint cache
.stylelintcache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variable files
.env
.env.test
.env.*
!.env.example
# 프론트 개발용 API 주소(비밀값 없음, PR-S-04)
!frontend/.env.development

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next
out

# Nuxt.js build / generate output
.nuxt
dist
.output

# Gatsby files
.cache/
# Comment in the public line in if your project uses Gatsby and not Next.js
# https://nextjs.org/blog/next-9-1#public-directory-support
# public

# vuepress build output
.vuepress/dist

# vuepress v2.x temp directory
.temp

# Sveltekit cache directory
.svelte-kit/

# vitepress build output
**/.vitepress/dist

# vitepress cache directory
**/.vitepress/cache

# Docusaurus cache and generated files
.docusaurus

# Serverless directories
.serverless/

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# Firebase cache directory
.firebase/

# TernJS port file
.tern-port

# Stores Visual Studio Code versions used for testing Visual Studio Code extensions
.vscode-test

# pnpm
.pnpm-store

# yarn v3
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/sdks
!.yarn/versions

# Vite files
vite.config.js.timestamp-*
vite.config.ts.timestamp-*
.vite/

# Astro generated types
.astro/

# Turbo Repo
.turbo
````

#### `prompts/PRD.txt`

4장 단계 2에서 `<…>`를 입력 시트로 채운다.

````text
전문적인 서브에이전트를 활용하여 @docs\1-domain-definition.md 내용과 다음과 같은 추가 정보를 이용하여 PRD를 docs/2-PRD.md 에 작성해줘.

# 비즈니스 관련 정보
  - 목표 사용자: <예: 학생 및 20대-50대 직장인>
  - 비즈니스 목표: <예: 개인 일정을 기간·카테고리로 관리>

# 기술 제약사항
  - 플랫폼 우선순위: 웹 우선, 모바일은 반응형 웹UI로만 고려함.
  - 인프라 제약:
   * 프론트엔드: React 19 + Typescript + Zustand + Tanstack Query
   * 백엔드 : node.js + javascript + express + pg 라이브러리 ( Prisma 사용 금지 )
   * 데이터베이스: postgresql 17 사용

# 프로젝트 관리
  - 일정: <예: 2일 내에 핵심 기능 완성>
  - 팀 구성: <예: 1인 개발>
  - 예산: <예: 1인 개발에 준하는 예산>

# 사용자 경험
  - 사용자 페르소나: <예: 주 사용자별 상세 시나리오는 생략>
  - 접근성: <예: 이 앱에서는 고려하지 않음>
  - 모바일 우선: 반응형 UI만 적용
  - 다국어(한국어·일본어·영어), 화면 모드(시스템·주간·다크) 선택 포함
````

#### `backend/package.json`

`name`의 todolist만 SLUG로 바꾼다. 버전은 이 프로젝트에서 검증한 값.

````json
{
  "name": "todolist-backend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=22"
  },
  "scripts": {
    "dev": "node --watch --env-file=.env src/server.js",
    "start": "node --env-file=.env src/server.js",
    "test": "node --env-file=.env.test --test --test-concurrency=1",
    "db:init": "node --env-file=.env scripts/db-init.js",
    "seed:load": "node --env-file=.env scripts/seed-load.js"
  },
  "dependencies": {
    "bcrypt": "^6.0.0",
    "express": "^5.3.0",
    "jsonwebtoken": "^9.0.3",
    "pg": "^8.23.1"
  },
  "devDependencies": {
    "@biomejs/biome": "2.6.4"
  }
}
````

#### `backend/.env.example`

이 파일을 복사해 `.env`·`.env.test`를 만든다(2.2-5).

````text
# 복사해서 .env(개발), .env.test(테스트, DATABASE_URL만 todolist_test)로 쓴다. 이 파일만 커밋한다(PR-S-01).
DATABASE_URL=postgresql://todolist:change-me@localhost:5432/todolist
# HS384 키: 48자 이상. 생성 예: node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
JWT_SECRET=
PORT=3000
DB_POOL_MAX=20
NODE_ENV=development
# 허용할 프론트 출처 하나(PR-S-04). 개발 기본값 http://localhost:5173, production에서는 필수
CORS_ORIGIN=http://localhost:5173
# 토큰 만료(양의 정수, PR-S-01). 기본 access 15분, refresh 7일(P-04)
JWT_ACCESS_EXPIRES_MINUTES=15
REFRESH_TOKEN_TTL_DAYS=7
````

#### `frontend/package.json`

````json
{
  "name": "frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest run"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.106.0",
    "react": "^19.3.1",
    "react-dom": "^19.3.1",
    "react-router": "^8.5.1",
    "zustand": "^5.0.16"
  },
  "devDependencies": {
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "@vitejs/plugin-react": "^6.1.2",
    "typescript": "~7.0.2",
    "vite": "^8.3.5",
    "vitest": "^5.1.0"
  },
  "engines": {
    "node": ">=22"
  }
}
````

#### `frontend/tsconfig.json`

````json
{
  "compilerOptions": {
    "target": "es2023",
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "types": ["vite/client"],
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src", "vite.config.ts"]
}
````

#### `frontend/vite.config.ts`

포트 5173은 백엔드 `CORS_ORIGIN` 기본값과 같아야 한다.

````ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // 백엔드 CORS_ORIGIN 기본값과 같아야 한다(PR-S-04)
  },
  test: {
    include: ['src/**/*.test.ts'],
    passWithNoTests: true,
  },
});
````

#### `frontend/.env.development`

````text
# 개발 서버가 직접 호출할 API 주소(PR-S-04, CORS). 운영 빌드는 VITE_API_BASE_URL을 지정해 빌드한다.
VITE_API_BASE_URL=http://localhost:3000
````

## 부록 B. 재사용 기반 코드 (구현 단계 11·12의 출발점)

> TodoList에서 도메인과 무관하게 쓰인 파일들이다. 주석의 규칙 ID(PR-…, P-…)는 TodoList 문서 기준이므로 새 문서 ID로 바꾼다. 이모지 규칙, 캘린더, 할일·카테고리 같은 도메인 코드는 넣지 않았다 — 필요하면 TodoList 저장소에서 가져온다.

#### `backend/src/config.js`

환경변수 단일 입구. 그대로 쓴다.

````js
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
````

#### `backend/src/db.js`

pg Pool, DATE를 문자열로 받기, 트랜잭션 헬퍼. 그대로 쓴다.

````js
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
````

#### `backend/src/errors.js`

오류 코드 상수와 AppError. **바꿀 곳**: `ERROR` 목록을 새 앱의 오류 코드(NFR)로.

````js
// 오류 코드(NFR-15)는 이 파일에만 문자열로 둔다(PR-C-01).
export const ERROR = Object.freeze({
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DEFAULT_CATEGORY_IMMUTABLE: 'DEFAULT_CATEGORY_IMMUTABLE',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_EMAIL: 'DUPLICATE_EMAIL',
  DUPLICATE_CATEGORY: 'DUPLICATE_CATEGORY',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
});

export class AppError extends Error {
  constructor(status, code, message, fields) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export const validationError = (fields, message = '입력값을 확인해 주세요.') =>
  new AppError(400, ERROR.VALIDATION_ERROR, message, fields);
export const notFound = () => new AppError(404, ERROR.NOT_FOUND, '대상을 찾을 수 없습니다.');
export const unauthorized = () => new AppError(401, ERROR.UNAUTHORIZED, '로그인이 필요합니다.');

// domain/validate.js의 결과({ value, fields })를 받아 오류면 VALIDATION_ERROR를 던진다(PR-L-07: domain은 import 없음).
export function assertValid({ value, fields }) {
  if (Object.keys(fields).length > 0) throw validationError(fields);
  return value;
}
````

#### `backend/src/middleware/error.js`

오류 응답 형식 한 곳. 그대로 쓴다.

````js
import { AppError, ERROR, notFound, validationError } from '../errors.js';

export function notFoundHandler(_req, _res, next) {
  next(notFound());
}

// NFR-15 형식 응답은 여기서만 만든다(PR-N-07).
export function errorHandler(err, req, res, _next) {
  let error = err;
  // PR-S-07: 본문 한도 초과(413)·JSON 파싱 실패는 400 VALIDATION_ERROR로 바꾼다.
  if (err.type === 'entity.too.large')
    error = validationError(undefined, '요청 본문이 너무 큽니다.');
  else if (err.type === 'entity.parse.failed')
    error = validationError(undefined, '요청 본문이 올바른 JSON이 아닙니다.');

  if (!(error instanceof AppError)) {
    // PR-S-08: 본문·쿠키·비밀번호는 남기지 않는다.
    console.error(
      JSON.stringify({
        time: new Date().toISOString(),
        method: req.method,
        path: req.path,
        message: err.message,
        stack: err.stack,
      }),
    );
    error = new AppError(500, ERROR.INTERNAL_ERROR, '일시적인 오류가 발생했습니다.');
  }

  const body = { code: error.code, message: error.message };
  if (error.fields) body.fields = error.fields;
  res.status(error.status).json({ error: body });
}
````

#### `backend/src/middleware/cors.js`

허용 출처 하나만. 그대로 쓴다.

````js
import { config } from '../config.js';

// PR-S-04: 프론트 출처 하나만 쿠키 포함 요청을 허용한다. 다른 출처에는 CORS 헤더를 주지 않아 브라우저가 응답을 막는다.
export function cors(req, res, next) {
  res.vary('Origin');
  if (req.headers.origin !== config.corsOrigin) return next();
  res.set({
    'Access-Control-Allow-Origin': config.corsOrigin,
    'Access-Control-Allow-Credentials': 'true',
  });
  if (req.method !== 'OPTIONS') return next();
  res.set({
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '600',
  });
  res.sendStatus(204);
}
````

#### `backend/src/middleware/auth.js`

access 토큰 쿠키 검증. 토큰 발급·갱신(`services/auth.js`)은 사용자 테이블 구조에 맞춰 새로 작성.

````js
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
````

#### `backend/src/app.js`

앱 조립·헬스 체크·개발 환경 Swagger UI. **바꿀 곳**: `<title>`.

````js
import { fileURLToPath } from 'node:url';
import express from 'express';
import { config } from './config.js';
import { query } from './db.js';
import { cors } from './middleware/cors.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { apiRouter } from './routes/index.js';

const SPEC_PATH = fileURLToPath(new URL('../swagger.yaml', import.meta.url));
const SWAGGER_UI = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14';
const DOCS_HTML = `<!doctype html>
<html lang="ko">
<head><meta charset="utf-8"><title>TodoList API</title>
<link rel="stylesheet" href="${SWAGGER_UI}/swagger-ui.css"></head>
<body><div id="swagger-ui"></div>
<script src="${SWAGGER_UI}/swagger-ui-bundle.js"></script>
<script>SwaggerUIBundle({ url: '/api/docs/swagger.yaml', dom_id: '#swagger-ui' });</script>
</body></html>`;

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors); // 오류 응답에도 CORS 헤더가 붙도록 맨 앞에 둔다
  app.use(express.json({ limit: '16kb' }));
  // PD-14: 기동과 DB 연결을 확인한다. DB 실패는 오류 미들웨어가 아닌 503 상태 본문으로 답한다.
  app.get('/api/health', async (_req, res) => {
    try {
      await query('SELECT 1');
      res.json({ ok: true, db: 'up' });
    } catch {
      res.status(503).json({ ok: false, db: 'down' });
    }
  });
  // PD-30: Swagger UI는 개발 환경에서만 연다. 그 밖의 환경은 등록하지 않아 404다.
  if (config.nodeEnv === 'development') {
    app.get('/api/docs', (_req, res) => res.type('html').send(DOCS_HTML));
    app.get('/api/docs/swagger.yaml', (_req, res) => res.type('yaml').sendFile(SPEC_PATH));
  }
  app.use('/api', apiRouter);
  app.use('/api', notFoundHandler);
  app.use(errorHandler);
  return app;
}
````

#### `backend/src/server.js`

그대로 쓴다.

````js
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
````

#### `backend/src/routes/index.js`

인증 경계. **바꿀 곳**: 하위 라우터 목록.

````js
import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { authRouter } from './auth.js';
import { calendarRouter } from './calendar.js';
import { categoriesRouter } from './categories.js';
import { meRouter } from './me.js';
import { todosRouter } from './todos.js';

export const apiRouter = Router();

// PR-S-05: 공개는 /api/auth/*(signup·login·refresh·logout)와 /api/health(app.js)뿐이다.
apiRouter.use('/auth', authRouter);

// 여기에 추가한 라우터는 모두 auth가 먼저 걸린다. 경로 단위로 걸어 없는 /api 경로는 404로 남긴다.
const PROTECTED = {
  '/me': meRouter,
  '/categories': categoriesRouter,
  '/todos': todosRouter,
  '/calendar': calendarRouter,
};
for (const [path, router] of Object.entries(PROTECTED)) apiRouter.use(path, auth, router);
````

#### `backend/scripts/db-init.js`

`docs/schema.sql` 적용. **바꿀 곳**: `--reset`의 `DROP TABLE` 목록(자식 테이블부터).

````js
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
````

#### `backend/test/helpers/index.js`

API 통합 테스트 헬퍼(쿠키 저장 클라이언트). **바꿀 곳**: `resetDb`의 `TRUNCATE` 목록, `signupUser`의 가입 본문.

````js
// API 통합 테스트 헬퍼(PR-T-04): 실제 앱(포트 0)과 todolist_test DB를 쓴다. 의존성 없이 내장 fetch만 쓴다(PD-09).
import { after, before } from 'node:test';
import { createApp } from '../../src/app.js';
import { close, query } from '../../src/db.js';

export { query };

export function resetDb() {
  return query('TRUNCATE users, categories, todos, refresh_tokens RESTART IDENTITY CASCADE');
}

// 테스트 파일 맨 위에서 한 번 호출한다: 시작 시 DB 비우고 서버 기동, 끝나면 서버·풀 종료.
export function useServer() {
  const ctx = { base: '' };
  let server;
  before(async () => {
    await resetDb();
    server = createApp().listen(0);
    ctx.base = `http://localhost:${server.address().port}`;
  });
  after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await close();
  });
  return ctx;
}

// 쿠키를 저장해 다음 요청에 붙이는 클라이언트. 쿠키 Path를 지켜 브라우저처럼 보낸다.
export function client(ctx) {
  const jar = new Map(); // name → { value, path }
  async function request(method, path, body) {
    const cookie = [...jar]
      .filter(([, c]) => path.startsWith(c.path))
      .map(([name, c]) => `${name}=${c.value}`)
      .join('; ');
    const headers = {};
    if (cookie) headers.cookie = cookie;
    if (body !== undefined) headers['content-type'] = 'application/json';
    const res = await fetch(ctx.base + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const setCookies = res.headers.getSetCookie();
    for (const sc of setCookies) {
      const [pair, ...attrs] = sc.split(';').map((s) => s.trim());
      const [name, value] = [pair.slice(0, pair.indexOf('=')), pair.slice(pair.indexOf('=') + 1)];
      const cookiePath = attrs.find((a) => a.toLowerCase().startsWith('path='))?.slice(5) ?? '/';
      if (value === '' || /max-age=0\b/i.test(sc) || /expires=thu, 01 jan 1970/i.test(sc))
        jar.delete(name);
      else jar.set(name, { value, path: cookiePath });
    }
    const text = await res.text();
    return {
      status: res.status,
      body: text ? JSON.parse(text) : undefined,
      setCookies,
      headers: res.headers,
    };
  }
  return {
    jar,
    get: (p) => request('GET', p),
    post: (p, b) => request('POST', p, b),
    patch: (p, b) => request('PATCH', p, b),
    put: (p, b) => request('PUT', p, b),
    delete: (p) => request('DELETE', p),
  };
}

// 가입한 사용자(U1·U2 등)의 클라이언트를 돌려준다.
export async function signupUser(ctx, n = 1) {
  const c = client(ctx);
  const res = await c.post('/api/auth/signup', {
    email: `u${n}@test.local`,
    password: 'password123',
    name: `사용자${n}`,
  });
  if (res.status !== 201) throw new Error(`가입 실패: ${res.status} ${JSON.stringify(res.body)}`);
  c.user = res.body;
  return c;
}
````

#### `frontend/index.html`

첫 화면 전 화면 모드 적용 스크립트 포함. **바꿀 곳**: `<title>`.

````html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TodoList</title>
    <script>
      // P-29: 첫 화면을 그리기 전에 화면 모드 적용(src/lib/theme.ts와 같은 규칙)
      (() => {
        var p = null;
        try { p = localStorage.getItem('theme'); } catch {}
        if (p !== 'light' && p !== 'dark') {
          p = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        document.documentElement.dataset.theme = p;
      })();
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
````

#### `frontend/src/main.tsx`

쿼리 클라이언트·라우터·전역 CSS 연결. 그대로 쓴다.

````tsx
import {
  keepPreviousData,
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { ApiError } from './api/types';
import { router } from './app/router';
import { clearSession } from './app/session';
import './styles/global.css';

// 401이면 세션을 비운다. 이동은 RequireAuth가 status=guest를 보고 처리한다.
function isUnauthorized(err: unknown): boolean {
  return err instanceof ApiError && err.code === 'UNAUTHORIZED';
}

const queryClient: QueryClient = new QueryClient({
  queryCache: new QueryCache({
    // PR-L-12, PD-24: 갱신까지 실패한 401은 세션을 비우고 RequireAuth가 /login으로 보낸다(첫 진입 /api/me 제외)
    onError(err, query) {
      if (isUnauthorized(err) && !query.meta?.skipAuthRedirect) clearSession(queryClient);
    },
  }),
  mutationCache: new MutationCache({
    onError(err) {
      if (isUnauthorized(err)) clearSession(queryClient);
    },
  }),
  defaultOptions: {
    queries: { retry: false, placeholderData: keepPreviousData, refetchOnWindowFocus: true },
    mutations: { retry: false },
  },
});

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
````

#### `frontend/src/api/client.ts`

fetch 래퍼(401 시 refresh 1회 후 재요청, CORS 쿠키). 그대로 쓴다.

````ts
import type { ErrorCode } from './types';
import { ApiError } from './types';

export type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
export const FALLBACK_MESSAGE = '서버에 연결할 수 없습니다.';
// PR-S-04: API 주소는 이 한 곳에서만 읽는다. 없으면 같은 출처(테스트).
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

// 같은 탭의 동시 401은 진행 중인 갱신 하나를 공유한다(PR-L-12).
let refreshing: Promise<boolean> | null = null;

interface ErrorBody {
  error: { code: ErrorCode; message: string; fields?: Record<string, string> };
}

function isErrorBody(v: unknown): v is ErrorBody {
  if (typeof v !== 'object' || v === null || !('error' in v)) return false;
  const e = v.error;
  return (
    typeof e === 'object' &&
    e !== null &&
    'code' in e &&
    typeof e.code === 'string' &&
    'message' in e &&
    typeof e.message === 'string'
  );
}

async function send<T>(method: Method, path: string, body: unknown, retried: boolean): Promise<T> {
  let res: Response;
  try {
    res = await fetch(API_BASE + path, {
      method,
      credentials: 'include', // 다른 출처의 API에 인증 쿠키를 보내고 받는다
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'INTERNAL_ERROR', FALLBACK_MESSAGE);
  }

  if (res.ok) {
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  }

  let parsed: unknown;
  try {
    parsed = await res.json();
  } catch {
    parsed = undefined;
  }
  if (!isErrorBody(parsed)) throw new ApiError(res.status, 'INTERNAL_ERROR', FALLBACK_MESSAGE);
  const { code, message, fields } = parsed.error;
  const err = new ApiError(res.status, code, message, fields);

  if (code === 'UNAUTHORIZED' && !path.startsWith('/api/auth/') && !retried) {
    refreshing ??= fetch(`${API_BASE}/api/auth/refresh`, { method: 'POST', credentials: 'include' })
      .then(
        (r) => r.ok,
        () => false,
      )
      .finally(() => {
        refreshing = null;
      });
    if (await refreshing) return send<T>(method, path, body, true);
  }
  throw err;
}

export function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
  return send<T>(method, path, body, false);
}
````

#### `frontend/src/app/RequireAuth.tsx`

인증 가드. 그대로 쓴다(`features/auth` 스토어·훅은 새로 작성).

````tsx
import { Navigate, Outlet } from 'react-router';
import { LoadingNotice } from '../components/LoadingNotice';
import { useAuthStore } from '../features/auth/authStore';
import { useAuthBootstrap } from '../features/auth/useAuth';

export function RequireAuth({ mode }: { mode: 'authed' | 'guest' }) {
  useAuthBootstrap();
  const status = useAuthStore((s) => s.status);
  // P-23, BR-01: 보호 경로는 비로그인 시 /login, 로그인 상태의 /login·/signup은 /todos
  if (status === 'unknown') return <LoadingNotice kind="initial" />;
  if (mode === 'authed' && status === 'guest') return <Navigate to="/login" replace />;
  if (mode === 'guest' && status === 'authed') return <Navigate to="/todos" replace />;
  return <Outlet />;
}
````

#### `frontend/src/lib/theme.ts`

화면 모드 판정(순수 함수). 그대로 쓴다.

````ts
// P-29: 화면 모드 판정(순수 함수). 저장·적용은 themeStore.ts, 첫 화면 전 적용은 index.html이 같은 규칙으로 한다.
export const THEMES = ['system', 'light', 'dark'] as const;
export type ThemePref = (typeof THEMES)[number];
export type Theme = 'light' | 'dark';

export function parseThemePref(stored: string | null): ThemePref {
  return (THEMES as readonly string[]).includes(stored ?? '') ? (stored as ThemePref) : 'system';
}

export function resolveTheme(pref: ThemePref, systemDark: boolean): Theme {
  if (pref === 'system') return systemDark ? 'dark' : 'light';
  return pref;
}
````

#### `frontend/src/lib/themeStore.ts`

화면 모드 저장·적용. 그대로 쓴다.

````ts
import { create } from 'zustand';
import { parseThemePref, resolveTheme, type ThemePref } from './theme';

const KEY = 'theme';
const media = window.matchMedia('(prefers-color-scheme: dark)');

function load(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null; // 저장소가 막혀도 화면은 동작해야 한다
  }
}

// P-29: <html data-theme>만 바꾸면 global.css 토큰이 모드별 값으로 바뀐다
function apply(pref: ThemePref) {
  document.documentElement.dataset.theme = resolveTheme(pref, media.matches);
}

const initial = parseThemePref(load());
apply(initial);

export const useThemeStore = create<{ pref: ThemePref; setPref(pref: ThemePref): void }>((set) => ({
  pref: initial,
  setPref: (pref) => {
    try {
      localStorage.setItem(KEY, pref);
    } catch {
      // 저장 실패는 무시: 이번 방문 동안만 유지
    }
    apply(pref);
    set({ pref });
  },
}));

// '시스템'이면 OS 설정이 바뀔 때 바로 따라간다
media.addEventListener('change', () => apply(useThemeStore.getState().pref));
````

#### `frontend/src/i18n/messages.ts`

언어 목록·사전·서버 문구 번역·언어 판별. **바꿀 곳**: 사전 키·문구는 새 앱 화면 문구로, `SERVER` 표는 새 서버 오류 문구로(ko 사전이 기준 타입이라 ja·en 키가 빠지면 타입 오류). `LANGS`·`translateMessage`·`detectLang`은 그대로.

````ts
// P-31: 화면 문구 사전. ko가 기준 타입이라 ja·en에 키가 빠지면 타입 검사가 실패한다.
export const LANGS = ['ko', 'ja', 'en'] as const;
export type Lang = (typeof LANGS)[number];
// 선택 상자에는 각 언어를 그 언어로 쓴다
export const LANG_NAMES: Record<Lang, string> = { ko: '한국어', ja: '日本語', en: 'English' };

const ko = {
  'lang.label': '언어',
  'theme.label': '화면 모드',
  'theme.system': '🖥️ 시스템',
  'theme.light': '☀️ 주간',
  'theme.dark': '🌙 다크',
  'nav.menu': '주요 메뉴',
  'nav.todos': '목록',
  'nav.calendar': '캘린더',
  'nav.categories': '카테고리',
  'nav.me': '내 정보',
  'nav.logout': '로그아웃',
  'common.cancel': '취소',
  'common.confirm': '확인',
  'common.save': '저장',
  'common.close': '닫기',
  'common.edit': '수정',
  'common.delete': '삭제',
  'common.add': '추가',
  'common.all': '전체',
  'common.none': '선택 안 함',
  'notice.empty': '할일이 없습니다.',
  'notice.loading': '불러오는 중…',
  'notice.refreshing': '갱신 중…',
  'auth.login': '로그인',
  'auth.signup': '회원가입',
  'auth.signupSubmit': '가입',
  'auth.email': '이메일',
  'auth.password': '비밀번호',
  'auth.passwordConfirm': '비밀번호 확인',
  'auth.name': '이름',
  'auth.haveAccount': '이미 계정이 있나요?',
  'me.title': '내 정보',
  'me.passwordTitle': '비밀번호 변경',
  'me.currentPassword': '현재 비밀번호',
  'me.newPassword': '새 비밀번호',
  'me.newPasswordConfirm': '새 비밀번호 확인',
  'todo.listTitle': '할일 목록',
  'todo.newLink': '+ 할일 등록',
  'todo.new': '할일 등록',
  'todo.edit': '할일 편집',
  'todo.done': '완료',
  'todo.title': '제목',
  'todo.description': '설명',
  'todo.period': '기간',
  'todo.startDate': '시작일',
  'todo.endDate': '종료일',
  'todo.startTime': '시작 시간',
  'todo.endTime': '종료 시간',
  'todo.category': '카테고리',
  'todo.status': '상태',
  'todo.toggle': (title: string) => `${title} 완료`,
  'todo.deleteConfirm': '이 할일을 삭제할까요?',
  'status.completed': '완료',
  'status.not_started': '시작 전',
  'status.in_progress': '진행 중',
  'status.overdue': '지연',
  'category.title': '카테고리',
  'category.default': '기본',
  'category.newName': '새 카테고리 이름',
  'category.name': '카테고리 이름',
  'category.deleteConfirm': (name: string) => `'${name}' 카테고리를 삭제할까요?`,
  'category.deleteNote': "소속 할일은 '기본'으로 옮겨집니다.",
  'cal.month': '월',
  'cal.4weeks': '4주',
  'cal.week': '주',
  'cal.day': '일',
  'cal.prev': '이전',
  'cal.next': '다음',
  'cal.dayTodos': (date: string) => `${date} 할일`,
  'cal.weekNo': (n: number) => `${n}주차`,
  weekdays: ['일', '월', '화', '수', '목', '금', '토'],
};
export type Dict = typeof ko;

const ja: Dict = {
  'lang.label': '言語',
  'theme.label': '表示モード',
  'theme.system': '🖥️ システム',
  'theme.light': '☀️ ライト',
  'theme.dark': '🌙 ダーク',
  'nav.menu': 'メインメニュー',
  'nav.todos': 'リスト',
  'nav.calendar': 'カレンダー',
  'nav.categories': 'カテゴリ',
  'nav.me': 'マイページ',
  'nav.logout': 'ログアウト',
  'common.cancel': 'キャンセル',
  'common.confirm': 'OK',
  'common.save': '保存',
  'common.close': '閉じる',
  'common.edit': '編集',
  'common.delete': '削除',
  'common.add': '追加',
  'common.all': 'すべて',
  'common.none': '選択なし',
  'notice.empty': 'タスクがありません。',
  'notice.loading': '読み込み中…',
  'notice.refreshing': '更新中…',
  'auth.login': 'ログイン',
  'auth.signup': '新規登録',
  'auth.signupSubmit': '登録',
  'auth.email': 'メールアドレス',
  'auth.password': 'パスワード',
  'auth.passwordConfirm': 'パスワード（確認）',
  'auth.name': '名前',
  'auth.haveAccount': 'アカウントをお持ちですか？',
  'me.title': 'マイページ',
  'me.passwordTitle': 'パスワード変更',
  'me.currentPassword': '現在のパスワード',
  'me.newPassword': '新しいパスワード',
  'me.newPasswordConfirm': '新しいパスワード（確認）',
  'todo.listTitle': 'タスク一覧',
  'todo.newLink': '+ タスク登録',
  'todo.new': 'タスク登録',
  'todo.edit': 'タスク編集',
  'todo.done': '完了',
  'todo.title': 'タイトル',
  'todo.description': '説明',
  'todo.period': '期間',
  'todo.startDate': '開始日',
  'todo.endDate': '終了日',
  'todo.startTime': '開始時刻',
  'todo.endTime': '終了時刻',
  'todo.category': 'カテゴリ',
  'todo.status': '状態',
  'todo.toggle': (title: string) => `${title} 完了`,
  'todo.deleteConfirm': 'このタスクを削除しますか？',
  'status.completed': '完了',
  'status.not_started': '未着手',
  'status.in_progress': '進行中',
  'status.overdue': '遅延',
  'category.title': 'カテゴリ',
  'category.default': 'デフォルト',
  'category.newName': '新しいカテゴリ名',
  'category.name': 'カテゴリ名',
  'category.deleteConfirm': (name: string) => `カテゴリ「${name}」を削除しますか？`,
  'category.deleteNote': '所属するタスクは「デフォルト」に移動します。',
  'cal.month': '月',
  'cal.4weeks': '4週',
  'cal.week': '週',
  'cal.day': '日',
  'cal.prev': '前へ',
  'cal.next': '次へ',
  'cal.dayTodos': (date: string) => `${date} のタスク`,
  'cal.weekNo': (n: number) => `第${n}週`,
  weekdays: ['日', '月', '火', '水', '木', '金', '土'],
};

const en: Dict = {
  'lang.label': 'Language',
  'theme.label': 'Theme',
  'theme.system': '🖥️ System',
  'theme.light': '☀️ Light',
  'theme.dark': '🌙 Dark',
  'nav.menu': 'Main menu',
  'nav.todos': 'List',
  'nav.calendar': 'Calendar',
  'nav.categories': 'Categories',
  'nav.me': 'My info',
  'nav.logout': 'Log out',
  'common.cancel': 'Cancel',
  'common.confirm': 'OK',
  'common.save': 'Save',
  'common.close': 'Close',
  'common.edit': 'Edit',
  'common.delete': 'Delete',
  'common.add': 'Add',
  'common.all': 'All',
  'common.none': 'None',
  'notice.empty': 'No tasks.',
  'notice.loading': 'Loading…',
  'notice.refreshing': 'Updating…',
  'auth.login': 'Log in',
  'auth.signup': 'Sign up',
  'auth.signupSubmit': 'Sign up',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.passwordConfirm': 'Confirm password',
  'auth.name': 'Name',
  'auth.haveAccount': 'Already have an account?',
  'me.title': 'My info',
  'me.passwordTitle': 'Change password',
  'me.currentPassword': 'Current password',
  'me.newPassword': 'New password',
  'me.newPasswordConfirm': 'Confirm new password',
  'todo.listTitle': 'Tasks',
  'todo.newLink': '+ New task',
  'todo.new': 'New task',
  'todo.edit': 'Edit task',
  'todo.done': 'Done',
  'todo.title': 'Title',
  'todo.description': 'Description',
  'todo.period': 'Period',
  'todo.startDate': 'Start date',
  'todo.endDate': 'End date',
  'todo.startTime': 'Start time',
  'todo.endTime': 'End time',
  'todo.category': 'Category',
  'todo.status': 'Status',
  'todo.toggle': (title: string) => `Mark "${title}" as done`,
  'todo.deleteConfirm': 'Delete this task?',
  'status.completed': 'Done',
  'status.not_started': 'Not started',
  'status.in_progress': 'In progress',
  'status.overdue': 'Overdue',
  'category.title': 'Categories',
  'category.default': 'Default',
  'category.newName': 'New category name',
  'category.name': 'Category name',
  'category.deleteConfirm': (name: string) => `Delete the "${name}" category?`,
  'category.deleteNote': 'Its tasks will move to "Default".',
  'cal.month': 'Month',
  'cal.4weeks': '4 weeks',
  'cal.week': 'Week',
  'cal.day': 'Day',
  'cal.prev': 'Previous',
  'cal.next': 'Next',
  'cal.dayTodos': (date: string) => `Tasks on ${date}`,
  'cal.weekNo': (n: number) => `W${n}`,
  weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};

export const DICTS: Record<Lang, Dict> = { ko, ja, en };

// 서버(NFR-15)·클라이언트가 만든 한국어 문구 → 다른 언어. 모르는 문구는 그대로 둔다(P-31, PR-C-04).
const SERVER: Record<string, Record<Exclude<Lang, 'ko'>, string>> = {
  '입력값을 확인해 주세요.': { ja: '入力内容を確認してください。', en: 'Please check your input.' },
  '필수 항목입니다.': { ja: '必須項目です。', en: 'This field is required.' },
  '형식이 올바르지 않습니다.': { ja: '形式が正しくありません。', en: 'Invalid format.' },
  '이메일 형식이 올바르지 않습니다.': {
    ja: 'メールアドレスの形式が正しくありません。',
    en: 'Invalid email address.',
  },
  '날짜 형식(YYYY-MM-DD)이 올바르지 않습니다.': {
    ja: '日付の形式（YYYY-MM-DD）が正しくありません。',
    en: 'Invalid date (YYYY-MM-DD).',
  },
  '시간 형식(HH:MM)이 올바르지 않습니다.': {
    ja: '時刻の形式（HH:MM）が正しくありません。',
    en: 'Invalid time (HH:MM).',
  },
  '종료일은 시작일과 같거나 이후여야 합니다.': {
    ja: '終了日は開始日と同じかそれ以降にしてください。',
    en: 'End date must be on or after the start date.',
  },
  '종료 시간은 시작 시간과 같거나 이후여야 합니다.': {
    ja: '終了時刻は開始時刻と同じかそれ以降にしてください。',
    en: 'End time must be at or after the start time.',
  },
  '이메일 또는 비밀번호가 올바르지 않습니다.': {
    ja: 'メールアドレスまたはパスワードが正しくありません。',
    en: 'Incorrect email or password.',
  },
  '이미 가입된 이메일입니다.': {
    ja: 'このメールアドレスは既に登録されています。',
    en: 'This email is already registered.',
  },
  '로그인이 필요합니다.': { ja: 'ログインが必要です。', en: 'Please log in.' },
  '대상을 찾을 수 없습니다.': { ja: '対象が見つかりません。', en: 'Not found.' },
  '이미 있는 카테고리 이름입니다.': {
    ja: 'そのカテゴリ名は既に存在します。',
    en: 'That category name already exists.',
  },
  '기본 카테고리는 수정하거나 삭제할 수 없습니다.': {
    ja: 'デフォルトのカテゴリは編集・削除できません。',
    en: 'The default category cannot be edited or deleted.',
  },
  '현재 비밀번호가 올바르지 않습니다.': {
    ja: '現在のパスワードが正しくありません。',
    en: 'Current password is incorrect.',
  },
  '요청 본문이 너무 큽니다.': { ja: 'リクエストが大きすぎます。', en: 'Request is too large.' },
  '요청 본문이 올바른 JSON이 아닙니다.': {
    ja: 'リクエストの形式が正しくありません。',
    en: 'Request body is not valid JSON.',
  },
  '일시적인 오류가 발생했습니다.': {
    ja: '一時的なエラーが発生しました。',
    en: 'A temporary error occurred.',
  },
  '서버에 연결할 수 없습니다.': {
    ja: 'サーバーに接続できません。',
    en: 'Cannot connect to the server.',
  },
  '비밀번호가 일치하지 않습니다.': {
    ja: 'パスワードが一致しません。',
    en: 'Passwords do not match.',
  },
};
// BR-21·BR-22 길이 문구(숫자가 들어감)
const LEN: [RegExp, Record<Exclude<Lang, 'ko'>, (a: string, b: string) => string>][] = [
  [
    /^(\d+)자 이상 (\d+)자 이하여야 합니다\.$/,
    {
      ja: (a, b) => `${a}文字以上${b}文字以下で入力してください。`,
      en: (a, b) => `Must be ${a}–${b} characters.`,
    },
  ],
  [
    /^(\d+)자 이하여야 합니다\.$/,
    {
      ja: (a) => `${a}文字以下で入力してください。`,
      en: (a) => `Must be at most ${a} characters.`,
    },
  ],
];

export function translateMessage(message: string, lang: Lang): string {
  if (lang === 'ko') return message;
  const exact = SERVER[message]?.[lang];
  if (exact) return exact;
  for (const [re, by] of LEN) {
    const m = re.exec(message);
    if (m) return by[lang](m[1], m[2]);
  }
  return message;
}

// 저장값 → 브라우저 언어 → ko
export function detectLang(stored: string | null, browser: string | undefined): Lang {
  if (stored && (LANGS as readonly string[]).includes(stored)) return stored as Lang;
  const base = browser?.slice(0, 2).toLowerCase();
  return (LANGS as readonly string[]).includes(base ?? '') ? (base as Lang) : 'ko';
}
````

#### `frontend/src/i18n/index.ts`

언어 스토어·`useT`. **바꿀 곳**: `useCategoryLabel`은 TodoList 전용이라 지운다.

````ts
import { create } from 'zustand';
import { DICTS, type Dict, detectLang, type Lang, translateMessage } from './messages';

export { LANG_NAMES, LANGS, type Lang } from './messages';

const KEY = 'lang';
// 사생활 모드 등에서 localStorage 접근이 막혀도 화면은 동작해야 한다
function load(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function apply(lang: Lang) {
  document.documentElement.lang = lang;
  try {
    localStorage.setItem(KEY, lang);
  } catch {
    // 저장 실패는 무시: 이번 방문 동안만 유지
  }
}

const initial = detectLang(load(), navigator.language);
document.documentElement.lang = initial;

export const useLangStore = create<{ lang: Lang; setLang(lang: Lang): void }>((set) => ({
  lang: initial,
  setLang: (lang) => {
    apply(lang);
    set({ lang });
  },
}));

// 화면 문구: t('nav.todos'), 인자가 있으면 t('cal.weekNo')(45)
export function useT() {
  const lang = useLangStore((s) => s.lang);
  return <K extends keyof Dict>(key: K): Dict[K] => DICTS[lang][key];
}

// 서버가 준 한국어 문구를 선택한 언어로(FormError·FieldError)
export function useTranslateMessage() {
  const lang = useLangStore((s) => s.lang);
  return (message: string) => translateMessage(message, lang);
}

// '기본' 카테고리는 서버가 만든 이름이라 표시할 때만 언어별 이름으로(P-31)
export function useCategoryLabel() {
  const t = useT();
  return (name: string) => (name === '기본' ? t('category.default') : name);
}
````

#### `frontend/src/components/LanguageSelect.tsx`

그대로 쓴다.

````tsx
import { LANG_NAMES, LANGS, type Lang, useLangStore, useT } from '../i18n';

// FR-18, L-23: 언어 선택. 내비게이션(내 정보 옆)과 로그인·회원가입 화면에서 쓴다.
export function LanguageSelect() {
  const t = useT();
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);
  return (
    <select
      className="lang-select"
      aria-label={t('lang.label')}
      value={lang}
      onChange={(e) => setLang(e.target.value as Lang)}
    >
      {LANGS.map((l) => (
        <option key={l} value={l}>
          {LANG_NAMES[l]}
        </option>
      ))}
    </select>
  );
}
````

#### `frontend/src/components/ThemeSelect.tsx`

그대로 쓴다.

````tsx
import { useT } from '../i18n';
import { THEMES, type ThemePref } from '../lib/theme';
import { useThemeStore } from '../lib/themeStore';

// FR-19, L-23: 화면 모드 선택. 언어 선택 옆에 둔다.
export function ThemeSelect() {
  const t = useT();
  const pref = useThemeStore((s) => s.pref);
  const setPref = useThemeStore((s) => s.setPref);
  return (
    <select
      className="lang-select"
      aria-label={t('theme.label')}
      value={pref}
      onChange={(e) => setPref(e.target.value as ThemePref)}
    >
      {THEMES.map((p) => (
        <option key={p} value={p}>
          {t(`theme.${p}`)}
        </option>
      ))}
    </select>
  );
}
````

#### `frontend/src/components/FormError.tsx`

폼·화면 상단 오류. 서버 문구를 선택한 언어로 표시. 그대로 쓴다.

````tsx
import { useTranslateMessage } from '../i18n';
import styles from './FormError.module.css';

export function FormError({ message }: { message?: string }) {
  const tr = useTranslateMessage();
  if (!message) return null;
  return (
    <p role="alert" className={styles.error}>
      {tr(message)}
    </p>
  );
}
````

#### `frontend/src/components/FormError.module.css`

````css
.error {
  margin-bottom: var(--space-3);
  padding: var(--space-3);
  background: var(--danger-soft);
  border-left: 3px solid var(--danger);
  color: var(--danger);
  font-size: var(--fs-md);
}
````

#### `frontend/src/components/FieldError.tsx`

입력란 옆 오류(같은 묶음 입력란 테두리를 빨강으로 바꾸는 표식 포함). 그대로 쓴다.

````tsx
import { useTranslateMessage } from '../i18n';
import styles from './FieldError.module.css';

export function FieldError({ message }: { message?: string }) {
  const tr = useTranslateMessage();
  if (!message) return null;
  return (
    <p className={styles.error} data-field-error>
      {tr(message)}
    </p>
  );
}
````

#### `frontend/src/components/FieldError.module.css`

````css
.error {
  margin-top: var(--space-1);
  color: var(--danger);
  font-size: var(--fs-sm);
}
````

#### `frontend/src/styles/global.css`

디자인 토큰(밝은·어두운)·기본 요소·상태 칩. **바꿀 곳**: 색 값은 새 스타일 가이드 2장, 상태색(`--st-*`)은 새 앱의 상태에 맞춘다.

````css
*,
*::before,
*::after {
  box-sizing: border-box;
}

* {
  margin: 0;
}

/* 토큰 단일 출처. 값은 docs/style-guide.md 2~4장과 같다(SG-04). */
:root {
  --bg: #ffffff;
  --surface-muted: #f7f8fa;
  --border: #dcdfe4;
  --divider: #eceef1;
  --text-strong: #1f2328;
  --text: #3c4043;
  --text-muted: #5f6368;
  --text-hint: #9aa0a6;
  --primary: #6a5ae0;
  --primary-strong: #5646c8;
  --primary-soft: #f0eefd;
  --primary-text: #4b3fb8;
  --today-bg: #f2f6fb;
  --sunday: #c5221f;
  --danger: #c5221f;
  --danger-fill: #c5221f; /* 위험 버튼 배경: 흰 글자 대비 5.8:1, 두 모드 공통 */
  --danger-soft: #fce8e6;
  --overlay: rgba(31, 35, 40, 0.4);
  --week-alt-bg: #f8f9fb;
  --on-primary: #ffffff;
  --shadow-dialog: 0 8px 24px rgba(31, 35, 40, 0.16);
  --shadow-card: 0 1px 3px rgba(31, 35, 40, 0.08);

  /* 상태색 ST-01~04 (style-guide 2.2) */
  --st-progress-bg: #6a5ae0;
  --st-progress-fg: #ffffff;
  --st-todo-bg: #f0eefd;
  --st-todo-fg: #4b3fb8;
  --st-overdue-bg: #c24e28;
  --st-overdue-fg: #ffffff;
  --st-done-bg: #e8eaed;
  --st-done-fg: #5f6368;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;

  --radius-xs: 2px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-pill: 999px;

  --font: "Noto Sans KR", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif;
  --fs-xs: 12px;
  --fs-sm: 13px;
  --fs-md: 14px;
  --fs-base: 15px;
  --fs-lg: 17px;
  --fs-xl: 22px;

  --page-gutter: 16px;
  --control-h: 40px;
  color-scheme: light;
}

/* P-29·FR-19: 어두운 모드. data-theme은 lib/themeStore.ts·index.html이 정한다. 값은 style-guide 2.1.1 */
:root[data-theme="dark"] {
  color-scheme: dark;
  --bg: #16181d;
  --surface-muted: #1e2128;
  --border: #3a3f4a;
  --divider: #2a2e36;
  --text-strong: #eceef1;
  --text: #c9ccd2;
  --text-muted: #9aa0aa;
  --text-hint: #6b717c;
  --primary-strong: #7d6ff0;
  --primary-soft: #2a2550;
  --primary-text: #b8afff;
  --today-bg: #1f2836;
  --week-alt-bg: #1b1e24;
  --sunday: #ff7b72;
  --danger: #ff7b72;
  --danger-soft: #3b1d1d;
  --overlay: rgba(0, 0, 0, 0.6);
  --st-todo-bg: #2a2550;
  --st-todo-fg: #c4bdff;
  --st-done-bg: #2c3038;
  --st-done-fg: #a5abb5;
  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.5);
  --shadow-dialog: 0 12px 32px rgba(0, 0, 0, 0.6);
}

@media (min-width: 768px) {
  :root {
    --page-gutter: 32px;
    --control-h: 36px;
  }
}

body {
  accent-color: var(--primary);
  background: var(--bg);
  color: var(--text);
  font-family: var(--font);
  font-size: var(--fs-base);
  line-height: 1.5;
}

/* 3장: 화면 제목 22px, 굵기는 400·700 두 가지만 */
h1 {
  margin-bottom: var(--space-3);
  color: var(--text-strong);
  font-size: var(--fs-xl);
  font-weight: 700;
}

a {
  color: var(--primary-text);
}

/* 등록 이동처럼 페이지를 옮기는 주 동작은 링크를 주 버튼 모양으로(5.1) */
a.primary {
  display: inline-flex;
  align-items: center;
  height: var(--control-h);
  padding: 0 var(--space-4);
  border-radius: var(--radius-sm);
  background: var(--primary);
  color: var(--on-primary);
  text-decoration: none;
}

a.primary:hover {
  background: var(--primary-strong);
}

button,
input,
select,
textarea {
  font: inherit;
  color: inherit;
}

button {
  height: var(--control-h);
  padding: 0 var(--space-4);
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  cursor: pointer;
}

button.primary {
  background: var(--primary);
  border-color: var(--primary);
  color: var(--on-primary);
}

button.primary:hover:not(:disabled) {
  background: var(--primary-strong);
  border-color: var(--primary-strong);
}

button.danger {
  background: var(--danger-fill);
  border-color: var(--danger-fill);
  color: var(--on-primary);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

input,
select,
textarea {
  width: 100%;
  min-width: 0;
  height: 40px;
  padding: 0 var(--space-3);
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}

input:focus,
select:focus,
textarea:focus {
  border-color: var(--primary);
}

/* 5.3 읽기 전용: 수정할 수 없음을 모양으로 보여 준다 */
input[readonly],
input[readonly]:focus {
  background: var(--surface-muted);
  border-color: var(--divider);
  color: var(--text-muted);
}

/* 5.3 오류 상태: 같은 필드 묶음에 FieldError가 있으면 입력란 테두리를 빨강으로 */
:has(> [data-field-error]) > :is(input, select, textarea) {
  border-color: var(--danger);
}

textarea {
  height: auto;
  min-height: 96px;
  padding: var(--space-2) var(--space-3);
  resize: vertical;
}

:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

/* P-26·P-27: 제목 앞 이모지·시작 시간(TodoTitle) */
.todo-emoji,
.todo-time {
  margin-right: var(--space-1);
}

.todo-time {
  font-variant-numeric: tabular-nums;
}

/* FR-18·L-23 언어 선택 상자(style-guide 5.5) */
.lang-select {
  width: auto;
  height: 32px;
  padding: 0 var(--space-2);
  font-size: var(--fs-sm);
}

.lang-row {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-1);
}

.chip {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 var(--space-2);
  border-radius: var(--radius-pill);
  font-size: var(--fs-sm);
  white-space: nowrap;
}

/* 상태 칩·캘린더 막대 공통: data-status로 상태색 쌍을 고른다 */
[data-status="in_progress"] {
  --st-bg: var(--st-progress-bg);
  --st-fg: var(--st-progress-fg);
}

[data-status="not_started"] {
  --st-bg: var(--st-todo-bg);
  --st-fg: var(--st-todo-fg);
}

[data-status="overdue"] {
  --st-bg: var(--st-overdue-bg);
  --st-fg: var(--st-overdue-fg);
}

[data-status="completed"] {
  --st-bg: var(--st-done-bg);
  --st-fg: var(--st-done-fg);
}

.chip[data-status] {
  background: var(--st-bg);
  color: var(--st-fg);
}
````
