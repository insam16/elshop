"use client";

import { useTransition } from "react";
import { purgeDeletedUser } from "@/lib/actions/admin";

export default function PurgeUserButton({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("이 유저의 데이터를 즉시 삭제하시겠습니까?\n쿨다운이 해제되며 되돌릴 수 없습니다.")) return;
    startTransition(() => purgeDeletedUser(userId));
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-xs px-2.5 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50 shrink-0"
    >
      {isPending ? "삭제 중..." : "즉시 삭제"}
    </button>
  );
}
