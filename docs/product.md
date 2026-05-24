# 서비스 명세 (Product Spec)

## 1. 서비스 개요

엘소드 샵은 엘소드 유저 간 거래 정보를 공유하는 커뮤니티형 게시판 서비스다.  
플랫폼은 거래를 직접 중개하지 않는다. 거래 당사자 간 연락처(카카오톡 오픈채팅 링크)를 연결해주는 것이 핵심 역할이다.

---

## 2. 유저 역할 및 온보딩

### 역할 정의

| 역할 | 설명 |
|---|---|
| `TEMP` | 네이버 로그인 직후 부여. 기능 제한 있음 |
| `USER` | 관리자 인증 승인 후 전환. 전체 기능 사용 가능 |
| `ADMIN` | DB에서 직접 부여. 관리자 패널 접근 가능 |

### 온보딩 흐름

1. `/login` 에서 네이버 OAuth 로그인
2. 신규 계정은 `TEMP` 역할로 생성
3. 관리자가 `/admin/users` 에서 캐릭터명(인게임 닉네임) 확인 후 승인
4. 승인 시 `USER` 역할로 전환, 닉네임 설정 완료
5. 거절 시 `TEMP` 유지, 재신청 가능

### TEMP 계정 제한

- 게시글: 24시간에 1개
- 댓글(연락처 남기기): 24시간에 3개
- 연락하기(판매자 연락처 조회): 불가 (`USER`만 가능)

### 닉네임 규칙

- 한글, 영문, 숫자만 허용
- 맨 뒤에 `@S` 또는 `@G` 접미사 허용 (서버 구분)
- 최대 12 길이 (한글 1자 = 2)

---

## 3. 게시판 (Board)

게시판은 거래 종류에 따라 4개로 구분된다.

| 코드 | 이름 | 설명 |
|---|---|---|
| `CREDIT` | 신용 | 아이템-현금 거래 |
| `ED` | ED | ED-현금 거래 |
| `GENERAL` | 일반 | 아이템-ED 거래 |
| `OTHER` | 기타 | 기타 거래 |

---

## 4. 게시글 (Post)

### 주요 필드

| 필드 | 설명 |
|---|---|
| `title` | 아이템명/가격/수량 (최대 256 길이) |
| `content` | 기타 사항 (선택, 최대 256 길이) |
| `board` | 게시판 (`CREDIT` / `ED` / `GENERAL` / `OTHER`) |
| `category` | 거래 종류 |
| `status` | 거래 상태 |
| `tradeMethod` | 거래 방식 |
| `negotiable` | 흥정 가능 여부 |
| `characterName` | 캐릭터명 (선택) |
| `contact` | 카카오톡 오픈채팅 링크 (작성 시 입력, 거래 후 삭제) |
| `isPremium` / `premiumUntil` | 프리미엄 게시글 여부 |
| `expiresAt` | 만료 시각 (작성 시점 + 7일) |
| `deletedAt` | soft delete |

### 거래 종류 (Category)

| 코드 | 표시 | 허용 게시판 |
|---|---|---|
| `SELL` | 팝니다 | 전체 |
| `BUY` | 삽니다 | 전체 |
| `TRADE` | 교환 | `GENERAL`만 |

### 거래 상태 (Status)

| 코드 | 표시 | 의미 |
|---|---|---|
| `ACTIVE` | 거래 가능 | 거래 진행 가능 |
| `RESERVED` | 예약 | 연락하기 이후 자동 전환 |
| `COMPLETED` | 거래 완료 | 작성자가 완료 처리 |
| `EXPIRED` | 만료됨 | 7일 경과 또는 탈퇴 시 자동 전환 |

### 거래 방식 (TradeMethod)

게시판별로 선택 가능한 방식이 다르다.

| 게시판 | 선택 가능 방식 |
|---|---|
| `CREDIT` | 아이템 확인 - 입금 - 거래 / 길드 가입 - 입금 - 거래 - 탈퇴 / 기타 |
| `ED` | ED 확인 - 입금 - 거래 / 우편 / 게시판 / 기타 |
| `GENERAL` | 개인거래 / 게시판 / 기타 |
| `OTHER` | 입금 - 길드 마스터 위임 / 화면 공유 닉네임 확인 - 입금 - 삭제 - 취득 / 기타 |

### 캐릭터명 규칙

- 한글, 영문, 숫자만 허용
- 맨 뒤에 `@S` 또는 `@G` 허용 (서버 구분)
- 최대 12 길이 (한글 1자 = 2)
- 게시글 작성 시 선택 입력

---

## 5. 거래 흐름 (Trade Flow)

게시글 하나당 1건의 거래를 다룬다. 연락처는 거래 완료 후 즉시 삭제된다.

```
작성자 → 게시글 작성 (contact: 오픈채팅 링크, status: ACTIVE)
        ↓
구매자 → [연락하기]                     구매자 → [연락처 남기기]
        ↓                                         ↓
  판매자 연락처 노출                  comment.contact에 구매자 링크 저장
  post.contact 삭제                   comment.content = "연락 주세요"
  post.status = RESERVED
  comment "연락드렸어요" 생성
        ↓
작성자 → [거래 완료]
        ↓
  post.status = COMPLETED
  post.contact = null
  모든 comment.contact = null
```

### 연락하기 (`contactPost`)

- `USER` 역할만 가능
- 제재(ban) 중인 계정 불가
- 본인 게시글 불가
- `ACTIVE` 상태인 게시글에만 가능
- 실행 시 post.contact를 반환하고, 동시에 post.status를 `RESERVED`로, post.contact를 null로 변경 (트랜잭션)
- race condition 방지: `P2025` 에러 시 이미 예약됨으로 처리

### 연락처 남기기 (`leaveContact`)

- `ACTIVE` 또는 `RESERVED` 상태 게시글에 가능
- 카카오톡 오픈채팅 링크(`https://open.kakao.com/...`)만 허용
- 최대 50자
- 동일 게시글에 1번만 가능
- `TEMP` 계정: 24시간에 댓글 3개 한도

### 거래 완료 (`completePost`)

- 게시글 작성자만 가능
- `COMPLETED` / `EXPIRED` 상태에서는 불가
- 실행 시 post.status = `COMPLETED`, post.contact = null, 모든 comment.contact = null

---

## 6. 댓글 (Comment)

- 게시글에 최상위 댓글 및 1-depth 답글 작성 가능
- soft delete (`deletedAt`)
- 삭제된 댓글은 "삭제된 댓글입니다" 표시, 답글은 유지
- 특수 댓글:
  - `content = "연락드렸어요"`: 연락하기 실행 시 자동 생성
  - `content = "연락 주세요"`, `contact != null`: 연락처 남기기 실행 시 생성 (contact는 게시글 작성자와 댓글 작성자 본인에게만 노출)

---

## 7. 알림 (Notification)

### 알림 종류

| 타입 | 발생 조건 |
|---|---|
| `COMMENT_ON_MY_POST` | 내 게시글에 댓글이 달렸을 때 |
| `REPLY_TO_MY_COMMENT` | 내 댓글에 답글이 달렸을 때 |
| `KEYWORD_MATCH` | 등록한 키워드가 새 게시글 제목/내용에 포함될 때 |
| `NICKNAME_CHANGED` | 관리자 강제 닉네임 변경 시 |

### 중복 방지

- 답글 작성 시: 부모 댓글 작성자에게 `REPLY_TO_MY_COMMENT`, 게시글 작성자에게 `COMMENT_ON_MY_POST` 각각 발송. 단, 부모 댓글 작성자와 게시글 작성자가 같으면 `REPLY_TO_MY_COMMENT` 1건만 발송
- 키워드 알림: 동일 유저가 복수 키워드 매칭 시 첫 번째 매칭 키워드로만 1건 발송
- 본인 게시글/댓글에는 알림 발송하지 않음

### 키워드 알림 설정

- 계정 설정(`/account`)에서 키워드 최대 10개 등록
- 키워드별 활성/비활성 토글
- 키워드 2~20자
- 새 게시글 작성 시 제목+내용 텍스트에서 대소문자 무시 매칭

### 읽음 처리

- `/notifications` 에서 목록 조회 (최신 30건)
- "모두 읽음" 버튼으로 일괄 처리

---

## 8. 검색 및 필터

게시글 목록(`/posts`)에서 사용 가능:

| 파라미터 | 설명 |
|---|---|
| `q` | 제목 또는 내용 검색 (최대 20자, 350ms 디바운스) |
| `board` | 게시판 필터 |
| `category` | 거래 종류 필터 (`SELL` / `BUY` / `TRADE`) |
| `status` | 거래 상태 필터 |

---

## 9. 유저 프로필 (`/users/[publicId]`)

- 닉네임, 게시글 수, 댓글 수 표시
- 작성 게시글 목록 (삭제되지 않은 것)
- 작성 댓글 목록 (삭제되지 않은 것)
- 탈퇴한 유저는 "탈퇴한 사용자입니다." 표시

---

## 10. 프리미엄 게시글

- `isPremium = true`, `premiumUntil` 설정된 게시글
- 목록에서 상단 노출 및 시각적 강조 (앰버 배경)
- `premiumUntil` 만료 후 일반 게시글로 전환

---

## 11. 계정 탈퇴

- `/account` 에서 탈퇴 가능
- 탈퇴 즉시:
  - 닉네임 `탈퇴#publicId`로 익명화
  - `role = TEMP`, `deletedAt = now`
  - OAuth 연결 해제 (재로그인 불가)
  - ACTIVE 게시글 → `EXPIRED`, RESERVED 게시글 → `COMPLETED`
  - 모든 연락처(contact) 삭제
- 실제 닉네임과 hashedNaverId는 `RetainedUser` 테이블에 보관 (재가입 차단 및 사후 대응용)
- 보관 기간:
  - 처리 완료된 신고(`RESOLVED`) 없음: 1년
  - `RESOLVED` 신고 1건 이상: 3년
- 보관 기간 내 동일 네이버 계정으로 재가입 차단
