"use client";

import { useTransition } from "react";
import { deleteAccount } from "@/lib/actions/user";

export default function DeleteAccountButton() {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("정말 탈퇴하시겠어요?")) return;
    if (!confirm(
      "탈퇴 시 개인정보 처리 안내\n\n" +
      "• 닉네임과 암호화된 네이버 계정 식별자는 1년간 보관 후 삭제됩니다.\n" +
      "• 신고 이력이 있는 경우 닉네임과 식별자가 최대 3년간 보관될 수 있습니다.\n" +
      "• 작성하신 게시글과 댓글은 삭제되지 않고, 현재 닉네임은 '탈퇴#aZ82A9jo7U74' 형태로 익명화되어 남습니다.\n\n" +
      "위 내용에 동의하고 탈퇴를 진행하시겠습니까?"
    )) return;
    startTransition(async () => {
      await deleteAccount();
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-sm text-red-500 border border-red-200 px-4 py-2 rounded hover:bg-red-50 disabled:opacity-50"
    >
      {isPending ? "탈퇴 처리 중..." : "회원 탈퇴"}
    </button>
  );
}
