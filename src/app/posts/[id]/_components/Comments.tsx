"use client";

import Link from "next/link";
import { useActionState, useTransition, useRef, useState, useEffect } from "react";
import { createComment, deleteComment, contactComment, type CommentState } from "@/lib/actions/comment";
import { completePost } from "@/lib/actions/post";
import { formatDate } from "@/lib/utils/date";
import CommentReportModal from "@/app/posts/_components/CommentReportModal";
import CommentDeleteRequestModal from "@/app/posts/_components/CommentDeleteRequestModal";

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
  hasContact?: boolean;
};

type Props = {
  postId: number;
  comments: Comment[];
  currentUserId?: string;
  isAdmin?: boolean;
  postStatus?: string;
  isPostAuthor?: boolean;
};

export default function Comments({ postId, comments, currentUserId, isAdmin, postStatus, isPostAuthor }: Props) {
  const topLevelAction = createComment.bind(null, postId, null);
  const [state, formAction, isPending] = useActionState<CommentState, FormData>(topLevelAction, {});
  const formRef = useRef<HTMLFormElement>(null);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  const prevError = state.error;
  if (!prevError && !isPending) formRef.current?.reset();

  const totalCount = comments.reduce((acc, c) => acc + 1 + c.replies.length, 0);

  const canComment = !postStatus || postStatus === "ACTIVE" || postStatus === "RESERVED";

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
              postStatus={postStatus}
              isPostAuthor={isPostAuthor}
              activeReplyId={activeReplyId}
              onReplyClick={(id) => setActiveReplyId(activeReplyId === id ? null : id)}
              onReplySuccess={() => setActiveReplyId(null)}
            />
          ))}
        </ul>
      )}

      {currentUserId && canComment ? (
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
      ) : !currentUserId ? (
        <p className="text-sm text-muted-foreground text-center py-2">
          댓글을 작성하려면 로그인이 필요합니다.
        </p>
      ) : null}
    </section>
  );
}

function CommentItem({
  comment,
  postId,
  currentUserId,
  isAdmin,
  postStatus,
  isPostAuthor,
  activeReplyId,
  onReplyClick,
  onReplySuccess,
}: {
  comment: Comment;
  postId: number;
  currentUserId?: string;
  isAdmin?: boolean;
  postStatus?: string;
  isPostAuthor?: boolean;
  activeReplyId: string | null;
  onReplyClick: (id: string) => void;
  onReplySuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [sellerContactPending, setSellerContactPending] = useState(false);
  const [revealedContact, setRevealedContact] = useState<string | null>(null);
  const [contactError, setContactError] = useState<string | null>(null);
  const isAuthor = currentUserId === comment.author.id;
  const isReplyOpen = activeReplyId === comment.id;

  const showSellerContactButton =
    isPostAuthor &&
    comment.hasContact &&
    (postStatus === "ACTIVE" || postStatus === "RESERVED") &&
    currentUserId !== comment.author.id;

  function handleDelete() {
    if (!confirm("댓글을 삭제할까요?")) return;
    startTransition(async () => {
      await deleteComment(comment.id, postId);
    });
  }

  async function handleSellerContact() {
    if (sellerContactPending) return;
    setSellerContactPending(true);
    try {
      const result = await contactComment(comment.id);
      if ("contact" in result) {
        setRevealedContact(result.contact);
      } else {
        setContactError(result.error);
      }
    } finally {
      setSellerContactPending(false);
    }
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
            {currentUserId && !isAuthor && (
              <CommentReportModal commentId={comment.id} type="댓글" />
            )}
            {isAuthor && !isAdmin && (
              <CommentDeleteRequestModal commentId={comment.id} type="댓글" />
            )}
            {isAdmin && (
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
        {showSellerContactButton && (
          <button
            onClick={handleSellerContact}
            disabled={sellerContactPending}
            className="w-full bg-primary-base text-primary-foreground px-4 py-4 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {sellerContactPending ? "처리 중..." : "지금 연락하기"}
          </button>
        )}
        {comment.content === "연락드렸어요" && isPostAuthor && postStatus !== "COMPLETED" && (
          <ContactedMessage postId={postId} showComplete />
        )}
      </div>

      {/* 판매자 연락처 팝업 */}
      {revealedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-card rounded-xl border border-border-base shadow-xl w-full max-w-sm p-6 text-foreground">
            <h2 className="text-base font-bold mb-1">구매자 연락처</h2>
            <p className="text-xs text-amber-600 mb-4">
              이 연락처는 다시 확인할 수 없습니다. 저장해두세요.
            </p>
            <div className="bg-muted rounded-lg px-4 py-3 text-sm font-medium break-all mb-4">
              {revealedContact}
            </div>
            <button
              onClick={() => setRevealedContact(null)}
              className="w-full bg-primary-base text-primary-foreground py-2 rounded-lg text-sm hover:opacity-90 transition-opacity"
            >
              확인
            </button>
          </div>
        </div>
      )}
      {contactError && (
        <p className="text-xs text-red-500">{contactError}</p>
      )}

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
              parentCommentAuthorId={comment.author.id}
              isPostAuthor={isPostAuthor}
              postStatus={postStatus}
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
  parentCommentAuthorId,
  isPostAuthor,
  postStatus,
}: {
  reply: Reply;
  postId: number;
  currentUserId?: string;
  isAdmin?: boolean;
  parentCommentAuthorId?: string;
  isPostAuthor?: boolean;
  postStatus?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const isAuthor = currentUserId === reply.author.id;

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
          {currentUserId && !isAuthor && (
            <CommentReportModal commentId={reply.id} type="답글" />
          )}
          {isAuthor && !isAdmin && (
            <CommentDeleteRequestModal commentId={reply.id} type="답글" />
          )}
          {isAdmin && (
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
      {reply.content === "연락드렸어요" && (isPostAuthor || currentUserId === parentCommentAuthorId) && postStatus !== "COMPLETED" && (
        <ContactedMessage postId={postId} showComplete={!!isPostAuthor} />
      )}
    </li>
  );
}

function ContactedMessage({ postId, showComplete }: { postId: number; showComplete: boolean }) {
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
    <div className="bg-primary-base/10 border border-primary-base/30 rounded-lg px-3 py-2 flex flex-col gap-1.5 text-xs">
      <p className="text-sm font-semibold text-primary-base">카카오톡 오픈채팅을 확인해주세요!</p>
      {showComplete && (
        <p className="text-muted-foreground">
          혹시 거래를 완료하셨나요? 거래완료를 눌러주세요.{" "}
          <button
            onClick={handleComplete}
            disabled={isPending}
            className="text-primary-base font-semibold hover:underline disabled:opacity-50"
          >
            {isPending ? "처리 중..." : "[거래완료]"}
          </button>
        </p>
      )}
    </div>
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
