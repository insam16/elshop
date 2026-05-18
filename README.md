# 엘샵 (Elshop)

엘소드 유저 간 아이템 거래 정보를 공유하는 커뮤니티형 게시판 서비스입니다.

거래 중개 없이 게시판 기반 정보 공유에 집중하며, 연락처 보호와 사기 방지를 핵심 설계 원칙으로 삼습니다.

---

## 주요 기능

- **연락처 보호 시스템** — 판매자 연락처는 "지금 연락하기"를 누른 단 한 명에게만 공개되며 이후 삭제됩니다
- **구매 의사 비공개** — 구매자가 남긴 연락처는 게시글 작성자만 확인 가능합니다
- **게시글 자동 만료** — 7일 후 자동 만료되어 오래된 거래글이 방치되지 않습니다
- **본캐 인증** — 선택 사항이며, 인증 유저만 판매자 연락처를 확인할 수 있습니다
- **신고/관리 시스템** — 유저 신고 기반 모니터링 및 운영자 직접 처리

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL 16 |
| ORM | Prisma |
| Auth | NextAuth.js v5 (Naver OAuth) |
| Styling | Tailwind CSS 4 |
| Infra | Docker, Docker Compose, Nginx |

---

## 로컬 개발 환경 세팅

### 사전 요구사항

- Node.js 20+
- PostgreSQL (또는 Docker)

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

```bash
cp env.example .env
```

`.env` 파일을 열고 아래 항목을 채웁니다.

| 변수 | 설명 |
|------|------|
| `DATABASE_URL` | PostgreSQL 연결 문자열 (Prisma는 `.env.local`이 아닌 `.env`를 읽습니다) |
| `SECRET_SALT` | 네이버 ID 해시용 솔트 |
| `AUTH_SECRET` | Auth.js 서명 시크릿 (`openssl rand -base64 32`로 생성) |
| `AUTH_URL` | 앱 배포 URL (예: `http://localhost:3000`) |
| `AUTH_NAVER_ID` | 네이버 개발자센터 애플리케이션 Client ID |
| `AUTH_NAVER_SECRET` | 네이버 개발자센터 애플리케이션 Client Secret |

### 3. DB 마이그레이션

```bash
npx prisma migrate dev
```

### 4. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

---

## 배포 (Docker Compose)

### 1. 환경변수 준비

`.env.production` 파일을 생성하고 `.env`와 동일한 항목 + DB 관련 변수를 추가합니다.

```env
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
```

### 2. 컨테이너 실행

```bash
docker compose up -d
```

앱은 `127.0.0.1:3000`에서 실행됩니다. Nginx 리버스 프록시 설정은 `nginx.conf.example`을 참고하세요.

> Docker 이미지: `ghcr.io/insam16/elshop:latest`

---

## 프로젝트 구조

```
src/app/
├── posts/          # 거래 게시판
├── users/          # 유저 프로필
├── admin/          # 관리자 페이지
├── verify/         # 본캐 인증
├── account/        # 계정 설정
├── notice/         # 공지사항
├── notifications/  # 알림
└── api/            # API 라우트

prisma/
├── schema.prisma   # DB 스키마
└── migrations/     # 마이그레이션 이력

docs/               # 설계 문서
```

---

## 문서

| 문서 | 내용 |
|------|------|
| [서비스 소개](docs/about.md) | 기획 의도 및 설계 방향 |
| [인증](docs/auth.md) | 로그인 흐름, 역할(TEMP/USER/ADMIN) |
| [게시글](docs/posting.md) | 게시글 작성, 만료, 상태 관리 |
| [연락처 시스템](docs/contact.md) | 연락처 보호 메커니즘 |
| [본캐 인증](docs/verify.md) | 인증 방식 및 정책 |
| [DB 설계](docs/db.md) | 스키마 설계 근거 |
| [어뷰징 방지](docs/abuse-prevention.md) | 신고, 차단, 제재 |
| [관리자](docs/admin.md) | 관리자 기능 |
| [배포](docs/deployment.md) | 배포 가이드 |

---

## 라이선스

Private — 무단 복제 및 배포를 금지합니다.
