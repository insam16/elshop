# Contact System (연락처 시스템 설계)

## 1. 목적

거래 과정에서 발생하는 불필요한 대기(댓글 → 응답 → 연락처 교환)를 줄이고,
빠른 외부 연락(카카오톡 오픈채팅 등)을 가능하게 하면서도
스팸 및 개인정보 노출 리스크를 최소화한다.

---

## 2. 핵심 정책

### 2.1 게시글 상태

Post.status
* ACTIVE (판매중)
* RESERVED (예약중)
* COMPLETED (거래완료)
* EXPIRED (만료됨)

### 2.2 공개 정책

* 연락처는 기본적으로 게시글/댓글에 **비공개 상태로 저장**된다.
* 연락처는 **"지금 연락하기" 버튼을 통해 팝업으로 1회만 표시**되며, 확인 후 즉시 null 처리된다.
* **USER(인증) 유저**는 "지금 연락하기" 버튼으로 판매자 연락처를 1회 확인할 수 있다.
* **TEMP(미인증) 유저**는 게시글에 연락처가 있어도 "지금 연락하기" 버튼 클릭 시 인증 안내 모달을 받는다. 모달에서 연락처를 남기고 본캐인증하거나, 연락처만 남길 수 있다.
* **판매자**는 각 댓글의 "지금 연락하기" 버튼으로 구매자 연락처를 1회 확인할 수 있다.

### 2.3 거래 완료 시 처리

* 판매자가 "거래완료" 상태로 변경하면:

  * 게시글 연락처 즉시 null
  * 댓글 연락처 즉시 null
  * 신규 댓글 작성 불가
  * 기존 댓글은 읽기만 가능



## 3. UX 흐름

### 3.1 판매자 (글 작성)

1. 게시글 작성 시 카카오톡 오픈채팅 링크 입력 (선택)

2. 안내 문구 표시
   * "거래 완료 시 연락처는 자동으로 삭제됩니다"

---

### 3.2 USER 구매자 — "지금 연락하기" 버튼

#### 3.2.1 게시글에 연락처가 있는 경우 (post.contact !== null)

1. "지금 연락하기" 버튼 클릭 → `contactPost(postId)` 호출

2. 성공 시 (status === ACTIVE, contact 존재):
   * 판매자 연락처 팝업 표시
     * "이 연락처는 다시 확인할 수 없습니다. 저장해두세요."
   * "연락드렸어요" 댓글 자동 작성
   * status → `RESERVED`, post.contact = null (트랜잭션)

3. 실패 시 (이미 RESERVED — 동시 클릭 경쟁 실패):
   * "이미 예약된 게시글입니다. 연락처를 남기시겠습니까?" 팝업
   * [예] → 3.2.2 흐름으로 전환
   * [아니오] → 닫기

---

#### 3.2.2 게시글에 연락처가 없는 경우 (post.contact === null)

1. "지금 연락하기" 버튼 클릭 → 연락처 입력 모달 표시

2. 확인 → `leaveContact(postId, contact)` 호출
   * "연락 주세요" 댓글 자동 작성 (comment.contact 비공개 저장)
   * status 변경 없음

---

### 3.3 TEMP 구매자

#### 3.3.1 게시글에 연락처가 있는 경우 (post.contact !== null)

1. "지금 연락하기" 버튼 클릭 → 인증 안내 모달 표시

   > "인증대기 계정은 판매자의 연락처를 확인할 수 없습니다."

2. 선택지 (위에서 아래 순서로 표시):

   * **✨ [내 연락처를 남기고 본캐인증하기]** ← 시각적으로 강조 (추천 선택지)
     * "본캐인증이 승인되면 게시글 작성자의 연락처를 바로 확인할 수 있어요!!!"
     * → `leaveContact(postId, contact)` 실행 (연락처 먼저 확보)
     * → 새 창에서 `/account` 열기, 현재 게시글 창 포커스 유지
     * leaveContact 완료 메시지 표시 (하단 참고)

   * **[내 연락처만 남기기]**
     * → `leaveContact(postId, contact)` 실행
     * leaveContact 완료 메시지 표시 (하단 참고)

   * [닫기]

3. **leaveContact 완료 시 (TEMP 공통)** — 모달 또는 인라인으로 표시:

   > "본캐인증이 승인되면 게시글 작성자의 연락처를 확인할 수 있어요!!!
   > 거래자의 연락을 기다리지 말고 먼저 연락하세요!!"
   >
   > **[닉네임 설정하러 가기 →]** (`/account` 바로가기 버튼)

---

#### 3.3.2 게시글에 연락처가 없는 경우 (post.contact === null)

1. "지금 연락처 남기기" 버튼 클릭 → 연락처 입력 모달 표시

2. 확인 → `leaveContact(postId, contact)` 호출
   * "연락 주세요" 댓글 자동 작성 (comment.contact 비공개 저장)
   * status 변경 없음
   * leaveContact 완료 메시지 표시 (3.3.1 하단과 동일)

---

### 3.4 판매자 — 댓글의 "지금 연락하기" 버튼

판매자에게만 각 댓글 옆에 표시됨 (comment.contact !== null인 경우)

1. "지금 연락하기" 버튼 클릭 → `contactComment(commentId)` 호출

2. 즉시:
   * 구매자 연락처 팝업 표시
     * "이 연락처는 다시 확인할 수 없습니다. 저장해두세요."
   * "연락드렸어요" 답글 자동 작성
   * status → `RESERVED`, post.contact = null, comment.contact = null (트랜잭션)

---

### 3.5 예약 상태 (RESERVED)

1. post.contact = null (이미 처리됨)

2. USER 구매자:
   * "지금 연락하기" 클릭 → 3.2.1 실패 경로 → "이미 예약된 게시글입니다. 연락처를 남기시겠습니까?"
   * [예] → leaveContact 흐름 (3.2.2와 동일)

3. TEMP 구매자:
   * "지금 연락처 남기기" 클릭 → leaveContact 모달 (3.3.2와 동일)
   * leaveContact 완료 메시지 표시

---

### 3.6 거래 완료

1. 작성자가 "거래완료" 버튼 클릭

2. 즉시:
   * 게시글 상태 → `COMPLETED`
   * 게시글 연락처 = null
   * 댓글 연락처 = null
   * 댓글 작성 불가

3. UI 표시:
   * "거래 완료된 게시글입니다"

---

### 3.7 게시글 만료

1. 게시글 작성 168시간(24시간 × 7일) 경과 시 자동 처리
   * ACTIVE 글 → `EXPIRED`
   * RESERVED 글 → `COMPLETED` (거래 성사로 간주)

2. 즉시:
   * 게시글 수정 불가
   * 게시글 및 댓글 연락처 = null
   * 댓글 작성 불가

3. UI 표시:
   * EXPIRED: "만료된 게시글입니다"
   * COMPLETED: "거래 완료된 게시글입니다"

## 4. 데이터 모델

### Post

* id
* title
* content
* authorId
* status (ENUM)

  * ACTIVE
  * RESERVED
  * COMPLETED
  * EXPIRED
* contact (TEXT)
* expiresAt (DATETIME)
* createdAt

### Comment

* id
* postId
* authorId
* content
* contact
* createdAt

---

## 5. 게시글 상태 변화

### 초기 상태

* status: ACTIVE

---

### contactPost (USER + contact 있음)

트랜잭션으로 처리:

* "연락드렸어요" 댓글 생성
* status = RESERVED
* post.contact 값 반환 후 null 처리

실패 조건:

* status !== ACTIVE → `{ reserved: true }` 반환 (이미 예약됨)

---

### leaveContact (USER/TEMP + contact 없음 또는 RESERVED 상태)

처리:

* "연락 주세요" 댓글 생성 (comment.contact 저장)
* status 변경 없음

---

### contactComment (판매자 → 댓글 버튼)

트랜잭션으로 처리:

* "연락드렸어요" 답글 생성
* status = RESERVED
* post.contact = null
* comment.contact 값 반환 후 null 처리

---

### 거래 완료

처리:

* status = COMPLETED
* post.contact = null
* 댓글의 contact 모두 null

---

### 만료 처리

조건:

* 현재 시간 > expiresAt

처리:

* ACTIVE → status = EXPIRED
* RESERVED → status = COMPLETED
* post.contact = null
* 댓글의 contact 모두 null

---

## 6. Server Action 설계

> 이 프로젝트는 REST API 대신 Next.js Server Actions를 사용합니다.
> 모든 데이터 변경은 `src/lib/actions/` 하위 파일에서 `"use server"` 함수로 처리합니다.

---

### 게시글 연락하기

**`contactPost(postId)`**
`src/lib/actions/post.ts`

반환값:
* `{ contact: string }` — 성공
* `{ reserved: true }` — 이미 RESERVED (경쟁 실패)

처리:

1. `auth()` — 미로그인 시 `/login` redirect
2. `session.user.role === USER` 확인
3. `prisma.post.findUnique` — status, contact 조회
4. `status !== ACTIVE` → `{ reserved: true }` 반환
5. `contact === null` → `{ contact: null }` 반환 (클라이언트가 leaveContact 모달로 전환)
6. 트랜잭션:
   * `prisma.comment.create({ content: "연락드렸어요", authorId, postId })`
   * `prisma.post.update({ where: { id: postId, status: ACTIVE }, data: { status: RESERVED, contact: null } })`
   * `WHERE status = ACTIVE` 조건으로 동시 클릭 시 첫 번째만 성공 보장
7. `{ contact: post.contact }` 반환 (트랜잭션 전 캡처한 값)
8. `revalidatePath(`/posts/${postId}`)`

---

### 연락처 남기기

**`leaveContact(postId, contact)`**
`src/lib/actions/post.ts`

처리:

1. `auth()` — 미로그인 시 `/login` redirect
2. `prisma.comment.create({ content: "연락 주세요", contact, authorId, postId })`
3. `revalidatePath(`/posts/${postId}`)`

---

### 댓글 연락하기

**`contactComment(commentId)`**
`src/lib/actions/comment.ts`

반환값:
* `{ contact: string }` — 성공

처리:

1. `auth()` — 미로그인 시 `/login` redirect
2. `session.user.id === post.authorId` 확인 (게시글 작성자만)
3. `prisma.comment.findUnique` — contact, postId 조회
4. 트랜잭션:
   * `prisma.comment.create({ content: "연락드렸어요", authorId, postId, parentId: commentId })`
   * `prisma.post.update({ status: RESERVED, contact: null })`
   * `prisma.comment.update({ where: { id: commentId }, data: { contact: null } })`
5. `{ contact: comment.contact }` 반환 (트랜잭션 전 캡처한 값)
6. `revalidatePath(`/posts/${postId}`)`

---

### 거래 완료

**`completePost(postId)`**
`src/lib/actions/post.ts`

처리:

1. `auth()` — 미로그인 시 `/login` redirect
2. 게시글 작성자 본인 확인
3. `prisma.post.update({ status: COMPLETED, contact: null })`
4. `prisma.comment.updateMany({ where: { postId }, data: { contact: null } })`
5. `revalidatePath(`/posts/${postId}`)`

---

### 만료 처리 (Route Handler + 외부 cron)

**`GET /api/cron/expire-posts`**
`src/app/api/cron/expire-posts/route.ts`

주기: 5~10분 (Vercel Cron Jobs 또는 외부 스케줄러)

처리:

1. `expiresAt < now` 인 ACTIVE / RESERVED 게시글 조회
2. ACTIVE 게시글:
   * `prisma.post.updateMany({ status: EXPIRED, contact: null })`
3. RESERVED 게시글:
   * `prisma.post.updateMany({ status: COMPLETED, contact: null })`
4. `prisma.comment.updateMany({ where: { postId: { in: expiredIds } }, data: { contact: null } })`

---

## 7. UI 규칙

### 연락처 표시 조건

연락처는 페이지에 직접 렌더링하지 않는다. 모두 팝업(액션 응답값)으로만 1회 표시한다.

예외: 판매자는 자신의 게시글에서 현재 등록된 연락처 확인 가능
* `status === ACTIVE && contact !== null && user.id === post.authorId`

---

### 버튼 표시 조건

* 게시글 "지금 연락하기"
  * `post.contact !== null`인 경우: `user.id !== post.authorId && (status === ACTIVE || status === RESERVED)`
    * USER → contactPost 성공 흐름
    * TEMP → 인증 안내 모달 (본캐인증 or 연락처 남기기)
  * `post.contact === null`인 경우: `user.role === USER && user.id !== post.authorId && (status === ACTIVE || status === RESERVED)`
    * 연락처 입력 모달 → leaveContact

* 게시글 "지금 연락처 남기기" (TEMP 전용, contact 없을 때)
  * `user.role === TEMP && post.contact === null && user.id !== post.authorId && (status === ACTIVE || status === RESERVED)`

* 댓글 "지금 연락하기" (판매자)
  * `user.id === post.authorId && comment.contact !== null && status === ACTIVE`

---

### 댓글 작성 가능 조건

* `status === ACTIVE || status === RESERVED`

---

### 안내 문구

#### 게시글 작성 시

* "거래 완료 시 연락처는 자동으로 삭제됩니다"

#### 게시글 상세 (USER)

* "지금 연락하기 버튼을 누르면 판매자 연락처를 바로 확인할 수 있습니다"
* "연락처는 1회만 표시되며 이후 다시 확인할 수 없습니다"

#### 게시글 상세 (TEMP)

* "연락처를 남기면 판매자가 직접 연락드립니다"

#### leaveContact 완료 후 (TEMP 공통)

* "본캐인증이 승인되면 게시글 작성자의 연락처를 확인할 수 있어요!!! 거래자의 연락을 기다리지 말고 먼저 연락하세요!!"
* **[닉네임 설정하러 가기 →]** 버튼 (`/account` 이동)

---

## 8. 보안 및 악용 방지

### 최소 방어

* 비로그인 접근 차단
* 게시글 만료

### 향후 확장

* 계정 생성 후 n분 제한
* 이메일 인증 유저만 접근
* 신고 기반 차단 시스템

---

## 9. 향후 개선 방향

* Web Push 알림 (댓글/거래 요청)
* WebSocket 기반 실시간 댓글
* 거래 요청/수락 구조 도입
* 유저별 연락처 공개 제한 (선택 공개)

---

## 10. 요약

* 빠른 거래를 위해 "지금 연락하기" 버튼 즉시 연결 구조 채택
* 연락처는 팝업으로 1회만 표시 후 즉시 null 처리 — 불필요한 노출 최소화
* TEMP는 판매자 연락처 확인 불가 — 인증 안내 모달로 유도, 연락처 남기기 가능
* 트랜잭션으로 동시 클릭 경쟁 처리 — 첫 번째 클릭만 RESERVED 전환
* 거래 완료 및 만료로 잔여 연락처 일괄 초기화

> 목표: 거래 속도 최대화 + 최소한의 안전성 확보
