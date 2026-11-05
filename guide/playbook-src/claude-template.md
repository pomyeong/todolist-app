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
