"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ReportReason } from "@prisma/client";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type ReportState = {
  success?: boolean;
  error?: string;
};

export async function createReport(
  _prev: ReportState,
  formData: FormData
): Promise<ReportState> {
  const session = await auth();
  if (!session) redirect("/login");

  const postIdRaw = formData.get("postId");
  const reasonRaw = formData.get("reason");
  const detailRaw = formData.get("detail");

  const postId = parseInt(typeof postIdRaw === "string" ? postIdRaw : "", 10);
  const reason = typeof reasonRaw === "string" ? reasonRaw : "";
  const detail = typeof detailRaw === "string" ? detailRaw.trim().slice(0, 500) : null;

  if (!postId) return { error: "게시글 ID가 누락되었습니다." };
  if (!reason) return { error: "신고 사유가 누락되었습니다." };

  if (!Object.values(ReportReason).includes(reason as ReportReason)) {
    return { error: "올바른 신고 사유를 선택해주세요." };
  }

  const post = await prisma.post.findUnique({
    where: { id: postId, deletedAt: null },
    select: { authorId: true },
  });

  if (!post) return { error: "게시글을 찾을 수 없습니다." };
  if (post.authorId === session.user.id) return { error: "자신의 게시글은 신고할 수 없습니다." };

  try {
    await prisma.report.create({
      data: {
        reporterId: session.user.id,
        postId,
        reason: reason as ReportReason,
        detail,
      },
    });
    return { success: true };
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code;
    if (code === "P2002") return { error: "이미 신고한 게시글입니다." };
    return { error: "신고 처리 중 오류가 발생했습니다." };
  }
}

export type CommentReportState = {
  success?: boolean;
  error?: string;
};

export async function createCommentReport(
  _prev: CommentReportState,
  formData: FormData
): Promise<CommentReportState> {
  const session = await auth();
  if (!session) redirect("/login");

  const commentId = typeof formData.get("commentId") === "string" ? (formData.get("commentId") as string) : "";
  const reasonRaw = formData.get("reason");
  const detailRaw = formData.get("detail");

  const reason = typeof reasonRaw === "string" ? reasonRaw : "";
  const detail = typeof detailRaw === "string" ? detailRaw.trim().slice(0, 500) : null;

  if (!commentId) return { error: "댓글 ID가 누락되었습니다." };
  if (!reason) return { error: "신고 사유가 누락되었습니다." };

  if (!Object.values(ReportReason).includes(reason as ReportReason)) {
    return { error: "올바른 신고 사유를 선택해주세요." };
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId, deletedAt: null },
    select: { authorId: true, postId: true },
  });

  if (!comment) return { error: "댓글을 찾을 수 없습니다." };
  if (comment.authorId === session.user.id) return { error: "자신의 댓글은 신고할 수 없습니다." };

  try {
    await prisma.commentReport.create({
      data: {
        reporterId: session.user.id,
        commentId,
        reason: reason as ReportReason,
        detail: detail || null,
      },
    });
    revalidatePath(`/posts/${comment.postId}`);
    return { success: true };
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code;
    if (code === "P2002") return { error: "이미 신고한 댓글입니다." };
    return { error: "신고 처리 중 오류가 발생했습니다." };
  }
}

export async function requestPostDeletion(
  _prev: ReportState,
  formData: FormData
): Promise<ReportState> {
  const session = await auth();
  if (!session) redirect("/login");

  const postId = parseInt(formData.get("postId") as string, 10);
  const reason = (formData.get("reason") as string | null)?.trim().slice(0, 500) ?? "";

  if (!postId) return { error: "게시글 ID가 누락되었습니다." };

  const post = await prisma.post.findUnique({
    where: { id: postId, deletedAt: null },
    select: { authorId: true },
  });

  if (!post) return { error: "게시글을 찾을 수 없습니다." };
  if (post.authorId !== session.user.id) return { error: "본인 게시글만 삭제 요청할 수 있습니다." };

  try {
    await prisma.report.create({
      data: {
        reporterId: session.user.id,
        postId,
        reason: ReportReason.OTHER,
        detail: `[작성자 삭제 요청] ${reason}`.trim(),
      },
    });
    return { success: true };
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code;
    if (code === "P2002") return { error: "이미 삭제 요청한 게시글입니다." };
    return { error: "요청 처리 중 오류가 발생했습니다." };
  }
}
