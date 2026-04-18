"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ReportReason } from "@prisma/client";
import { redirect } from "next/navigation";

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

  const postId = typeof postIdRaw === "string" ? postIdRaw : "";
  const reason = typeof reasonRaw === "string" ? reasonRaw : "";
  const detail = typeof detailRaw === "string" ? detailRaw.trim().slice(0, 500) : null;

  if (!postId) return { error: "게시글 ID가 누락되었습니다." };
  if (!reason) return { error: "신고 사유가 누락되었습니다." };

  // reason 유효성 검사
  if (!Object.values(ReportReason).includes(reason as ReportReason)) {
    return { error: "올바른 신고 사유를 선택해주세요." };
  }

  // 게시글 존재 여부 + 작성자 확인
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
