"use client";

import { useState } from "react";
import { completePost } from "@/lib/actions/post";

export default function CompletePostButton({ postId }: { postId: number }) {
  const [isPending, setIsPending] = useState(false);

  async function handleComplete() {
    if (!confirm("거래완료로 변경하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
    setIsPending(true);
    try {
      const result = await completePost(postId);
      if (!result.success && result.error) alert(result.error);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button
      onClick={handleComplete}
      disabled={isPending}
      className="text-sm border border-border-base px-3 py-1 rounded hover:bg-muted transition-colors disabled:opacity-50"
    >
      {isPending ? "처리 중..." : "거래완료"}
    </button>
  );
}
