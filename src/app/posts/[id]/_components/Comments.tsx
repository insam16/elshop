"use client";

import Link from "next/link";
import { useActionState, useTransition, useRef, useState, useEffect } from "react";
import { createComment, deleteComment, type CommentState } from "@/lib/actions/comment";
import { formatDate } from "@/lib/utils/date";
import CommentReportModal from "@/app/posts/_components/CommentReportModal";

type Author = { id: string; publicId: string; nickname: string | null; name: string | null };

type Reply = {
  id: string;
  content: string;
  createdAt: Date;
  author: Author;
};

type Comment = {
  id: string;
  content: string;
  createdAt: Date;
  author: Author;
  replies: Reply[];
};

type Props = {
  postId: number;
  comments: Comment[];
  currentUserId?: string;
  isAdmin?: boolean;
};

export default function Comments({ postId, comments, currentUserId, isAdmin }: Props) {
  const topLevelAction = createComment.bind(null, postId, null);
  const [state, formAction, isPending] = useActionState<CommentState, FormData>(topLevelAction, {});
  const formRef = useRef<HTMLFormElement>(null);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  const prevError = state.error;
  if (!prevError && !isPending) formRef.current?.reset();

  const totalCount = comments.reduce((acc, c) => acc + 1 + c.replies.length, 0);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-semibold text-sm">
        댓글 <span className="text-muted-foreground">{totalCount}</span>
      </h2>

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
              activeReplyId={activeReplyId}
              onReplyClick={(id) => setActiveReplyId(activeReplyId === id ? null : id)}
              onReplySuccess={() => setActiveReplyId(null)}
            />
          ))}
        </ul>
      )}

      {currentUserId ? (
        <form ref={formRef} action={formAction} className="flex flex-col gap-2">
          {state.error && <p className="text-xs text-red-500">{state.error}</p>}
          <textarea
            name="content"
            rows={3}
            maxLength={500}
            placeholder="댓글을 입력하세요 (최대 500자)"
            className="input resize-none"
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
  activeReplyId,
  onReplyClick,
  onReplySuccess,
}: {
  comment: Comment;
  postId: number;
  currentUserId?: string;
  isAdmin?: boolean;
  activeReplyId: string | null;
  onReplyClick: (id: string) => void;
  onReplySuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const canDelete = currentUserId === comment.author.id || isAdmin;
  const isReplyOpen = activeReplyId === comment.id;

  function handleDelete() {
    if (!confirm("댓글을 삭제할까요?")) return;
    startTransition(async () => {
      await deleteComment(comment.id, postId);
    });
  }

  return (
    <li className="py-3 flex flex-col gap-2">
      {/* 댓글 본문 */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <AuthorLink author={comment.author} />
            <span>{formatDate(comment.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            {currentUserId && (
              <button
                onClick={() => onReplyClick(comment.id)}
                className="text-xs text-muted-foreground hover:text-primary-base transition-colors"
              >
                {isReplyOpen ? "취소" : "답글"}
              </button>
            )}
            {currentUserId && currentUserId !== comment.author.id && (
              <CommentReportModal commentId={comment.id} type="댓글" />
            )}
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
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
      </div>

      {/* 답글 목록 */}
      {comment.replies.length > 0 && (
        <ul className="flex flex-col border-l-2 border-border-base ml-2 pl-3 gap-2">
          {comment.replies.map((reply) => (
            <ReplyItem
              key={reply.id}
              reply={reply}
              postId={postId}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
            />
          ))}
        </ul>
      )}

      {/* 답글 입력 폼 */}
      {isReplyOpen && (
        <div className="ml-2 pl-3 border-l-2 border-primary-base/30">
          <ReplyForm postId={postId} parentId={comment.id} onSuccess={onReplySuccess} />
        </div>
      )}
    </li>
  );
}

function ReplyItem({
  reply,
  postId,
  currentUserId,
  isAdmin,
}: {
  reply: Reply;
  postId: number;
  currentUserId?: string;
  isAdmin?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const canDelete = currentUserId === reply.author.id || isAdmin;

  function handleDelete() {
    if (!confirm("답글을 삭제할까요?")) return;
    startTransition(async () => {
      await deleteComment(reply.id, postId);
    });
  }

  return (
    <li className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <AuthorLink author={reply.author} />
          <span>{formatDate(reply.createdAt)}</span>
        </div>
        <div className="flex items-center gap-2">
          {currentUserId && currentUserId !== reply.author.id && (
            <CommentReportModal commentId={reply.id} type="답글" />
          )}
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
      </div>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{reply.content}</p>
    </li>
  );
}

function ReplyForm({
  postId,
  parentId,
  onSuccess,
}: {
  postId: number;
  parentId: string;
  onSuccess: () => void;
}) {
  const action = createComment.bind(null, postId, parentId);
  const [state, formAction, isPending] = useActionState<CommentState, FormData>(action, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.error && !isPending && formRef.current) {
      const textarea = formRef.current.querySelector("textarea");
      if (textarea && !textarea.value) return;
      formRef.current.reset();
      onSuccess();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, isPending]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      {state.error && <p className="text-xs text-red-500">{state.error}</p>}
      <textarea
        name="content"
        rows={2}
        maxLength={500}
        placeholder="답글을 입력하세요 (최대 500자)"
        className="input resize-none"
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="bg-primary-base text-primary-foreground px-3 py-1 rounded-lg text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isPending ? "등록 중..." : "답글 등록"}
        </button>
      </div>
    </form>
  );
}

function AuthorLink({ author }: { author: Author }) {
  if (!author.nickname) return <span className="font-medium text-foreground">탈퇴한 유저</span>;
  return (
    <Link
      href={`/users/${author.publicId}`}
      className="font-medium text-foreground hover:text-primary-base transition-colors"
    >
      {author.nickname}
    </Link>
  );
}
