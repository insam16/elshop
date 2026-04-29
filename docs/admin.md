# 관리자 패널 (Admin Panel)

## 1. 개요

- 접근 경로: `/admin/*`
- 접근 조건: `session.user.role === "ADMIN"`
- 미인증 또는 권한 없는 접근 시 `/` 또는 `/login`으로 redirect
- ADMIN 역할은 DB에서 직접 부여 (UI 없음)

## 2. 레이아웃

`src/app/admin/layout.tsx`

레이아웃에서 페이지 렌더 전 2가지 카운트를 병렬 조회한다:

| 항목 | 조건 |
|---|---|
| 게시글 신고 배지 | `report.status = PENDING` |
| 댓글 신고 배지 | `commentReport.status = PENDING` |

카운트가 0이면 배지 미표시, 99 초과 시 "99+"로 표시.

---

## 3. 유저 관리 (`/admin/users`)

### 3-1. 탭

| 탭 | 조건 |
|---|---|
| 인증 대기 | `role = TEMP`, `deletedAt = null` |
| 인증 완료 | `role = USER`, `deletedAt = null` |
| 전체 | `role IN (TEMP, USER)`, `deletedAt = null` |
| 탈퇴 | `deletedAt IS NOT NULL` |

기본 탭: 인증 대기. 닉네임/이메일 검색 가능(insensitive).

### 3-2. 인증 대기 유저 처리

컴포넌트: `UserVerifySection`  
액션: `approveUser`, `rejectUser` (`src/lib/actions/admin.ts`)

**승인 (`approveUser`)**
1. 캐릭터명(인게임 닉네임) 입력 필수, 최대 20자
2. 동일 닉네임 보유자가 있으면 충돌 경고 표시
3. 강제 승인(`force=true`) 시:
   - 기존 보유자 닉네임을 `닉변#XXXX` (4자리 시퀀스)로 변경
   - 기존 보유자 role을 `TEMP`로 강등
   - 기존 보유자에게 `NICKNAME_CHANGED` 알림 발송
   - 신규 유저 role을 `USER`로 승격
4. `AdminAction(APPROVE_USER)` 기록

**거절 (`rejectUser`)**
1. 사유 메모 선택 입력 (최대 200자)
2. role 변경 없음 (유저는 TEMP 유지, 재신청 가능)
3. `AdminAction(REJECT_USER)` 기록
4. 목록에 이전 거절 횟수 표시

### 3-3. 인증 완료 유저 제재

컴포넌트: `UserBanSection`  
액션: `banUser`, `unbanUser`

**제재 부과 (`banUser`)**

| 타입 | bannedUntil |
|---|---|
| 기간 제한 | 관리자가 선택한 날짜 (오늘 이후만 허용) |
| 영구 차단 | `9999-12-31` |

- `isBanned = true`, `bannedUntil` 설정
- `AdminAction(BAN_USER)` 기록
- ADMIN 역할 계정은 제재 불가

**제재 해제 (`unbanUser`)**
- `isBanned = false`, `bannedUntil = null`
- `AdminAction(UNBAN_USER)` 기록

제재된 유저는 로그인 시 차단 메시지 표시. 기간 제재는 `bannedUntil` 만료 후 자동 해제(로그인 시 체크).

### 3-4. 탈퇴 탭

탈퇴한 유저 목록 표시. `deletedAt` 내림차순 정렬.

표시 정보:
- 익명화된 닉네임(`탈퇴#publicId`)에 취소선
- 실제 닉네임: `RetainedUser` 테이블에서 `publicId`로 조회해 괄호 안에 표시
- 탈퇴일, 데이터 보관 만료일, 가입일
- 쿨다운 여부 (`hashedNaverId IS NOT NULL` + 보관 기간 내)

**1년 / 3년 (`ChangeRetentionButton` / `changeUserRetention`)**
- 데이터 보관기간 변경 버튼
- 조건: `(hasCooldown || user.retainUntil)`인 유저에 표시
- 실행 시: deletedAt + N년으로 User.retainUntil과 RetainedUser.retainUntil 동시 업데이트
- ChangeRetentionButton 컴포넌트: 현재 설정된 기간(1년/3년)은 비활성화된 회색 버튼으로 표시, 변경 가능한 버튼만 활성화
- 탈퇴 탭 카드 우측: ChangeRetentionButton(위) + PurgeUserButton(아래) 세로 배치
- 현재 기간은 (retainUntil - deletedAt) > 2년 여부로 1년/3년을 판별

**즉시 삭제 (`PurgeUserButton` / `purgeDeletedUser`)**
- 조건: `(hasCooldown || user.retainUntil)`인 유저에 표시
- 실행 시: `email`, `nickname`, `name`, `image`, `hashedNaverId`, `retainUntil` 모두 null 처리
- 재가입 쿨다운이 즉시 해제됨
- 되돌릴 수 없음

**만료 데이터 정리 (`AnonymizeButton` / `anonymizeExpiredUsers`)**
- 탈퇴 탭 헤더에 표시
- `RetainedUser.retainUntil < now` 인 레코드를 일괄 삭제
- 삭제된 레코드 수 결과 표시

---

## 4. 게시글 신고 (`/admin/reports`)

### 4-1. 목록 (`/admin/reports`)

20건씩 페이지네이션, 최신순 정렬.

표시 컬럼: 신고 게시글, 게시글 작성자, 신고자, 사유, 상세, 상태, 접수일, 상세 링크

탈퇴한 유저는 `nickname = null`이면 "탈퇴한 유저"로 표시. 보관 기간 내 탈퇴 유저에는 "보존중" 뱃지.

### 4-2. 신고 상태

| 값 | 표시 |
|---|---|
| `PENDING` | 대기중 (노란색) |
| `REVIEWING` | 검토중 (파란색) |
| `RESOLVED` | 처리완료 (초록색) |
| `REJECTED` | 반려 (회색) |

### 4-3. 신고 사유

`FRAUD` / `FALSE_INFO` / `INAPPROPRIATE` / `IMPERSONATION` / `OTHER`

### 4-4. 상세 페이지 (`/admin/reports/[id]`)

4개 섹션:

1. **신고 정보** — 사유, 상세 내용, 신고자, 접수일
2. **신고 대상 게시글** — 제목(링크), 작성자, 내용 미리보기(200자)
3. **게시글 처리** (`PostActionButtons`) — 숨김/복구
   - 숨김: `post.deletedAt = now()` + `AdminAction(DELETE_POST)` 기록
   - 복구: `post.deletedAt = null` + `AdminAction(RESTORE_POST)` 기록
4. **작성자 제재** (`UserBanSection`) — [3-3](#3-3-인증-완료-유저-제재)과 동일
5. **신고 처리** (`ReportActionForm`) — 상태 변경 + 메모(최대 500자)
   - `RESOLVED` → `AdminAction(RESOLVE_REPORT)` 기록
   - `REJECTED` → `AdminAction(REJECT_REPORT)` 기록
6. **처리 이력** — 연결된 `AdminAction` 목록 (최신순)

---

## 5. 댓글 신고 (`/admin/comment-reports`)

### 5-1. 목록

게시글 신고와 동일한 구조. 댓글/답글 구분 배지 표시 (parentId 유무로 판별).

### 5-2. 상세 페이지 (`/admin/comment-reports/[id]`)

4개 섹션:

1. **신고 정보** — 사유, 상세, 신고자, 접수일
2. **신고 대상 댓글/답글** — 원글 게시글 제목(링크), 작성자, 작성일, 전체 내용
3. **댓글 처리** (`CommentActionButtons`) — 삭제
   - 삭제: `comment.deletedAt = now()` (soft delete), 원글 페이지 revalidate + `AdminAction(DELETE_COMMENT)` 기록
   - 복구 기능 없음
4. **작성자 제재** (`UserBanSection`)
5. **신고 처리** (`CommentReportActionForm`) — 상태 변경 + 메모(최대 500자)
   - `RESOLVED` → `AdminAction(RESOLVE_COMMENT_REPORT)` 기록
   - `REJECTED` → `AdminAction(REJECT_COMMENT_REPORT)` 기록

---

## 6. 관리자 액션 로그 (`AdminAction`)

모든 관리자 처리는 `admin_actions` 테이블에 기록된다.

| actionType | 발생 시점 |
|---|---|
| `DELETE_POST` | 게시글 삭제 |
| `RESTORE_POST` | 게시글 복구 |
| `RESOLVE_REPORT` | 게시글 신고 처리 완료 |
| `REJECT_REPORT` | 게시글 신고 반려 |
| `BAN_USER` | 사용자 제재 |
| `UNBAN_USER` | 제재 해제 |
| `APPROVE_USER` | 인증 승인 |
| `REJECT_USER` | 인증 거절 |
| `DELETE_COMMENT` | 댓글 삭제 |
| `RESOLVE_COMMENT_REPORT` | 댓글 신고 처리 완료 |
| `REJECT_COMMENT_REPORT` | 댓글 신고 반려 |

연관 필드: `adminId`, `targetUserId`, `postId`, `reportId`, `commentId`, `commentReportId`, `note`

---

## 7. 탈퇴 유저 데이터 보관 정책

탈퇴 시 `RetainedUser` 테이블에 실제 닉네임과 네이버 ID 해시를 보관하고, `User` 테이블의 닉네임은 `탈퇴#publicId`로 익명화된다.

**보관 기간 결정 기준** (`src/lib/actions/user.ts`, `disconnect/route.ts`)

| 조건 | 보관 기간 |
|---|---|
| 탈퇴 시점 기준 `RESOLVED` 신고 없음 | 1년 |
| `RESOLVED` 신고 1건 이상 | 3년 |

보관 기간이 끝난 `RetainedUser` 레코드는 관리자가 "만료 데이터 정리" 버튼으로 일괄 삭제한다.  
보관 기간 내에는 동일 네이버 계정으로 재가입이 차단된다.
