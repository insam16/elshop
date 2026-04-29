"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { requestPostDeletion, type ReportState } from "@/lib/actions/report";

export default function DeleteRequestModal({ postId }: { postId: number }) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, formAction, isPending] = useActionState<ReportState, FormData>(
    requestPostDeletion,
    {}
  );

  useEffect(() => {
    if (open) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [open]);

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
        className="text-sm text-muted-foreground hover:text-red-500 border border-border-base px-3 py-1 rounded transition-colors"
      >
        삭제 요청
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        className="fixed inset-0 m-auto h-fit rounded-xl border border-border-base bg-card p-6 w-[calc(100%-2rem)] max-w-sm shadow-xl backdrop:bg-black/40 animate-in fade-in zoom-in duration-200 text-foreground"
      >
        <div className="page-header">
          <h2 className="text-base font-bold">게시글 삭제 요청</h2>
          <button
            onClick={() => setOpen(false)}
            className="p-1 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
            title="닫기"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {state.success ? (
          <p className="text-sm text-emerald-500 font-medium text-center py-4">
            삭제 요청이 접수되었습니다.
          </p>
        ) : (
          <form action={formAction} className="flex flex-col gap-4">
            <input type="hidden" name="postId" value={postId} />
            <p className="text-sm text-muted-foreground">
              관리자가 검토 후 삭제를 처리합니다. 삭제 사유를 입력해 주세요.
            </p>

            {state.error && (
              <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
                {state.error}
              </p>
            )}

            <textarea
              name="reason"
              rows={3}
              maxLength={500}
              placeholder="삭제 사유를 입력해 주세요. (선택)"
              className="input resize-none"
            />

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
                {isPending ? "접수 중..." : "삭제 요청"}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}
