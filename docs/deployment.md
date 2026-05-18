# 배포 가이드 (docs/deployment.md)

## 1. 개요

| 항목 | 내용 |
|------|------|
| 앱 | Next.js 16 standalone 빌드 |
| DB | PostgreSQL 16 (Docker 컨테이너) |
| 리버스 프록시 | Nginx |
| 컨테이너 관리 | Docker Compose |
| 이미지 레지스트리 | GitHub Container Registry (`ghcr.io/insam16/elshop`) |

앱 컨테이너는 `127.0.0.1:3000`에서만 수신하며, Nginx가 외부 트래픽을 프록시합니다.
DB 컨테이너는 외부 네트워크(`yuna-net`)에 노출되지 않고 `internal` 네트워크에서만 접근 가능합니다.

---

## 2. 사전 요구사항

- Docker, Docker Compose
- Nginx
- 도메인 및 SSL 인증서 (Let's Encrypt 권장)
- GitHub Container Registry 접근 권한 (`ghcr.io/insam16/elshop`)

---

## 3. 환경변수 준비

`.env.production` 파일을 서버에 직접 생성합니다. (git에 포함하지 않음)

```env
# Prisma / DB 연결
DATABASE_URL=postgresql://<user>:<password>@elshop_db:5432/<dbname>

# 네이버 ID 해시용 솔트
SECRET_SALT=

# Auth.js
AUTH_SECRET=
AUTH_URL=https://elshop.shop

# 네이버 OAuth
AUTH_NAVER_ID=
AUTH_NAVER_SECRET=

# PostgreSQL 컨테이너 설정
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
```

> `DATABASE_URL`의 호스트는 컨테이너 이름(`elshop_db`)으로 지정합니다.

---

## 4. Docker 네트워크 준비

`docker-compose.yml`에서 외부 네트워크 `yuna-net`을 사용합니다.  
최초 1회 생성이 필요합니다.

```bash
docker network create yuna-net
```

---

## 5. 컨테이너 실행

```bash
docker compose up -d
```

- `elshop_db` (PostgreSQL) 가 healthy 상태가 된 후 `elshop` 앱이 기동됩니다.
- 앱 기동 시 `prisma migrate deploy`가 자동으로 실행됩니다.

### 이미지 업데이트

```bash
docker compose pull
docker compose up -d
```

---

## 6. Nginx 설정

`nginx.conf.example`을 참고해 실제 설정 파일을 작성합니다.

```nginx
server {
    listen 80;
    server_name elshop.shop;

    location /_next/static {
        proxy_pass http://127.0.0.1:3000/_next/static;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL (Let's Encrypt)

```bash
certbot --nginx -d elshop.shop
```

---

## 7. 게시글 만료 크론 설정

`GET /api/cron/expire-posts`를 주기적으로 호출해야 합니다.  
서버의 crontab에 등록합니다.

```cron
0 * * * * curl -s https://elshop.shop/api/cron/expire-posts
```

매 정각마다 실행하며, 만료된 게시글의 상태 전환 및 연락처 삭제를 처리합니다.

---

## 8. 로그 확인

```bash
# 앱 로그
docker logs elshop -f

# DB 로그
docker logs elshop_db -f
```

로그는 json-file 드라이버로 관리됩니다.

| 컨테이너 | max-size | max-file |
|---------|----------|----------|
| elshop | 10m | 5 |
| elshop_db | 10m | 3 |

---

## 9. 관리자 계정 설정

최초 배포 후 관리자 계정을 수동으로 지정합니다.

```bash
docker exec -it elshop_db psql -U <POSTGRES_USER> -d <POSTGRES_DB>
```

```sql
-- 대상 유저 확인
SELECT id, nickname, role FROM users;

-- 관리자로 승급
UPDATE users SET role = 'ADMIN' WHERE nickname = '본인닉네임';

-- 확인
SELECT nickname, role FROM users WHERE nickname = '본인닉네임';

\q
```

---

## 10. 네이버 OAuth 콜백 URL 설정

네이버 개발자센터 → 내 애플리케이션 → API 설정에서 아래 항목을 등록합니다.

| 항목 | 값 |
|------|-----|
| 서비스 URL | `https://elshop.shop` |
| Callback URL | `https://elshop.shop/api/auth/callback/naver` |
| 탈퇴 콜백 URL | `https://elshop.shop/api/auth/naver/disconnect` |
