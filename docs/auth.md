# docs/auth.md

## 1. 개요

엘샵의 인증 시스템은 OAuth 기반 간편 로그인을 사용합니다.
현재 MVP에서는 다음을 목표로 합니다:
- 빠른 가입/로그인
- 최소한의 개인정보 수집
- 서버 단에서 안전한 사용자 식별
- 확장 가능한 구조 유지

### 사용 기술

- Auth.js v5 (NextAuth.js)
- Naver OAuth
- Prisma
- PostgreSQL

---

## 2. 인증 흐름 (Authentication Flow)

1. 사용자가 "네이버로 시작하기" 클릭
2. Naver OAuth 인증 페이지로 이동
3. 사용자 로그인 및 동의 (생년월일 포함)
4. 콜백 → /api/auth/callback/naver
5. NextAuth가 사용자 정보 수신
6. **연령 확인** → 만 19세 미만이면 `/login?error=underage` 로 차단
7. DB에 사용자 생성 또는 조회
8. DB 세션 생성
9. 로그인 완료 → `/account` 로 리다이렉트

---

## 3. 사용자 식별 전략

### 핵심 원칙

- OAuth provider id 기반 식별
- 네이버 계정 ID는 salted SHA-256 해싱 후 저장 (개인정보 최소화)

### 실제 DB 스키마 (주요 필드)

```
User {
  id:        String  (cuid)
  publicId:  String  (nanoid, 외부 노출용)
  nickname:  String? (unique)
  role:      TEMP | USER | ADMIN
  isBanned:  Boolean
  createdAt: DateTime
}

Account {
  provider:          "naver"
  providerAccountId: String (네이버 ID를 salted SHA-256 해싱한 64자리 hex 문자열)
  userId:            String (User.id 참조)
}
```

### 이유

- 이메일은 변경 가능
- providerId는 유일하고 변경 불가
- 해싱으로 원본 네이버 ID를 복원 불가하게 저장

---

## 4. 닉네임 정책

엘샵은 게임 닉네임 기반 커뮤니티입니다.

### 규칙

- 로그인 후 본캐 인증 필수
- 닉네임 중복 불가 (Unique)

### 상태 구분

| 상태 | role | 설명 |
|------|------|------|
| 인증대기 | TEMP | 글/댓글 작성/읽기 불가 |
| 인증됨 | USER | 모든 기능 사용 가능 |
| 관리자 | ADMIN | 신고 처리, 제재 등 |

---

## 5. 본캐 인증 시스템

### 목적

- 사기 방지
- 신뢰도 확보

### 방식

1. 구글폼으로 게임 스크린샷 제출
2. 관리자 검토
3. 어드민 페이지에서 닉네임 변경 및 role → USER 전환

---

## 6. 세션 관리

Auth.js v5 DB 세션 사용

### 방식

- **DB 세션** (`strategy: "database"`)
- 세션 토큰을 DB에 저장, 쿠키로 참조

### 세션 데이터

```ts
session.user = {
  id,        // DB User.id (내부용)
  publicId,  // 외부 노출용 ID
  nickname,
  role       // "TEMP" | "USER" | "ADMIN"
}
```

---

## 7. 권한 (Authorization)

### Role 기반 접근 제어

| 역할 | 권한 |
|------|------|
| TEMP | 글/댓글 작성/읽기 불가 |
| USER | 게시글 작성, 댓글, 신고 |
| ADMIN | 신고 처리, 글/댓글 삭제, 사용자 제재 |

### 서버에서 반드시 검증

- 클라이언트 신뢰 금지
- Server Action / API에서 role 체크 필수

---

## 8. 보안 정책

### 1. 최소 정보 수집

- 전화번호 수집 안 함
- 이름 수집 안 함
- 생년월일: 연령 확인 후 **즉시 폐기** (DB 저장 안 함)
- 네이버 계정 ID: salted SHA-256 해싱 후 저장

---

### 2. 입력값 검증

- 닉네임 길이 제한
- 특수문자 필터링
- 서버에서도 동일 검증

---

### 3. 미성년자 차단

- 만 19세 미만 가입 불가
- 네이버 계정 생년월일(birthyear, birthday)로 확인
- `signIn` 콜백에서 차단 → DB 저장 없이 종료

---

### 4. Rate Limit (추후)

- 로그인 시도 제한
- API 호출 제한

---

### 5. CSRF / XSS

Auth.js 기본 보호 사용

---

## 9. 사기 방지 정책

엘샵은 거래를 중개하지 않습니다.

### 원칙

- 결제 기능 없음
- 매칭 기능 없음
- 분쟁 개입 없음

### 대신 제공

- 신고 기능 (게시글/댓글)
- 사용자 제재 (밴)
- 본캐 인증 시스템

---

## 10. 향후 확장 계획

- 본캐 인증 자동화
- 안전거래 시스템 (Escrow) — 도입 시 재검수 및 청소년 보호 조치 필요

---

## 11. 환경 변수

```
AUTH_NAVER_ID=
AUTH_NAVER_SECRET=
AUTH_SECRET=
SECRET_SALT=        # 네이버 ID 해싱용 salt
```

---

## 12. 구현 참고

### Auth.js Provider 설정

```ts
import Naver, { NaverProfile } from "next-auth/providers/naver";

Naver({
  clientId: process.env.AUTH_NAVER_ID!,
  clientSecret: process.env.AUTH_NAVER_SECRET!,
  profile(profile: NaverProfile) {
    return { id: profile.response.id };
  },
})
```

---

## 13. 중요한 설계 결정 요약

- Auth.js v5 + DB 세션 채택
- 네이버 ID salted SHA-256 해싱 저장
- publicId로 외부 노출 (내부 id 비노출)
- 닉네임은 식별자가 아님
- 인증은 신뢰도 시스템으로 분리
- 거래 개입 없음 (법적 리스크 최소화)
- 만 19세 미만 가입 차단

---

## 14. 운영 원칙

- 운영자는 거래에 개입하지 않는다
- 사용자 책임 하에 거래 진행
- 플랫폼은 정보 공유 공간 역할

---

## 15. TODO

- [ ] Rate Limit 적용
- [ ] 본캐 인증 자동화
