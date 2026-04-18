"use client";

import { useTransition } from "react";
import { deletePost } from "@/lib/actions/post";

export default function DeleteButton({ postId }: { postId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("게시글을 삭제할까요?")) return;
    startTransition(async () => {
      await deletePost(postId);
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-sm text-red-500 border border-red-200 px-3 py-1 rounded hover:bg-red-50 disabled:opacity-50"
    >
      {isPending ? "삭제 중..." : "삭제"}
    </button>
  );
}
