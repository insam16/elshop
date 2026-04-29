"use client";

import { useTransition, useRef } from "react";
import { hidePost, restorePost } from "@/lib/actions/admin";

type Props = {
  reportId: string;
  postId: number;
  isHidden: boolean;
};

export default function PostActionButtons({ reportId, postId, isHidden }: Props) {
  const [isPending, startTransition] = useTransition();
  const noteRef = useRef<HTMLTextAreaElement>(null);

  function handleAction(action: "hide" | "restore") {
    const label = action === "hide" ? "숨김" : "복구";
    if (!confirm(`게시글을 ${label} 처리할까요?`)) return;
    const note = noteRef.current?.value.trim() || null;
    startTransition(async () => {
      if (action === "hide") await hidePost(reportId, postId, note);
      else await restorePost(reportId, postId, note);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="label">
          처리 메모 <span className="text-muted-foreground font-normal">(선택)</span>
        </label>
        <textarea
          ref={noteRef}
          rows={2}
          maxLength={500}
          placeholder="숨김/복구 사유를 남겨주세요."
          className="input resize-none"
        />
      </div>
      <div className="flex gap-2 justify-end">
        {isHidden ? (
          <button
            onClick={() => handleAction("restore")}
            disabled={isPending}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? "처리 중..." : "게시글 복구"}
          </button>
        ) : (
          <button
            onClick={() => handleAction("hide")}
            disabled={isPending}
            className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            {isPending ? "처리 중..." : "게시글 숨김"}
          </button>
        )}
      </div>
    </div>
  );
}
