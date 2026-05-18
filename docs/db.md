# DB 설계 (docs/db.md)

## 1. 개요

- **DBMS**: PostgreSQL 16
- **ORM**: Prisma
- 소프트 딜리트 기반 (`deletedAt`) — 게시글·댓글·계정 모두 물리 삭제하지 않음
- 개인정보 최소화: 네이버 ID는 salted SHA-256 해싱 후 저장

---

## 2. 모델 목록

| 모델 | 테이블 | 설명 |
|------|--------|------|
| User | users | 사용자 |
| Account | accounts | OAuth 연동 계정 (NextAuth) |
| Session | sessions | 로그인 세션 (NextAuth) |
| VerificationToken | verification_tokens | NextAuth 내부용 |
| Post | posts | 거래 게시글 |
| PostImage | post_images | 게시글 첨부 이미지 |
| Comment | comments | 댓글 (구매 의사 포함) |
| Report | reports | 게시글 신고 |
| CommentReport | comment_reports | 댓글 신고 |
| AdminAction | admin_actions | 관리자 처리 이력 |
| Notification | notifications | 알림 |
| NotificationKeyword | notification_keywords | 키워드 알림 설정 |
| RetainedUser | retained_users | 탈퇴 유저 재가입 차단용 |
| TempNicknameSeq | temp_nickname_seq | 임시 닉네임 시퀀스 |

---

## 3. 주요 모델 상세

### User

| 필드 | 타입 | 설명 |
|------|------|------|
| id | String (cuid) | 내부 식별자 (외부 노출 금지) |
| publicId | String (nanoid) | 외부 노출용 ID |
| nickname | String? (unique) | 게임 닉네임. 탈퇴 시 `탈퇴#${publicId}`로 익명화 |
| role | Role | TEMP / USER / ADMIN |
| hashedNaverId | String? (unique) | salted SHA-256 해시. 탈퇴 후에도 유지 |
| isBanned | Boolean | 밴 여부 |
| bannedUntil | DateTime? | 기간 밴 해제 시각 |
| deletedAt | DateTime? | 탈퇴 시각 (소프트 딜리트) |
| retainUntil | DateTime? | 개인정보 보유 기한 |

### Post

| 필드 | 타입 | 설명 |
|------|------|------|
| board | PostBoard | CREDIT / ED / GENERAL / OTHER |
| category | PostCategory | SELL / BUY / TRADE |
| status | PostStatus | ACTIVE / RESERVED / COMPLETED / EXPIRED |
| contact | String? | 판매자 연락처. 만료 시 자동으로 null 처리 |
| expiresAt | DateTime? | 게시글 만료 시각 (작성 후 7일) |
| isPremium | Boolean | 프리미엄 게시글 여부 |
| characterName | String? | 거래 캐릭터명 (선택) |
| negotiable | Boolean | 가격 협의 가능 여부 |
| deletedAt | DateTime? | 소프트 딜리트 |

### Comment

| 필드 | 타입 | 설명 |
|------|------|------|
| parentId | String? | 대댓글용 자기 참조 |
| contact | String? | 구매자 연락처. 게시글 작성자에게만 표시. 만료 시 null |
| deletedAt | DateTime? | 소프트 딜리트 |

### RetainedUser

탈퇴 유저의 재가입 차단을 위해 `hashedNaverId`를 보관하는 테이블.

| 필드 | 타입 | 설명 |
|------|------|------|
| publicId | String (unique) | 탈퇴 전 User.publicId |
| nickname | String | 탈퇴 전 실제 닉네임 |
| hashedNaverId | String (unique) | 재가입 차단 기준 |
| retainUntil | DateTime | 신고 없으면 1년, 신고 이력 있으면 3년 |

---

## 4. Enum 정의

### Role
| 값 | 설명 |
|----|------|
| TEMP | 로그인 직후 기본 역할. 게시글 1일 1개, 댓글 1일 3개 |
| USER | 본캐 인증 완료. 게시글·댓글 자유롭게 작성 |
| ADMIN | 신고 처리, 글·댓글 삭제, 사용자 제재 |

### PostBoard
| 값 | 설명 |
|----|------|
| CREDIT | 크레딧 거래 |
| ED | ED 거래 |
| GENERAL | 일반 거래 |
| OTHER | 기타 |

### PostCategory
| 값 | 설명 |
|----|------|
| SELL | 팝니다 |
| BUY | 삽니다 |
| TRADE | 교환합니다 |

### PostStatus
| 값 | 설명 |
|----|------|
| ACTIVE | 거래 중 |
| RESERVED | 예약 중 |
| COMPLETED | 거래 완료 |
| EXPIRED | 만료 (7일 경과 후 자동 전환) |

### ReportReason
`FRAUD` / `FALSE_INFO` / `INAPPROPRIATE` / `IMPERSONATION` / `OTHER`

### ReportStatus
`PENDING` / `REVIEWING` / `RESOLVED` / `REJECTED`

### AdminActionType
`DELETE_POST` / `RESTORE_POST` / `RESOLVE_REPORT` / `REJECT_REPORT` / `BAN_USER` / `UNBAN_USER` / `APPROVE_USER` / `REJECT_USER` / `DELETE_COMMENT` / `RESOLVE_COMMENT_REPORT` / `REJECT_COMMENT_REPORT`

---

## 5. 인덱스 설계

```prisma
// Post
@@index([authorId])
@@index([deletedAt, createdAt(sort: Desc)])           -- 전체 목록 조회
@@index([deletedAt, board, createdAt(sort: Desc)])    -- 게시판별 목록 조회
@@index([deletedAt, isPremium, premiumUntil])         -- 프리미엄 게시글 조회
@@index([deletedAt, board, category, status])         -- 필터 조회

// Comment
@@index([postId])
@@index([parentId])

// Notification
@@index([userId, createdAt(sort: Desc)])
@@index([userId, isRead])
```

---

## 6. 만료 처리 흐름

`GET /api/cron/expire-posts`가 주기적으로 실행됩니다.

- `ACTIVE` 상태이고 `expiresAt < now` → `EXPIRED`로 전환, `contact` null 처리
- `RESERVED` 상태이고 `expiresAt < now` → `COMPLETED`로 전환, `contact` null 처리
- 만료된 게시글의 댓글 `contact`도 함께 null 처리

→ 연락처는 만료 즉시 삭제되어 복원 불가합니다.

---

## 7. 마이그레이션 규칙

- `schema.prisma` 변경 시 반드시 마이그레이션 수행
  ```bash
  npx prisma migrate dev --name <이름>
  ```
- 프로덕션 배포 시 `prisma migrate deploy` 자동 실행 (Dockerfile CMD에 포함)
- 필드·모델명 변경 시 전체 사용처 확인
- `drop` / `rename` 등 destructive change는 데이터 손실 여부 사전 확인
