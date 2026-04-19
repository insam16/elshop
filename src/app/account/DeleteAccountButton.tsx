"use client";

import { useTransition } from "react";
import { deleteAccount } from "@/lib/actions/user";

export default function DeleteAccountButton() {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("정말 탈퇴하시겠어요? 모든 정보가 삭제되며 복구할 수 없습니다.")) return;
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
