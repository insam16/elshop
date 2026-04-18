"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type CommentState = {
  error?: string;
};

export async function createComment(
  postId: string,
  _prev: CommentState,
  formData: FormData
): Promise<CommentState> {
  const session = await auth();
  if (!session) redirect("/login");

  const content = (formData.get("content") as string).trim();

  if (!content) return { error: "댓글 내용을 입력해주세요." };
  if (content.length > 500) return { error: "댓글은 500자 이내로 입력해주세요." };

  const post = await prisma.post.findUnique({
    where: { id: postId, deletedAt: null },
    select: { id: true },
  });
  if (!post) return { error: "게시글을 찾을 수 없습니다." };

  await prisma.comment.create({
    data: {
      content,
      authorId: session.user.id,
      postId,
    },
  });

  revalidatePath(`/posts/${postId}`);
  return {};
}

export async function deleteComment(
  commentId: string,
  postId: string
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
