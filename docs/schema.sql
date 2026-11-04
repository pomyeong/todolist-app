-- TodoList 데이터베이스 스키마 (PostgreSQL 17)
-- 근거: docs/7-erd.md v0.2 (ERD-02, 4장 테이블 명세, 5장 제약·인덱스, DB-01~13)
-- 상태(ST-01~04) 컬럼은 두지 않는다. 조회 시 파생한다(NFR-12).
-- 다시 만들 때는 아래 DROP 구문의 주석을 풀고 실행한다(운영 데이터 없음, P-10).

-- DROP TABLE IF EXISTS refresh_tokens, todos, categories, users;

BEGIN;

CREATE TABLE users (
    id             INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,   -- DB-01
    email          VARCHAR(254) NOT NULL,                                   -- BR-22, 소문자 저장(DB-03)
    password_hash  VARCHAR(60)  NOT NULL,                                   -- bcrypt(NFR-06, DB-09)
    name           VARCHAR(50)  NOT NULL,                                   -- BR-22
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),                     -- DB-02
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),                     -- DB-02, UPDATE 시 서비스가 now()
    CONSTRAINT uq_users_email       UNIQUE (email),                         -- BR-02
    CONSTRAINT ck_users_email_lower CHECK (email = lower(email))            -- DB-03
);

CREATE TABLE categories (
    id          INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,      -- DB-01
    user_id     INTEGER      NOT NULL,
    name        VARCHAR(30)  NOT NULL,                                      -- BR-22, trim 후 저장(DB-04)
    is_default  BOOLEAN      NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),                        -- BR-23 정렬
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT fk_categories_user      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT,  -- DB-05, DB-12
    CONSTRAINT uq_categories_user_name UNIQUE (user_id, name)                                          -- BR-13
);

-- 사용자당 기본 카테고리 최대 1개(BR-10, BR-12)
CREATE UNIQUE INDEX uq_categories_user_default ON categories (user_id) WHERE is_default;

CREATE TABLE todos (
    id            INTEGER        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,  -- DB-01
    user_id       INTEGER        NOT NULL,
    category_id   INTEGER        NOT NULL,                                  -- BR-11
    title         VARCHAR(100)   NOT NULL,                                  -- BR-06, BR-22
    description   VARCHAR(1000),                                            -- 빈 값은 NULL(DB-11)
    start_date    DATE           NOT NULL,                                  -- NFR-11
    end_date      DATE           NOT NULL,
    completed     BOOLEAN        NOT NULL DEFAULT false,
    completed_at  TIMESTAMPTZ,                                              -- PD-21
    created_at    TIMESTAMPTZ    NOT NULL DEFAULT now(),                    -- BR-20 정렬
    updated_at    TIMESTAMPTZ    NOT NULL DEFAULT now(),
    CONSTRAINT fk_todos_user      FOREIGN KEY (user_id)     REFERENCES users (id)      ON DELETE RESTRICT,  -- DB-05
    CONSTRAINT fk_todos_category  FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT,  -- DB-05, BR-14
    CONSTRAINT ck_todos_dates     CHECK (start_date <= end_date),                                         -- BR-07, DB-07
    CONSTRAINT ck_todos_completed CHECK (completed = (completed_at IS NOT NULL))                         -- DB-08
);

-- 캘린더 기간 겹침·사용자 단위 조회(NFR-04, BR-17, BR-18)
CREATE INDEX idx_todos_user_dates    ON todos (user_id, start_date, end_date);
-- 목록 카테고리 필터, 카테고리 삭제 시 할일 이동(NFR-04, BR-14, BR-15)
CREATE INDEX idx_todos_user_category ON todos (user_id, category_id);

-- refresh 토큰(P-04). 원문은 저장하지 않고 SHA-256 해시만 둔다(DB-13).
CREATE TABLE refresh_tokens (
    id          INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,      -- DB-01
    user_id     INTEGER      NOT NULL,
    token_hash  CHAR(64)     NOT NULL,                                      -- SHA-256 16진수(DB-13)
    expires_at  TIMESTAMPTZ  NOT NULL,                                      -- 발급 후 7일(P-04)
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),                        -- DB-02
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT,  -- DB-05, DB-12
    CONSTRAINT uq_refresh_tokens_hash UNIQUE (token_hash)                                            -- 갱신·로그아웃 조회(DB-13)
);

-- 비밀번호 변경 시 전체 폐기, 로그인 시 만료 행 정리(DB-13)
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens (user_id);

COMMIT;
