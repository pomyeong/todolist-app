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

{{EXTRACT}}
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
2. **오버엔지니어링 금지**: 요청 범위만 한다. 몇 줄로 되면 라이브러리를 추가하지 않는다. 추가하면 구조 원칙 문서(PD)에 이유를 적는다.
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
