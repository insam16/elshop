# [엘소드 샵] 부정 이용 방지 및 재가입 차단 시스템 구현 명세

## 1. 목적

* 사기 및 부정 이용자의 재가입 방지
* 분쟁 대응 및 수사 협조를 위한 최소 정보 보관
* 일반 서비스 데이터와 분리된 보안 저장소 운영

---

## 2. 핵심 설계 원칙

1. 개인정보 최소 수집
2. 식별자 해싱 저장
3. 일반 서비스 DB와 논리적 분리
4. 접근 권한 제한 (관리자 only)
5. 보관 기간 자동 만료 (TTL)

---

## 3. 데이터 구조

### 테이블: abuse_signals

```sql
CREATE TABLE abuse_signals (
  id BIGSERIAL PRIMARY KEY,
  provider VARCHAR(20) NOT NULL, -- 'naver'
  provider_user_id_hash TEXT NOT NULL,
  nickname TEXT, 
  reason TEXT, -- 'scam', 'abuse', etc
  risk_level VARCHAR(20) NOT NULL, -- 'normal', 'reported', 'fraud'
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 4. 해싱 규칙

```ts
import crypto from "crypto";

function hash(value: string) {
  const SALT = process.env.SECURITY_SALT;
  return crypto
    .createHash("sha256")
    .update(value + SALT)
    .digest("hex");
}
```

* naver_id → 반드시 해싱(Account에는 이미 되어있음)
* nickname → 원문 그대로 저장 

---

## 5. 보관 기간 정책

| 유형       | 기간            |
| -------- | ------------- |
| 일반 이용자   | 최대 1년 |
| 신고/이상 이용 | 최대 3년         |

---

## 6. 저장 로직

```ts
function saveAbuseSignal({ naverId, nickname, riskLevel }) {
  const hashedId = hash(naverId);
  const hashedNickname = hash(nickname);

  let expiresAt;

  if (riskLevel === "normal") {
    expiresAt = now + 6 months;
  } else if (riskLevel === "reported") {
    expiresAt = now + 3 years;
  }

  insert into abuse_signals;
}
```

---

## 7. 가입 차단 로직

```ts
function isBlocked(naverId) {
  const hashedId = hash(naverId);

  const record = find abuse_signals
    where provider_user_id_hash = hashedId
    and expires_at > now;

  return !!record;
}
```

---

## 8. 접근 제어

* abuse_signals 테이블은 일반 API에서 접근 금지
* 관리자(Admin)만 접근 가능
* 별도 DB connection 또는 repository 사용

---

## 9. 데이터 분리 (중요)

다음 중 최소 1개 이상 적용:

### 옵션 A (필수)

* 테이블 분리 + 코드 레벨 접근 차단

### 옵션 B (추천)

* DB 계정 분리

  * app_user → users 접근
  * security_user → abuse_signals 접근

### 옵션 C (베스트)

* DB 자체 분리 (main DB / security DB)

---

## 10. 자동 삭제 (TTL)

```ts
cron job (daily):
  DELETE FROM abuse_signals
  WHERE expires_at < now;
```

---

## 11. 개인정보 처리방침

회사는 부정 이용 방지 및 분쟁 대응, 수사 협조를 위하여 외부 인증 서비스로부터 제공받은 이용자 식별자를 암호화하여 보관할 수 있습니다.

또한 동일 이용자의 재가입 방지 및 사기 이력 확인을 위하여 필요한 경우에 한하여, 이전 닉네임 등 식별 가능 정보의 일부를 최소한의 범위 내에서 제한적으로 보관할 수 있습니다.

* 일반 이용자의 경우: 탈퇴 후 최대 1년
* 신고 또는 부정 이용이 확인된 경우: 분쟁 대응 및 수사 협조를 위하여 최대 3년까지 보관될 수 있습니다.

해당 정보는 일반 서비스 이용 정보와 분리된 별도의 저장소에 안전하게 보관되며, 접근 권한이 제한됩니다. 보관 기간 경과 시 해당 정보는 지체 없이 파기됩니다.

---

## 12. 주의사항

* 원본 naver_id 절대 저장 금지
* users 테이블과 JOIN 금지
* 프론트엔드 접근 금지
* 로그 남기기 (누가 조회했는지)

---

## 13. 확장 가능

* device_hash 추가
* IP 대역 기반 차단
* 점수 기반 차단 시스템

---
