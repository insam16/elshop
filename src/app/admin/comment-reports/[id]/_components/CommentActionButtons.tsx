"use client";

import { useTransition, useState } from "react";
import { deleteCommentByAdmin, type AdminActionState } from "@/lib/actions/admin";

type Props = {
  commentReportId: string;
  commentId: string;
  isDeleted: boolean;
};

export default function CommentActionButtons({ commentReportId, commentId, isDeleted }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    if (!confirm("댓글을 삭제할까요? 이 작업은 되돌릴 수 없습니다.")) return;
    startTransition(async () => {
      const result: AdminActionState = await deleteCommentByAdmin(commentReportId, commentId);
      if (result?.error) setError(result.error);
    });
  }

  if (isDeleted) {
    return (
      <span className="text-sm text-muted-foreground px-4 py-2 border border-border-base rounded-lg inline-block">
        이미 삭제된 댓글입니다
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <p className="form-error">{error}</p>
      )}
      <div>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 disabled:opacity-50 transition-colors"
        >
          {isPending ? "삭제 중..." : "댓글 삭제"}
        </button>
      </div>
    </div>
  );
}
