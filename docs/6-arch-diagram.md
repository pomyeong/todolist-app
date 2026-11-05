# TodoList 기술 아키텍처 다이어그램

## 문서 이력

### 버전 이력

| 버전 | 일자 | 작성자 | 상태 | 비고 |
|---|---|---|---|---|
| v0.1 | 2026-11-04 | pmsong | 초안 | 최초 작성 |
| v0.2 | 2026-11-04 | pmsong | 초안 | 데이터 구조(물리 ERD, AD-04) 추가 |
| v0.3 | 2026-11-04 | pmsong | 초안 | AD-04를 폐기하고 ERD를 7-erd.md로 분리 |
| v0.4 | 2026-11-04 | pmsong | 초안 | SD-02에 refresh 토큰 갱신 흐름 반영 |
| v0.5 | 2026-11-04 | pmsong | 초안 | 문서 간 정합성 검토 반영 |
| v0.6 | 2026-11-04 | Claude | 초안 | 참조 버전 동기화 |
| v0.7 | 2026-11-05 | Claude | 초안 | 부하 테스트 제외 |
| v0.8 | 2026-11-05 | Claude | 초안 | 프록시 대신 CORS |

### 변경 이력

| 버전 | 일자 | 변경 위치 | 변경 내용 | 변경 사유 | 작성자 |
|---|---|---|---|---|---|
| v0.1 | 2026-11-04 | 전체 | 최초 작성 | - | pmsong |
| v0.2 | 2026-11-04 | AD-04, 머리말, 4장 | 테이블·컬럼·타입·제약·인덱스를 그린 물리 ERD와 도메인 속성 대응표 추가 | `schema.sql` 작성 기준이 되는 데이터 구조 그림 필요 | pmsong |
| v0.3 | 2026-11-04 | AD-04, 머리말, 1장, 4장 | AD-04 본문(ERD·제약 표·설계 메모)을 삭제하고 개요 표는 '폐기'로 표시, 머리말·커버리지 갱신 | ERD가 개념·물리·테이블 명세·결정으로 커져 [ERD v0.1](./7-erd.md)로 분리 | pmsong |
| v0.4 | 2026-11-04 | SD-02, 참조 문서 | access 토큰 만료 시 `api/client.ts`의 갱신 후 재요청, 갱신 실패 시 전역 401 처리. 참조 버전 PRD v0.10, 시나리오 v0.8, 구조 설계 원칙 v0.3, ERD v0.2 | PRD v0.10 P-04 | pmsong |
| v0.5 | 2026-11-04 | AD-02, AD-03, SD-01 | access 토큰(HS384) 검증, 인증 경계 제외 목록에 refresh 추가, 401 시 `api/client.ts` 갱신 후 전역 처리, 가입 시 refresh 토큰 INSERT와 두 쿠키 발급(1일 쿠키 삭제) | PRD v0.10 P-04·구조 설계 원칙 v0.3 반영 누락(SD-02만 갱신됨) | pmsong |
| v0.5 | 2026-11-04 | 참조 문서 | PRD v0.10 → v0.11, 시나리오 v0.8 → v0.9, 와이어프레임 v0.3 → v0.4, 구조 설계 원칙 v0.3 → v0.4, ERD v0.2 → v0.3 | 버전 동기화 | pmsong |
| v0.6 | 2026-11-04 | 참조 문서 | 도메인 v0.6 → v0.7, PRD v0.11 → v0.12, 시나리오 v0.9 → v0.10, 와이어프레임 v0.4 → v0.5, 구조 설계 원칙 v0.4 → v0.5, ERD v0.3 → v0.4 | 버전 동기화 | Claude |
| v0.7 | 2026-11-05 | AD-01, 4.3, 참조 문서 | k6 노드와 설명 삭제. PRD v0.12 → v0.13, 구조 설계 원칙 v0.5 → v0.6 | PRD v0.13 부하 테스트 제외 | Claude |
| v0.8 | 2026-11-05 | AD-01, 프론트 구조 | Vite 프록시 노드를 없애고 브라우저가 API(:3000)를 CORS로 직접 호출 | PRD v0.15 P-04, 구조 설계 원칙 v0.10 PR-S-04 | Claude |

> 단일 출처 원칙: 용어, 엔티티, 상태 규칙(ST), 비즈니스 규칙(BR), 유스케이스(UC)는 [도메인 정의서 v0.7](./1-domain-definition.md)이, 기능(FR)·화면(SCR)·비기능(NFR)·목표(G)·일정(M)·리스크(R)·결정(P)은 [PRD v0.13](./2-PRD.md)이, 시나리오(SC)는 [사용자 시나리오 v0.10](./3-user-scenario.md)이, 화면 배치(WF·L)는 [와이어프레임 v0.5](./4-wireframe.md)이, 구조(PR·PD)는 [프로젝트 구조 설계 원칙 v0.6](./5-project-principle.md)이, 데이터 구조(ERD-xx·DB-xx)는 [ERD v0.4](./7-erd.md)이 정의한다. 이 문서는 해당 ID를 참조만 하며 규칙·오류 코드·수치를 다시 정의하지 않는다. 충돌하면 도메인 정의서 > PRD > 시나리오 > 와이어프레임 > 프로젝트 구조 설계 원칙 > 이 문서 순으로 따른다.
>
> ID 운영 원칙: 다이어그램 ID(AD-xx 구조, SD-xx 순서)는 재사용하거나 재번호하지 않는다. 다이어그램을 없애면 행을 지우지 말고 '폐기'로 표시한다.
>
> 데이터 구조(개념 ERD, 물리 ERD, 테이블·제약·인덱스)는 [ERD v0.4](./7-erd.md)이 정의하고, 이 문서에는 그리지 않는다. 엔티티·관계의 정의는 [도메인 정의서 3.4](./1-domain-definition.md)가 맡는다. 오류 코드는 NFR-15에 있는 것만 쓴다.

## 1. 개요

| ID | 종류 | 제목 | 근거 문서 |
|---|---|---|---|
| AD-01 | 구조 | 시스템 컨텍스트와 배포 구성 | P-10, PR-S-04, PR-S-11 |
| AD-02 | 구조 | 백엔드 레이어와 모듈 의존 | 구조 원칙 3.1, 7.2 |
| AD-03 | 구조 | 프론트엔드 레이어와 상태 분담 | 구조 원칙 3.1, 7.3, PRD 6장 |
| AD-04 | 구조 | 폐기(v0.3) → 7-erd.md로 이동 | [ERD v0.4](./7-erd.md) ERD-02 |
| SD-01 | 순서 | 회원가입 트랜잭션 | FR-01, NFR-10 |
| SD-02 | 순서 | 인증 미들웨어와 401 전역 처리 | FR-04, PR-L-12 |
| SD-03 | 순서 | 할일 목록 조회 | FR-09, P-14, PD-17 |
| SD-04 | 순서 | 캘린더 기간 조회 | FR-10~12, P-16 |
| SD-05 | 순서 | 완료 토글 | FR-07, P-15, P-22 |
| SD-06 | 순서 | 카테고리 삭제 트랜잭션 | FR-13, BR-14 |
| SD-07 | 순서 | 할일 등록·수정 검증과 타인 카테고리 지정 | FR-05, FR-06, BR-04 |

## 2. 구조 다이어그램

### AD-01 시스템 컨텍스트와 배포 구성

```mermaid
flowchart LR
    subgraph PC["로컬 단일 머신 (P-10)"]
        BR["브라우저<br/>Chrome / Edge / Safari / Firefox"]
        subgraph FE["Vite 개발 서버 :5173"]
            ST["React 앱 정적 자원"]
        end
        subgraph BE["Node 단일 프로세스 :3000"]
            EX["Express 5<br/>pg Pool 하나"]
        end
        DB[("PostgreSQL 17<br/>todolist / todolist_test")]
    end

    BR -->|"페이지, JS"| ST
    BR -->|"/api 요청 + 인증 쿠키<br/>CORS (credentials)"| EX
    EX -->|"SQL 파라미터 바인딩"| DB
```

브라우저는 화면을 Vite 서버(:5173)에서, API를 Express(:3000)에서 직접 받는다. 출처가 달라 Express가 CORS로 `CORS_ORIGIN` 하나만 쿠키 포함 요청을 허용한다(PR-S-04). 두 서버는 같은 사이트(localhost)라 `SameSite=Lax` 쿠키가 실린다. 운영도 같은 방식이며 프론트와 API를 같은 사이트에 둔다. 운영 배포(호스팅, HTTPS)는 범위 외다.

관련 ID: P-04, P-10, NFR-02, NFR-03, PR-S-04, PR-S-11

### AD-02 백엔드 레이어와 모듈 의존

```mermaid
flowchart TB
    SRV["server.js<br/>listen, 종료 시 pool.end"] --> APP["app.js<br/>미들웨어·라우터 조립"]
    SRV --> CFG["config.js<br/>환경변수 단일 입구"]
    APP --> AUTHMW["middleware/auth.js<br/>access 토큰(HS384) 검증, req.userId"]
    APP --> ERRMW["middleware/error.js<br/>NFR-15 형식 응답"]
    APP --> RT

    subgraph RT["routes: HTTP 입출력만"]
        R0["index.js<br/>인증 경계"]
        R1["auth.js"]
        R2["me.js"]
        R3["categories.js"]
        R4["todos.js"]
        R5["calendar.js"]
    end

    subgraph SV["services: 규칙·SQL·트랜잭션"]
        S1["auth.js"]
        S2["users.js"]
        S3["categories.js"]
        S4["todos.js<br/>목록·캘린더·CRUD·완료"]
    end

    subgraph DM["domain: I/O 없는 순수 함수"]
        D1["validate.js"]
        D2["status.js<br/>ST-01~04"]
    end

    DBJS[("db.js<br/>Pool, query, withTransaction")]
    ERR["errors.js<br/>AppError, 오류 코드 상수"]

    R0 -.->|"auth 먼저 적용"| AUTHMW
    RT -->|"요청 값 검증"| D1
    R1 --> S1
    R2 --> S2
    R3 --> S3
    R4 --> S4
    R5 --> S4
    SV --> DBJS
    S4 --> D2
    S1 --> D1
    SV -.->|"throw AppError"| ERR
    D1 -.->|"throw AppError"| ERR
    ERR -.->|"catch"| ERRMW
    DBJS --> CFG
```

의존은 위에서 아래로만 흐른다. routes는 SQL을 직접 실행하지 않고, domain은 다른 모듈을 import하지 않는다. 모든 오류는 `AppError`로 던져 `middleware/error.js` 한 곳에서만 응답으로 바꾼다. `auth` 미들웨어는 `routes/index.js`가 signup, login, refresh, logout, health를 제외한 모든 라우트 앞에 건다.

관련 ID: PR-L-01~08, PR-N-07, PR-S-01, PR-S-05, NFR-07, NFR-08, NFR-15, G-04

### AD-03 프론트엔드 레이어와 상태 분담

```mermaid
flowchart TB
    MAIN["main.tsx<br/>QueryClient + RouterProvider"]
    subgraph APPD["app"]
        RTR["router.tsx<br/>경로 7개, 리다이렉트"]
        RA["RequireAuth.tsx"]
        AL["AppLayout.tsx<br/>내비게이션, 상단 오류, 갱신 중"]
    end
    PG["pages<br/>경로 단위 조합만"]
    subgraph FT["features: 컴포넌트·훅·스토어"]
        FA["auth"]
        FTD["todos"]
        FC["calendar"]
        FCT["categories"]
    end
    subgraph ST2["상태 보관 위치 (PR-L-10)"]
        ZS["Zustand<br/>로그인 사용자, 목록 필터,<br/>캘린더 선택 날짜"]
        TQ["TanStack Query<br/>할일·카테고리·캘린더 서버 데이터"]
    end
    API["api<br/>client.ts, types.ts, queryKeys.ts"]
    SHARED["components, lib<br/>어느 층에서나 import"]
    BACK["API 서버 (VITE_API_BASE_URL, CORS)"]
    URL["URL 쿼리<br/>캘린더 view, date"]

    MAIN --> RTR
    RTR --> RA --> AL --> PG
    PG --> FT
    FT --> API
    FT --> SHARED
    PG --> SHARED
    FT -->|"UI 상태"| ZS
    FT -->|"조회·변경"| TQ
    FC --> URL
    TQ --> API
    API -->|"fetch 상대 경로"| BACK
    API -.->|"401: refresh 1회 후 재요청"| BACK
    BACK -.->|"갱신도 실패한 401 UNAUTHORIZED"| MAIN
    MAIN -.->|"QueryCache·MutationCache onError:<br/>Zustand와 캐시 비움, /login 이동"| ZS
```

서버 데이터는 TanStack Query에만, UI 상태는 Zustand에만 두며 서로 복사하지 않는다. 토큰은 어디에도 저장하지 않고 httpOnly 쿠키만 쓴다. 401 `UNAUTHORIZED`는 먼저 `api/client.ts`가 refresh 토큰으로 한 번 갱신해 다시 요청하고, 갱신도 실패한 401만 어떤 API에서 오든 `main.tsx`의 QueryClient `onError` 한 곳에서 처리한다(PR-L-12). features끼리는 직접 import하지 않는다.

관련 ID: PRD 6장, PR-L-09~12, FR-04, P-04, P-12, P-15, P-23, PD-04

### AD-04 데이터 구조 (물리 ERD)

폐기(v0.3). [ERD v0.4](./7-erd.md)로 이동했다.

## 3. Sequence Diagram

### SD-01 회원가입 트랜잭션

```mermaid
sequenceDiagram
    actor U as 사용자
    participant FE as SignupForm
    participant RT as routes/auth.js
    participant VD as domain/validate.js
    participant SV as services/auth.js
    participant DB as PostgreSQL

    U->>FE: 이메일, 비밀번호, 확인, 이름 입력
    alt 비밀번호와 확인 불일치 (P-24)
        FE-->>U: 확인란 옆에 불일치 사유 표시, 요청 안 보냄
    end
    FE->>RT: POST /api/auth/signup
    RT->>VD: 이메일 형식, BR-21, BR-22 검증
    alt 검증 실패
        VD-->>RT: throw AppError 400 VALIDATION_ERROR
        RT-->>FE: 400 VALIDATION_ERROR + fields
        FE-->>U: 입력란 옆에 사유 표시
    end
    RT->>SV: signup(input)
    SV->>SV: bcrypt 해시 (cost 10)
    SV->>DB: BEGIN (withTransaction)
    SV->>DB: INSERT users
    alt 이메일 중복 (23505, uq_users_email)
        DB-->>SV: unique violation
        SV->>DB: ROLLBACK
        SV-->>RT: throw AppError 409 DUPLICATE_EMAIL
        RT-->>FE: 409 DUPLICATE_EMAIL
        FE-->>U: 폼 상단에 message 표시
    else 성공
        SV->>DB: INSERT categories (이름 기본, is_default true)
        SV->>DB: INSERT refresh_tokens (token_hash, expires_at)
        SV->>DB: COMMIT
        SV->>SV: access 토큰 JWT 서명 (HS384, sub = 사용자 id, 15분)
        SV-->>RT: 사용자, access 토큰, refresh 토큰
        RT-->>FE: 201 + Set-Cookie access_token(15분), refresh_token(7일, path=/api/auth)
        FE->>FE: Zustand에 사용자 보관, /todos 이동
    end
```

사용자, 기본 카테고리, refresh 토큰은 한 트랜잭션이라 일부만 생기는 일이 없다. refresh 토큰은 해시만 저장한다(DB-13). 해시 계산은 트랜잭션 밖에서 해 커넥션 점유를 줄인다. 이메일 중복은 제약 이름(`uq_users_email`)으로 구분해 409로 바꾼다. 가입 성공 응답이 곧 로그인(쿠키 발급)이다.

관련 ID: FR-01, UC-01, BR-02, BR-10, BR-21, BR-22, NFR-06, NFR-09, NFR-10, NFR-15, P-04, P-24, PR-L-06, PR-N-04, PR-S-03, PD-22, PD-25, DB-13, SC-01

### SD-02 인증 미들웨어와 401 전역 처리

```mermaid
sequenceDiagram
    actor U as 사용자
    participant FE as 화면 (features)
    participant CL as api/client.ts
    participant QC as QueryClient onError
    participant RT as routes/index.js
    participant AM as middleware/auth.js
    participant SV as services
    participant EM as middleware/error.js
    participant DB as PostgreSQL

    U->>FE: 보호된 화면 조작
    FE->>CL: API 함수 호출
    CL->>RT: /api 요청 (access_token 쿠키 자동 전송)
    RT->>AM: 인증 경계 통과
    alt 유효한 access 토큰
        AM->>AM: JWT 검증(HS384만 허용), sub를 req.userId로
        AM->>SV: 다음 핸들러
        SV-->>FE: 응답
    else access 토큰 없음, 만료, 위조
        AM-->>EM: throw AppError 401 UNAUTHORIZED
        EM-->>CL: 401 UNAUTHORIZED
        CL->>RT: POST /api/auth/refresh (refresh_token 쿠키, 같은 탭은 1건 공유)
        RT->>SV: services/auth.js 회전
        SV->>DB: DELETE refresh_tokens WHERE token_hash = $1 AND expires_at > now() RETURNING user_id
        alt refresh 토큰 유효
            SV->>DB: INSERT 새 refresh 토큰 해시
            SV-->>CL: 204, 새 access_token·refresh_token 쿠키
            CL->>RT: 원래 요청 1회 재전송
            RT-->>FE: 응답
        else refresh 토큰 없음, 만료, 이미 사용됨
            SV-->>CL: 401 UNAUTHORIZED, 두 쿠키 삭제
            CL-->>FE: ApiError 401 UNAUTHORIZED
            FE->>QC: 쿼리 또는 변경 실패 전달
            QC->>QC: code가 UNAUTHORIZED인지 확인
            QC->>QC: Zustand와 쿼리 캐시 비움
            QC-->>U: /login 이동 (SCR-01)
        end
    end
    opt 대상 아님 - 첫 진입 GET /api/me 401 (PD-24)
        FE->>RT: GET /api/me
        RT-->>FE: 401 UNAUTHORIZED (갱신도 실패한 뒤)
        FE->>FE: 로그인 안 됨으로 보관, 이동하지 않음
        FE-->>U: RequireAuth가 보호 경로만 /login으로, /login·/signup은 그대로
    end
    opt 로그인 실패는 대상 아님
        FE->>RT: POST /api/auth/login
        RT-->>FE: 401 INVALID_CREDENTIALS
        FE-->>U: 폼 상단에 message 표시, 이동 없음
    end
```

인증은 기본 적용이고 공개 라우트만 예외로 열어 둔다. access 토큰이 만료되면 `api/client.ts`가 refresh 토큰으로 한 번 갱신하고 원래 요청을 다시 보낸다(PR-L-12). 갱신도 실패해 401 `UNAUTHORIZED`가 올라오면 화면은 어느 API에서든 같은 방식으로 로그인 화면으로 이동한다. `INVALID_CREDENTIALS`와 첫 진입 로그인 확인(`GET /api/me`)의 401은 이 처리 대상이 아니라서, 미로그인 상태로 `/login`을 열 때 이동이 반복되지 않는다(PD-24).

관련 ID: FR-02, FR-03, FR-04, BR-01, NFR-02, NFR-15, P-04, P-23, PD-24, PD-26, PR-S-03, PR-S-05, PR-L-12, DB-13, SC-02

### SD-03 할일 목록 조회

```mermaid
sequenceDiagram
    actor U as 사용자
    participant FE as TodoListPage
    participant TQ as TanStack Query
    participant RT as routes/todos.js
    participant VD as domain/validate.js
    participant SV as services/todos.js
    participant DB as PostgreSQL
    participant ST as domain/status.js

    U->>FE: 목록 열기 또는 필터 변경
    FE->>TQ: key = todos, 필터, today
    TQ->>RT: GET /api/todos?categoryId&status&today
    RT->>VD: today 형식, status 값, categoryId 검증
    alt today 누락 또는 잘못됨, status가 PD-19 값 아님
        VD-->>RT: throw AppError
        RT-->>TQ: 400 VALIDATION_ERROR
        TQ-->>FE: 화면 상단에 오류 표시
    end
    RT->>SV: listTodos(userId, 필터)
    opt categoryId 지정
        SV->>DB: SELECT categories WHERE id AND user_id
        alt 0행 (타인 또는 없음)
            SV-->>RT: throw AppError 404 NOT_FOUND
            RT-->>TQ: 404 NOT_FOUND
        end
    end
    SV->>DB: SELECT todos JOIN categories<br/>WHERE user_id (+ category_id)<br/>ORDER BY 종료일, createdAt, id
    DB-->>SV: 행 목록
    loop 각 행
        SV->>ST: deriveStatus(todo, today)
    end
    opt status 지정
        SV->>SV: JS에서 상태 일치 행만 남김 (PD-17)
    end
    SV-->>RT: 상태가 포함된 할일 목록
    RT-->>TQ: 200
    TQ-->>FE: 렌더링 (0건이면 안내 문구)
```

카테고리 필터는 소유권 확인 뒤 SQL이, 상태 필터는 판정 함수가 처리한다. 두 필터는 AND이고 정렬은 필터와 무관하게 BR-20이다. 상태는 서버가 `today`로 한 번만 판정하고 화면은 표시만 한다. 판정 순서는 입력 검증(400) → 소유권(404)이다(PD-22).

관련 ID: FR-09, UC-09, BR-03, BR-15, BR-20, ST-01~04, NFR-04, NFR-07, NFR-12, P-11, P-12, P-14, PD-17, PR-L-05, PR-L-08, SC-08

### SD-04 캘린더 기간 조회

```mermaid
sequenceDiagram
    actor U as 사용자
    participant FE as CalendarPage
    participant RG as features/calendar/range.ts
    participant TQ as TanStack Query
    participant RT as routes/calendar.js
    participant SV as services/todos.js
    participant DB as PostgreSQL
    participant CT as features/calendar/cellTodos.ts

    U->>FE: /calendar?view&date 열기 또는 이동
    FE->>RG: view, date로 조회 기간 계산
    RG-->>FE: from, to (월 1일~말일, 주 일~토, 일 하루)
    FE->>TQ: key = calendar, from, to, today
    TQ->>RT: GET /api/calendar?from&to&today
    RT->>RT: from, to, today 형식과 from가 to 이하인지 검증
    alt 날짜 형식 오류 또는 from가 to보다 큼
        RT-->>TQ: 400 VALIDATION_ERROR
        TQ-->>FE: 화면 상단에 오류 표시
    end
    RT->>SV: listCalendar(userId, from, to, today)
    SV->>DB: SELECT todos JOIN categories<br/>WHERE user_id AND start_date <= to AND end_date >= from<br/>ORDER BY 종료일, createdAt, id
    DB-->>SV: 기간과 겹치는 할일 (완료 포함)
    SV->>SV: 각 행에 deriveStatus(todo, today)
    SV-->>RT: 상태가 포함된 할일 목록
    RT-->>TQ: 200
    TQ-->>FE: 할일 목록 (서버 정렬 순서)
    FE->>CT: 날짜별로 start 이하 end 이상인 할일 선택
    CT-->>FE: 칸별 할일 (서버 순서 유지)
    alt 데스크톱 월·주 뷰
        FE-->>U: 칸마다 제목과 상태, 3건 초과 시 +N<br/>앞뒤 채움 칸은 빈 칸 (PD-23)
    else 모바일 월·주 뷰
        FE-->>U: 칸에는 개수 점, 선택한 날짜의 목록은 아래에
    else 일 뷰
        FE-->>U: 그날 할일 전체 목록
    end
```

월·주·일 뷰는 같은 API를 쓰며 기간만 다르다. 기간 계산과 칸 배치는 프론트의 순수 함수가, 겹침 조건과 정렬은 SQL 한 곳이 맡는다. 여러 날에 걸친 할일은 기간 안 모든 날짜 칸에 반복 표시한다.

관련 ID: FR-10, FR-11, FR-12, FR-16, UC-10, BR-16, BR-17, BR-18, BR-19, BR-20, NFR-04, NFR-11, P-12, P-14, P-16, P-20, P-23, PR-C-05, PR-T-06, SC-09, SC-10

### SD-05 완료 토글

```mermaid
sequenceDiagram
    actor U as 사용자
    participant FE as TodoRow
    participant TQ as TanStack Query
    participant RT as routes/todos.js
    participant SV as services/todos.js
    participant DB as PostgreSQL

    U->>FE: 완료 토글 조작
    FE->>FE: 그 행의 토글과 삭제만 비활성화 (P-22)
    FE->>TQ: mutate (낙관적 업데이트 없음, P-15)
    TQ->>RT: PATCH /api/todos/:id/completed 본문 completed true 또는 false
    RT->>SV: setCompleted(userId, id, completed)
    SV->>DB: UPDATE todos SET completed, completed_at<br/>WHERE id AND user_id RETURNING
    alt 0행 (타인 할일, 없음, 정수 아닌 id)
        SV-->>RT: throw AppError 404 NOT_FOUND
        RT-->>TQ: 404 NOT_FOUND
        TQ-->>FE: 오류 표시, 토글은 원래 상태 유지
    else 저장 성공
        SV-->>RT: 200
        RT-->>TQ: 200
        TQ->>TQ: 무효화 todos, calendar
        TQ->>RT: 목록·캘린더 재조회 (today 포함)
        Note over FE,TQ: 이전 내용 유지 + 상단에 갱신 중
        RT-->>TQ: 서버가 재판정한 상태
        TQ-->>FE: 새 상태 표시
    end
    FE->>FE: 성공·실패 모두 행 다시 활성화
```

화면은 상태를 미리 계산하지 않는다. 저장이 성공해야 재조회하고, 서버가 `today`로 판정한 결과만 표시한다. 완료를 취소하면 날짜 규칙에 따라 ST-02~04로 돌아간다. 본문은 원하는 값(`completed`)을 보내므로 재시도해도 결과가 같고, `completed_at`은 완료 시 현재 시각, 취소 시 비운다(PD-21).

관련 ID: FR-07, UC-07, BR-03, ST-01~04, NFR-07, NFR-12, P-12, P-15, P-22, P-25, PD-21, PD-25, PR-C-03, PR-L-11, SC-06

### SD-06 카테고리 삭제 트랜잭션

```mermaid
sequenceDiagram
    actor U as 사용자
    participant FE as CategoryList
    participant DLG as ConfirmDialog
    participant TQ as TanStack Query
    participant RT as routes/categories.js
    participant SV as services/categories.js
    participant DB as PostgreSQL

    U->>FE: 삭제 선택
    Note over FE: 기본 카테고리는 화면에서 조작 비활성
    FE->>DLG: 소속 할일은 기본으로 이동한다는 안내와 확인
    alt 취소
        DLG-->>U: 변경 없음
    end
    DLG->>TQ: 삭제 확인, 버튼 비활성화
    TQ->>RT: DELETE /api/categories/:id
    RT->>SV: deleteCategory(userId, id)
    SV->>DB: SELECT categories WHERE id AND user_id
    alt 0행 (타인 또는 없음)
        SV-->>RT: throw AppError 404 NOT_FOUND
        RT-->>TQ: 404 NOT_FOUND
    else 기본 카테고리 (BR-12)
        SV-->>RT: throw AppError 400 DEFAULT_CATEGORY_IMMUTABLE
        RT-->>TQ: 400 DEFAULT_CATEGORY_IMMUTABLE
    else 삭제 가능
        SV->>DB: BEGIN (withTransaction)
        SV->>DB: SELECT 기본 카테고리 id WHERE user_id AND is_default
        SV->>DB: UPDATE todos SET category_id = 기본 WHERE category_id AND user_id
        SV->>DB: DELETE categories WHERE id AND user_id
        SV->>DB: COMMIT
        SV-->>RT: 완료
        RT-->>TQ: 204
        TQ->>TQ: 무효화 categories, todos, calendar
        TQ-->>FE: 목록 재조회, 소속 할일은 기본에 표시
    end
    TQ-->>FE: 실패 시 화면 상단에 message 표시
```

이동과 삭제는 한 트랜잭션이라 삭제만 되고 할일이 사라지는 일이 없다. 소유권(404)을 기본 카테고리 보호(400)보다 먼저 확인해 타인 카테고리의 존재 여부를 드러내지 않는다. 카테고리 삭제 후에는 할일 소속이 바뀌므로 할일·캘린더 캐시도 무효화한다.

관련 ID: FR-13, UC-04, BR-03, BR-12, BR-14, BR-23, NFR-07, NFR-10, NFR-15, P-19, P-22, PR-L-06, PR-L-11, SC-03

### SD-07 할일 등록·수정 검증과 타인 카테고리 지정

```mermaid
sequenceDiagram
    actor U as 사용자
    participant FE as TodoForm
    participant TQ as TanStack Query
    participant RT as routes/todos.js
    participant VD as domain/validate.js
    participant SV as services/todos.js
    participant DB as PostgreSQL

    U->>FE: 제목, 설명, 기간, 카테고리 입력 후 저장
    FE->>TQ: mutate, 저장 버튼 비활성화 (P-22)
    TQ->>RT: POST /api/todos 또는 PATCH /api/todos/:id
    RT->>VD: 필수, trim, 길이(BR-22), 날짜 형식, 시작일 이하 종료일(BR-07)<br/>수정도 폼 전체 값을 보내 본문만으로 판정 (PD-20)
    alt 검증 실패
        VD-->>RT: throw AppError 400 VALIDATION_ERROR + fields
        RT-->>TQ: 400 VALIDATION_ERROR
        TQ-->>FE: 입력란 옆에 사유 표시, 저장 안 됨
    end
    RT->>SV: createTodo 또는 updateTodo(userId, id, input)
    opt 수정 (PATCH)
        SV->>DB: SELECT todos WHERE id AND user_id
        alt 0행 (타인 또는 없음)
            SV-->>RT: throw AppError 404 NOT_FOUND
        end
    end
    alt categoryId 지정
        SV->>DB: SELECT categories WHERE id AND user_id (BR-04)
        alt 0행 (타인 또는 없음)
            SV-->>RT: throw AppError 404 NOT_FOUND
            RT-->>TQ: 404 NOT_FOUND
            TQ-->>FE: 폼 상단에 message 표시, 저장 안 됨
        end
    else 등록에서 미지정 (BR-11)
        SV->>DB: SELECT 기본 카테고리 id WHERE user_id AND is_default
    else 수정에서 미지정 (BR-11)
        Note over SV: 기존 카테고리 유지
    end
    SV->>DB: INSERT 또는 UPDATE todos (user_id 조건 포함)
    DB-->>SV: 저장된 할일
    SV-->>RT: 할일
    RT-->>TQ: 201 또는 200 (PD-25)
    TQ->>TQ: 무효화 todos, calendar
    TQ-->>FE: 진입 화면으로 복귀 (state.from, 없으면 /todos)
```

형식·길이·날짜 순서는 `domain/validate.js`가 DB 없이 판정하고, 카테고리 소유권은 DB를 거쳐 서비스가 판정한다. 타인 카테고리는 없는 카테고리와 같은 404라 존재 여부가 드러나지 않는다. 과거 날짜는 거절하지 않는다(BR-08).

관련 ID: FR-05, FR-06, UC-05, UC-06, BR-03, BR-04, BR-06, BR-07, BR-08, BR-11, BR-22, NFR-07, NFR-09, NFR-15, P-17, P-22, PD-18, PR-L-05, PR-T-03, SC-04, SC-05

## 4. 커버리지

### 4.1 FR 커버리지

| FR | 다이어그램 | 비고 |
|---|---|---|
| FR-01 | SD-01, AD-02 | |
| FR-02 | SD-02 | 로그인 실패 분기만. 로그인 성공 흐름은 SD-01의 쿠키 발급과 같은 구조 |
| FR-03 | SD-02, AD-03 | 로그아웃 시 캐시 초기화는 AD-03 |
| FR-04 | SD-02, AD-02, AD-03 | |
| FR-05 | SD-07 | |
| FR-06 | SD-07 | |
| FR-07 | SD-05 | |
| FR-08 | 해당 없음 | 단순 삭제라 다이어그램을 만들지 않음. 소유권 규칙은 SD-05와 같은 패턴(PR-L-05) |
| FR-09 | SD-03 | |
| FR-10 | SD-04 | |
| FR-11 | SD-04 | Should, 기간 계산만 다름 |
| FR-12 | SD-04 | Should, 하루 기간 |
| FR-13 | SD-06 | 등록·이름 수정의 DUPLICATE_CATEGORY는 SD-01과 같은 23505 패턴이라 생략 |
| FR-14, FR-15 | AD-02 | 내 정보(Should)는 구조 다이어그램에서만 |
| FR-16 | SD-04 | 선택 시 이동은 SD-07 복귀 규칙과 연결 |

### 4.2 BR 커버리지

| BR | 다이어그램 |
|---|---|
| BR-01 | SD-02, AD-02 |
| BR-02 | SD-01, 7-erd.md |
| BR-03 | SD-03, SD-05, SD-06, SD-07 |
| BR-04 | SD-07 |
| BR-06, BR-07, BR-08 | SD-07 |
| BR-10 | SD-01, 7-erd.md |
| BR-11 | SD-07 |
| BR-12 | SD-06, 7-erd.md |
| BR-14 | SD-06 |
| BR-15 | SD-03 |
| BR-16, BR-17, BR-18, BR-19 | SD-04 |
| BR-20 | SD-03, SD-04 |
| BR-21, BR-22 | SD-01, SD-07 |
| BR-23 | SD-06, SD-07의 카테고리 선택 순서는 서버 순서 그대로(AD-03) |
| BR-13 | 7-erd.md |
| BR-05, BR-09 | 해당 없음 (단순 규칙) |

### 4.3 NFR 커버리지

| NFR | 다이어그램 |
|---|---|
| NFR-01, NFR-05 | 해당 없음 (NFR-01 폐기) |
| NFR-02 | AD-01, SD-02 |
| NFR-03 | AD-01, AD-02 |
| NFR-04 | 7-erd.md (인덱스), SD-03, SD-04 (필터·겹침 조건이 DB에서 처리됨) |
| NFR-06 | SD-01 |
| NFR-07 | SD-03, SD-05, SD-06, SD-07 |
| NFR-08 | AD-01, AD-02 |
| NFR-09 | SD-01, SD-07, AD-02 |
| NFR-10 | SD-01, SD-06 |
| NFR-11 | 7-erd.md, SD-04 |
| NFR-12 | 7-erd.md, SD-03, SD-04, SD-05 |
| NFR-13, NFR-14 | 해당 없음 (배치·브라우저 요구, SD-04의 데스크톱·모바일 분기만 관련) |
| NFR-15 | SD-01~SD-07 전체, AD-02 |
