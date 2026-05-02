"use client";

import { useState } from "react";
import Link from "next/link";
import { contactPost, leaveContact } from "@/lib/actions/post";

type ModalState =
  | { type: "idle" }
  | { type: "temp_auth" }
  | { type: "leave_contact"; openAccountAfter?: boolean }
  | { type: "contact_popup"; contact: string }
  | { type: "leave_success" }
  | { type: "reserved_prompt" }
  | { type: "error"; message: string };

type Props = {
  postId: number;
  hasContact: boolean;
  status: string;
  userRole: string;
  viewerHasContact: boolean;
};

export default function ContactSection({ postId, hasContact, status, userRole, viewerHasContact }: Props) {
  const [modal, setModal] = useState<ModalState>({ type: "idle" });
  const [isPending, setIsPending] = useState(false);
  const [contactInput, setContactInput] = useState("");
  const [contactInputError, setContactInputError] = useState("");

  const isActive = status === "ACTIVE" || status === "RESERVED";
  if (!isActive) return null;

  const showContactButton = hasContact || userRole === "USER";
  const showLeaveContactButton = !hasContact && userRole === "TEMP";

  async function handleContactButtonClick() {
    if (isPending) return;

    if (userRole === "TEMP") {
      if (hasContact) {
        setModal({ type: "temp_auth" });
      } else {
        setModal({ type: "leave_contact" });
      }
      return;
    }

    // USER role
    if (!hasContact) {
      // RESERVED 상태면 "이미 예약됨" 안내 먼저
      if (status === "RESERVED") {
        setModal({ type: "reserved_prompt" });
      } else {
        setModal({ type: "leave_contact" });
      }
      return;
    }

    setIsPending(true);
    try {
      const result = await contactPost(postId);
      if ("contact" in result && result.contact !== null) {
        setModal({ type: "contact_popup", contact: result.contact });
      } else if ("contact" in result && result.contact === null) {
        setModal({ type: "leave_contact" });
      } else if ("reserved" in result) {
        setModal({ type: "reserved_prompt" });
      } else if ("error" in result) {
        setModal({ type: "error", message: result.error });
      }
    } finally {
      setIsPending(false);
    }
  }

  async function handleLeaveContact(openAccountAfter = false) {
    if (!contactInput.trim()) {
      setContactInputError("연락처를 입력해주세요.");
      return;
    }
    if (contactInput.trim().length > 50) {
      setContactInputError("연락처는 50자 이내로 입력해주세요.");
      return;
    }
    if (isPending) return;
    setIsPending(true);
    try {
      const result = await leaveContact(postId, contactInput);
      if (result.success) {
        if (openAccountAfter) window.open("/account", "_blank");
        setContactInput("");
        setContactInputError("");
        setModal({ type: "leave_success" });
      } else {
        setContactInputError(result.error ?? "오류가 발생했습니다.");
      }
    } finally {
      setIsPending(false);
    }
  }

  function closeModal() {
    setModal({ type: "idle" });
    setContactInput("");
    setContactInputError("");
  }

  return (
    <div className="card">
      {userRole === "USER" && hasContact && (
        <p className="text-xs text-muted-foreground mb-3">
          "지금 연락하기" 버튼을 누르면 판매자 연락처를 바로 확인할 수 있습니다.
          연락처는 1회만 표시되며 이후 다시 확인할 수 없습니다.
        </p>
      )}
      {userRole === "TEMP" && (
        <p className="text-xs text-muted-foreground mb-3">
          연락처를 남기면 판매자가 직접 연락드립니다.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {showContactButton && (
          <button
            onClick={handleContactButtonClick}
            disabled={isPending}
            className="w-full bg-primary-base text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {isPending ? "처리 중..." : "지금 연락하기"}
          </button>
        )}
        {showLeaveContactButton && (
          <button
            onClick={() => setModal({ type: "leave_contact" })}
            disabled={isPending}
            className="w-full bg-primary-base text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            지금 연락처 남기기
          </button>
        )}
      </div>

      {/* ── 연락처 팝업 ── */}
      {modal.type === "contact_popup" && (
        <ContactPopup contact={modal.contact} onClose={closeModal} />
      )}

      {/* ── TEMP 인증 안내 모달 ── */}
      {modal.type === "temp_auth" && (
        <Overlay>
          <h2 className="text-base font-bold mb-2">인증이 필요합니다</h2>
          <p className="text-sm text-muted-foreground mb-5">
            인증대기 계정은 판매자의 연락처를 확인할 수 없습니다.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setModal({ type: "leave_contact", openAccountAfter: true })}
              className="w-full bg-primary-base text-primary-foreground py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity ring-2 ring-primary-base/30"
            >
              ✨ 내 연락처를 남기고 본캐인증하기
            </button>
            <p className="text-xs text-muted-foreground text-center -mt-1">
              본캐인증이 승인되면 게시글 작성자의 연락처를 바로 확인할 수 있어요!!!
            </p>
            <button
              onClick={() => setModal({ type: "leave_contact", openAccountAfter: false })}
              className="w-full border border-border-base py-2 rounded-lg text-sm hover:bg-muted transition-colors"
            >
              내 연락처만 남기기
            </button>
            <button
              onClick={closeModal}
              className="w-full py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              닫기
            </button>
          </div>
        </Overlay>
      )}

      {/* ── 연락처 입력 모달 ── */}
      {modal.type === "leave_contact" && (
        <Overlay>
          <h2 className="text-base font-bold mb-1">연락처 남기기</h2>
          <p className="text-sm text-muted-foreground mb-4">
            판매자가 확인 후 연락드립니다.
          </p>
          {contactInputError && (
            <p className="text-xs text-red-500 mb-2">{contactInputError}</p>
          )}
          <input
            type="text"
            value={contactInput}
            onChange={(e) => { setContactInput(e.target.value); setContactInputError(""); }}
            maxLength={50}
            placeholder="https://open.kakao.com/..."
            className="input w-full mb-4"
          />
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleLeaveContact(modal.openAccountAfter)}
              disabled={isPending}
              className="w-full bg-primary-base text-primary-foreground py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isPending ? "처리 중..." : "연락처 남기기"}
            </button>
            <button
              onClick={closeModal}
              className="w-full border border-border-base py-2 rounded-lg text-sm hover:bg-muted transition-colors"
            >
              취소
            </button>
          </div>
        </Overlay>
      )}

      {/* ── 연락처 남기기 완료 ── */}
      {modal.type === "leave_success" && (
        <Overlay>
          <div className="text-center">
            <p className="text-2xl mb-3">✅</p>
            <h2 className="text-base font-bold mb-2">연락처를 남겼습니다!</h2>
            {userRole === "TEMP" ? (
              <>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  본캐인증이 승인되면 게시글 작성자의 연락처를 확인할 수 있어요!!!
                  거래자의 연락을 기다리지 말고 먼저 연락하세요!!
                </p>
                <Link
                  href="/account"
                  className="block w-full bg-primary-base text-primary-foreground py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity mb-2 text-center"
                >
                  닉네임 설정하러 가기 →
                </Link>
              </>
            ) : (
              <p className="text-sm text-muted-foreground mb-4">
                판매자가 확인 후 연락드릴 예정입니다.
              </p>
            )}
            <button
              onClick={closeModal}
              className="w-full border border-border-base py-2 rounded-lg text-sm hover:bg-muted transition-colors"
            >
              닫기
            </button>
          </div>
        </Overlay>
      )}

      {/* ── 이미 예약됨 모달 ── */}
      {modal.type === "reserved_prompt" && (
        <Overlay>
          <h2 className="text-base font-bold mb-4">
            {viewerHasContact ? "이미 연락처를 남겼습니다" : "이미 예약된 게시글입니다"}
          </h2>
          {viewerHasContact ? (
            <button
              onClick={closeModal}
              className="w-full border border-border-base py-2 rounded-lg text-sm hover:bg-muted transition-colors"
            >
              닫기
            </button>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                다른 구매자가 먼저 연락했습니다. 연락처를 남기시겠습니까?
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setModal({ type: "leave_contact" })}
                  className="w-full bg-primary-base text-primary-foreground py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  연락처 남기기
                </button>
                <button
                  onClick={closeModal}
                  className="w-full border border-border-base py-2 rounded-lg text-sm hover:bg-muted transition-colors"
                >
                  닫기
                </button>
              </div>
            </>
          )}
        </Overlay>
      )}

      {/* ── 오류 모달 ── */}
      {modal.type === "error" && (
        <Overlay>
          <h2 className="text-base font-bold mb-2">오류</h2>
          <p className="text-sm text-muted-foreground mb-4">{modal.message}</p>
          <button
            onClick={closeModal}
            className="w-full border border-border-base py-2 rounded-lg text-sm hover:bg-muted transition-colors"
          >
            닫기
          </button>
        </Overlay>
      )}
    </div>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-card rounded-xl border border-border-base shadow-xl w-full max-w-sm p-6 text-foreground">
        {children}
      </div>
    </div>
  );
}

function ContactPopup({ contact, onClose }: { contact: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(contact);
    setCopied(true);
  }

  return (
    <Overlay>
      <h2 className="text-base font-bold mb-1">판매자 연락처</h2>
      <p className="text-xs text-amber-600 mb-4">
        이 연락처는 다시 확인할 수 없습니다. 저장해두세요.
      </p>
      <div className="bg-muted rounded-lg px-4 py-3 text-sm font-medium break-all mb-4">
        {contact}
      </div>
      <div className="flex flex-col gap-2">
        <button
          onClick={handleCopy}
          className="w-full bg-primary-base text-primary-foreground py-2 rounded-lg text-sm hover:opacity-90 transition-opacity"
        >
          {copied ? "복사됨!" : "링크 복사"}
        </button>
        <button
          onClick={onClose}
          disabled={!copied}
          className="w-full border border-border-base py-2 rounded-lg text-sm hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          닫기
        </button>
      </div>
    </Overlay>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="w-full bg-primary-base text-primary-foreground py-2 rounded-lg text-sm hover:opacity-90 transition-opacity"
    >
      {copied ? "복사됨!" : "링크 복사"}
    </button>
  );
}
