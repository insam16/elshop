"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { notifyNewComment } from "@/lib/notifications";
import { checkAndExpireBan } from "@/lib/ban";

export type CommentState = {
  error?: string;
};

export async function createComment(
  postId: number,
  parentId: string | null,
  _prev: CommentState,
  formData: FormData
): Promise<CommentState> {
  const session = await auth();
  if (!session) redirect("/login");

  if (session.user.role === "TEMP") {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentCount = await prisma.comment.count({
      where: { authorId: session.user.id, createdAt: { gt: oneDayAgo }, deletedAt: null },
    });
    if (recentCount >= 3) return { error: "인증대기 계정은 하루에 댓글을 3개까지만 작성할 수 있습니다." };
  }

  const banMessage = await checkAndExpireBan(session.user.id);
  if (banMessage) return { error: banMessage };

  const content = (formData.get("content") as string).trim();

  if (!content) return { error: "댓글 내용을 입력해주세요." };
  if (content.length > 500) return { error: "댓글은 500자 이내로 입력해주세요." };

  const post = await prisma.post.findUnique({
    where: { id: postId, deletedAt: null },
    select: { id: true },
  });
  if (!post) return { error: "게시글을 찾을 수 없습니다." };

  if (parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: parentId, postId, deletedAt: null },
      select: { parentId: true },
    });
    if (!parent) return { error: "원본 댓글을 찾을 수 없습니다." };
    if (parent.parentId) return { error: "답글에는 답글을 달 수 없습니다." };
  }

  const comment = await prisma.comment.create({
    data: { content, authorId: session.user.id, postId, parentId },
  });

  after(async () => {
    await notifyNewComment({
      commentId: comment.id,
      postId,
      authorId: session.user.id,
      parentId,
    });
  });

  revalidatePath(`/posts/${postId}`);
  return {};
}

// ─── 댓글 연락하기 (판매자) ────────────────────

export type ContactCommentResult = { contact: string } | { error: string };

export async function contactComment(commentId: string): Promise<ContactCommentResult> {
  const session = await auth();
  if (!session) redirect("/login");

  const comment = await prisma.comment.findUnique({
    where: { id: commentId, deletedAt: null },
    select: { contact: true, postId: true, parentId: true },
  });

  if (!comment) return { error: "댓글을 찾을 수 없습니다." };
  if (comment.contact === null) return { error: "연락처가 없습니다." };
  if (comment.parentId !== null) return { error: "답글에는 연락처를 남길 수 없습니다." };

  const post = await prisma.post.findUnique({
    where: { id: comment.postId, deletedAt: null },
    select: { authorId: true, status: true },
  });

  if (!post) return { error: "게시글을 찾을 수 없습니다." };
  if (post.authorId !== session.user.id) return { error: "게시글 작성자만 사용할 수 있습니다." };
  if (post.status !== "ACTIVE" && post.status !== "RESERVED") return { error: "거래 가능 상태에서만 사용할 수 있습니다." };

  const capturedContact = comment.contact;

  try {
    await prisma.$transaction([
      prisma.comment.create({
        data: { content: "연락드렸어요", authorId: session.user.id, postId: comment.postId, parentId: commentId },
      }),
      prisma.post.update({
        where: { id: comment.postId },
        data: { status: "RESERVED", contact: null },
      }),
      prisma.comment.update({
        where: { id: commentId },
        data: { contact: null },
      }),
    ]);
  } catch (e: unknown) {
    return { error: "처리 중 오류가 발생했습니다." };
  }

  revalidatePath(`/posts/${comment.postId}`);
  return { contact: capturedContact };
}

export async function deleteComment(
  commentId: string,
  postId: number
): Promise<CommentState> {
  const session = await auth();
  if (!session) redirect("/login");

  const comment = await prisma.comment.findUnique({
    where: { id: commentId, deletedAt: null },
    select: { authorId: true },
  });

  if (!comment) return { error: "댓글을 찾을 수 없습니다." };
  if (comment.authorId !== session.user.id && session.user.role !== "ADMIN") {
    return { error: "삭제 권한이 없습니다." };
  }

  await prisma.comment.update({
    where: { id: commentId },
    data: { deletedAt: new Date() },
  });

  revalidatePath(`/posts/${postId}`);
  return {};
}
