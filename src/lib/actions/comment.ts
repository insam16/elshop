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
    if (recentCount >= 2) return { error: "미인증 계정은 하루에 댓글을 2개까지만 작성할 수 있습니다." };
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
