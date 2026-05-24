# 프로젝트 개요

이 프로젝트는 "엘소드 샵"으로, 엘소드 유저 간 거래 정보를 공유하는 커뮤니티형 게시판 서비스입니다.
현재 플랫폼은 거래를 직접 중개하지 않고 게시판 기반 정보 공유에 집중합니다. 단, 향후 escrow 등 안전거래 기능 도입 가능성을 고려하여 구조를 설계합니다.
목표는 빠른 MVP 출시와 안정적인 운영입니다.

# 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js (Naver OAuth)
- **Styling**: Tailwind CSS 4
- **Infra**: Docker, Docker Compose, Nginx

# 우선순위
- 안정성 (Stability)
- 보안 / 사기 방지 (Security / Anti-fraud)
- 유지보수성 (Maintainability)
- 기능 추가 (Features)
- UI 개선 (UI polish)

# 핵심 비즈니스 규칙 (Business Rules)
- 플랫폼은 거래를 중개하지 않는다 (No escrow, No payment system)
- 사용자 간 거래 분쟁에 개입하지 않는다
- 개인정보(전화번호, 계좌번호 등) 공개를 최소화해야 한다
- 사기 방지 및 신고/차단 기능은 매우 중요하다
- 연령 제한 없음 (전체 이용가 — 콘텐츠가 청소년 유해물에 해당하지 않음)
- 프리미엄 게시글 기능 (상단 노출 등 시각적 강조 가능)
- 사용자 온보딩: 로그인 시 `TEMP` 역할 부여 -> 닉네임 설정 시 `USER` 역할로 전환

# 작업 방식 (How to Work)
1. Next.js 16 및 Tailwind 4 규칙 준수
2. 관련 파일을 먼저 탐색한다
3. 문제의 원인을 먼저 설명한다
4. 최소 변경으로 해결 방법을 제안한다
5. 기존 구조를 최대한 유지한다
6. 불확실하면 새 구조를 만들지 않는다

# 응답 스타일 (Response Style)
- 문제 해결 시 원인, 수정 위치, 수정 방법 설명

# Database 규칙 (Prisma)
- schema.prisma 변경 시 반드시 migration 수행
- field / model 이름 변경 시 전체 사용처 확인
- destructive change (drop, rename)는 신중하게 처리
- DB 변경 시 관련 API / UI도 함께 수정

# UI / UX 규칙
- 가독성을 최우선으로 한다 (특히 dark mode)
- 텍스트 대비 충분히 확보
- 모바일 환경 고려
- globals.css 활용

# 금지 사항 (Do Not)
- 모호한 사항이 있으면 먼저 질문하기
- 코드는 그대로 두면서 주석만 삭제하기 금지
- 중요한 의도/비즈니스 로직 주석은 유지
- 기존 구조를 무시하고 대규모 리팩토링하지 않는다
- 클라이언트 입력을 신뢰하지 않는다 (항상 서버 검증 필요)
