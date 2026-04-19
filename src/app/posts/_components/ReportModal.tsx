"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createReport, type ReportState } from "@/lib/actions/report";
import { ReportReason } from "@prisma/client";

const REASON_LABEL: Record<ReportReason, string> = {
  FRAUD: "사기",
  FALSE_INFO: "허위 정보",
  INAPPROPRIATE: "부적절한 내용",
  OTHER: "기타",
};

export default function ReportModal({ postId }: { postId: number }) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, formAction, isPending] = useActionState<ReportState, FormData>(
    createReport,
    {}
  );

  useEffect(() => {
    if (open) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [open]);

  // 성공 시 자동 닫기
  useEffect(() => {
    if (state.success) {
      const t = setTimeout(() => setOpen(false), 1200);
      return () => clearTimeout(t);
    }
  }, [state.success]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-red-500 hover:text-red-600 border border-red-500/30 px-3 py-1 rounded transition-colors"
      >
        신고
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        className="fixed inset-0 m-auto h-fit rounded-xl border border-border-base bg-card p-6 w-[calc(100%-2rem)] max-w-sm shadow-xl backdrop:bg-black/40 animate-in fade-in zoom-in duration-200 text-foreground"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold">게시글 신고</h2>
          <button
            onClick={() => setOpen(false)}
            className="p-1 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
            title="닫기"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {state.success ? (
          <p className="text-sm text-emerald-500 font-medium text-center py-4">
            신고가 접수되었습니다.
          </p>
        ) : (
          <form action={formAction} className="flex flex-col gap-4">
            <input type="hidden" name="postId" value={postId} />

            {state.error && (
              <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
                {state.error}
              </p>
            )}

            {/* 신고 사유 */}
            <div>
              <label className="block text-sm font-medium mb-1">신고 사유</label>
              <select
                name="reason"
                defaultValue="FRAUD"
                className="w-full border border-border-base rounded-lg px-3 py-2 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary-base"
              >
                {Object.values(ReportReason).map((r) => (
                  <option key={r} value={r}>
                    {REASON_LABEL[r]}
                  </option>
                ))}
              </select>
            </div>

            {/* 상세 설명 */}
            <div>
              <label className="block text-sm font-medium mb-1">
                상세 설명 <span className="text-muted-foreground font-normal">(선택)</span>
              </label>
              <textarea
                name="detail"
                rows={3}
                maxLength={500}
                placeholder="구체적인 내용을 적어주시면 빠른 처리에 도움이 됩니다."
                className="w-full border border-border-base rounded-lg px-3 py-2 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary-base resize-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="border border-border-base px-4 py-2 rounded-lg text-sm hover:bg-muted transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {isPending ? "접수 중..." : "신고 접수"}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}
