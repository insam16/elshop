"use client";

import { useActionState, useTransition, useRef } from "react";
import { createComment, deleteComment, type CommentState } from "@/lib/actions/comment";
import { formatDate } from "@/lib/utils/date";

type Comment = {
  id: string;
  content: string;
  createdAt: Date;
  author: { id: string; nickname: string | null; name: string | null };
};

type Props = {
  postId: string;
  comments: Comment[];
  currentUserId?: string;
  isAdmin?: boolean;
};

export default function Comments({ postId, comments, currentUserId, isAdmin }: Props) {
  const action = createComment.bind(null, postId);
  const [state, formAction, isPending] = useActionState<CommentState, FormData>(action, {});
  const formRef = useRef<HTMLFormElement>(null);

  // 제출 성공 시 폼 초기화
  const prevError = state.error;
  if (!prevError && !isPending) formRef.current?.reset();

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-semibold text-sm">
        댓글 <span className="text-muted-foreground">{comments.length}</span>
      </h2>

      {/* 댓글 목록 */}
      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">첫 댓글을 남겨보세요.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border-base">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
            />
          ))}
        </ul>
      )}

      {/* 댓글 작성 폼 */}
      {currentUserId ? (
        <form ref={formRef} action={formAction} className="flex flex-col gap-2">
          {state.error && (
            <p className="text-xs text-red-500">{state.error}</p>
          )}
          <textarea
            name="content"
            rows={3}
            maxLength={500}
            placeholder="댓글을 입력하세요 (최대 500자)"
            className="w-full border border-border-base rounded-lg px-3 py-2 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary-base resize-none"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="bg-primary-base text-primary-foreground px-4 py-1.5 rounded-lg text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isPending ? "등록 중..." : "댓글 등록"}
            </button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-2">
          댓글을 작성하려면 로그인이 필요합니다.
        </p>
      )}
    </section>
  );
}

function CommentItem({
  comment,
  postId,
  currentUserId,
  isAdmin,
}: {
  comment: Comment;
  postId: string;
  currentUserId?: string;
  isAdmin?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const canDelete = currentUserId === comment.author.id || isAdmin;

  function handleDelete() {
    if (!confirm("댓글을 삭제할까요?")) return;
    startTransition(async () => {
      await deleteComment(comment.id, postId);
    });
  }

  return (
    <li className="py-3 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            {comment.author.nickname ?? comment.author.name}
          </span>
          <span>{formatDate(comment.createdAt)}</span>
        </div>
        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="text-xs text-muted-foreground hover:text-red-500 disabled:opacity-50 transition-colors"
          >
            삭제
          </button>
        )}
      </div>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
    </li>
  );
}
