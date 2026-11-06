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
- 오류 화면: 최상위 경로에 `errorElement`(`app/RouteError.tsx`, 문구 + 새로고침 버튼). 렌더링 오류와 재배포 뒤 옛 청크 로드 실패를 새로고침으로 복구.
- 폼 초기화: 저장 성공 콜백은 목록 재조회 뒤에 오므로, 입력란은 보낸 값이 그대로일 때만 비운다(연속 입력 유실 방지).
- 테스트: Vitest로 순수 함수만(날짜, 캘린더 배치, 검증, 이모지 규칙, 번역). 화면은 Playwright로 실측.

### 배포 (선택: Vercel + Supabase)
- **DB**: Supabase PostgreSQL에 `docs/schema.sql` 적용. 서버리스용 접속은 pooler URL. 함수 인스턴스마다 풀이 생기므로 `DB_POOL_MAX`는 작게(예: 1~3).
- **백엔드 프로젝트**: Root Directory `backend`, 프레임워크 Express. 진입점은 `src/app.js`의 default export(앱 인스턴스) — 부록 B `app.js`에 이미 있다. `backend/vercel.json`의 `regions`를 **DB와 같은 지역**으로(Supabase `ap-southeast-1` → `sin1`). 기본 `iad1`이면 쿼리마다 대륙 간 왕복.
- **백엔드 환경변수**: `DATABASE_URL`, `JWT_SECRET`(48자 이상, 2.2-6 명령으로 새로 생성), `NODE_ENV=production`, `CORS_ORIGIN=<프론트 운영 주소>`, 토큰 만료 값. 잘못되면 `config.js`가 기동을 막고 런타임 로그에 이유가 찍힌다.
- **프론트 프로젝트**: Root Directory `frontend`, 프레임워크 Vite. `frontend/vercel.json`으로 `/api/*`를 백엔드 주소로 rewrite하고 나머지는 `/index.html`(SPA). `VITE_API_BASE_URL`은 **프론트 자기 주소**. `*.vercel.app`은 공개 접미사라 백엔드를 직접 부르면 다른 사이트가 되어 `SameSite=Lax` 쿠키가 실리지 않는다.
- **확인 순서**: 프로젝트 목록(같은 저장소에 중복 프로젝트가 없는지) → 백엔드 `/api/health` 200 → 프론트 주소의 `/api/health`(rewrite) 200 → 브라우저 로그인 후 새로고침해도 유지 → 운영 스모크 검사(9.2) → 결과를 `test/e2e/smoke-prod/report.md`에.
- 배포 직후 이전 화면을 열어 둔 브라우저는 옛 번들을 쓴다. 증상이 안 바뀌면 강력 새로고침부터.

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
- [ ] 결과를 README 검증 기록(또는 `test/e2e/report.md`)에 남김
- [ ] 배포했다면 운영 주소로 스모크 검사: 가입 → 카테고리 → 할일 등록·수정·완료·삭제 → 캘린더 → 내 정보 → 언어·화면 모드 → 로그아웃·재로그인·주소 직접 진입. 테스트 계정은 지울 수 있게 이메일 접두사를 정해 둔다

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
| 다른 출처 API에서 쿠키 안 실림 | 같은 사이트 배치 + `SameSite=Lax` + `credentials: 'include'`. Vercel은 `*.vercel.app`끼리도 다른 사이트 → 프론트 `vercel.json` rewrite로 같은 출처 |
| 캘린더 날짜 계산에 `Date`·`toISOString` 사용 | 날짜는 문자열, 로컬 컴포넌트로만 계산 |
| 화면 모드 전환 시 첫 화면 깜빡임 | index.html 인라인 스크립트로 `data-theme` 선적용 |
| 다크 모드에서 밝은 빨강 버튼 위 흰 글자 | 글자용 색과 채움용 색 토큰 분리(`--danger` / `--danger-fill`) |
| Windows에 PostgreSQL을 깔아도 `psql`이 PATH에 없음 | DB 생성·조회는 `backend`의 `pg`로 `node -e`(2.2-5) |
| `@guide/ai-playbook.md`로 붙이면 약 108KB 전체가 컨텍스트에 들어감 | 경로만 말하고 부록 앞까지 읽게 한다. 부록은 추출 스크립트로 |
| 부록 코드를 AI가 손으로 옮겨 적다 한 글자씩 틀림 | `guide/extract.mjs`로 기계적으로 만든다 |
| 루트에서 `npx biome`을 치면 무관한 `biome` 패키지를 내려받아 실행 | biome은 `backend`(또는 `frontend`)에서 실행한다 |
| npm 11이 `bcrypt` 설치 스크립트 경고(`install-scripts`) | 미리 빌드된 바이너리로 동작한다. 무시(승인 불필요) |
| 한국어 Windows PostgreSQL 오류 메시지가 깨져 보임 | 메시지 대신 오류 코드(`28P01` 등)로 판단 |
| Vercel `Invalid export found in module …/src/app.js` | `src/app.js`에서 앱 인스턴스를 default export |
| Vercel 배포 뒤 500, 런타임 로그는 비어 보임 | 같은 저장소에 연결된 다른 프로젝트의 로그일 수 있다. 프로젝트 목록·도메인부터 확인 |
| SPA 경로에서 새로고침하면 404 | `vercel.json` rewrite `/(.*)` → `/index.html` |
| 운영에서만 응답이 느림 | 함수 리전과 DB 리전을 맞춘다(`regions`) |
| `.env prod`처럼 공백으로 이은 비밀 파일이 커밋 대상 | `.gitignore`에 `.env *` |
| 사내망에서 Supabase DB 포트(5432·6543) 차단 | 운영 데이터 정리는 Supabase SQL Editor 또는 Supabase MCP(HTTPS) |
