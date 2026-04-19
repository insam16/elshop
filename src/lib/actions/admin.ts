"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdminActionType, ReportStatus } from "@prisma/client";
import { redirect } from "next/navigation";

export type AdminActionState = {
  error?: string;
};

const LOGGABLE_STATUS: Partial<Record<ReportStatus, AdminActionType>> = {
  RESOLVED: AdminActionType.RESOLVE_REPORT,
  REJECTED: AdminActionType.REJECT_REPORT,
};

export async function updateReportStatus(
  reportId: string,
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");

  const status = formData.get("status") as string;
  const rawNote = (formData.get("note") as string).trim();
  const note = rawNote || null;

  if (rawNote.length > 500) return { error: "처리 메모는 500자 이내로 입력해주세요." };

  if (!Object.values(ReportStatus).includes(status as ReportStatus)) {
    return { error: "올바른 상태값을 선택해주세요." };
  }

  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) return { error: "신고를 찾을 수 없습니다." };

  const actionType = LOGGABLE_STATUS[status as ReportStatus];

  await prisma.$transaction([
    prisma.report.update({
      where: { id: reportId },
      data: { status: status as ReportStatus },
    }),
    ...(actionType
      ? [prisma.adminAction.create({
          data: { adminId: session.user.id, actionType, reportId, note },
        })]
      : []),
  ]);

  redirect(`/admin/reports/${reportId}`);
}

export type AnonymizeResult = { count: number; error?: string };

export async function anonymizeExpiredUsers(): Promise<AnonymizeResult> {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");

  const expired = await prisma.user.findMany({
    where: {
      deletedAt: { not: null },
      retainUntil: { lt: new Date() },
      nickname: { not: null }, // 아직 익명화 안 된 유저
    },
    select: { id: true },
  });

  if (expired.length === 0) return { count: 0 };

  await prisma.user.updateMany({
    where: { id: { in: expired.map((u) => u.id) } },
    data: { email: null, nickname: null, name: null, image: null, retainUntil: null },
  });

  return { count: expired.length };
}

export async function hidePost(
  reportId: string,
  postId: string,
  note: string | null
): Promise<AdminActionState> {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return { error: "게시글을 찾을 수 없습니다." };
  if (post.deletedAt) return { error: "이미 숨김 처리된 게시글입니다." };

  await prisma.$transaction([
    prisma.post.update({ where: { id: postId }, data: { deletedAt: new Date() } }),
    prisma.adminAction.create({
      data: { adminId: session.user.id, actionType: AdminActionType.DELETE_POST, postId, reportId, note },
    }),
  ]);

  redirect(`/admin/reports/${reportId}`);
}

export async function restorePost(
  reportId: string,
  postId: string,
  note: string | null
): Promise<AdminActionState> {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return { error: "게시글을 찾을 수 없습니다." };
  if (!post.deletedAt) return { error: "숨김 처리되지 않은 게시글입니다." };

  await prisma.$transaction([
    prisma.post.update({ where: { id: postId }, data: { deletedAt: null } }),
    prisma.adminAction.create({
      data: { adminId: session.user.id, actionType: AdminActionType.RESTORE_POST, postId, reportId, note },
    }),
  ]);

  redirect(`/admin/reports/${reportId}`);
}
