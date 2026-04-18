"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdminActionType, ReportStatus } from "@prisma/client";
import { redirect } from "next/navigation";

export type AdminActionState = {
  error?: string;
};

const REPORT_STATUS_TO_ACTION: Record<ReportStatus, AdminActionType> = {
  PENDING: AdminActionType.RESOLVE_REPORT,
  REVIEWING: AdminActionType.RESOLVE_REPORT,
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

  // 상태 변경 + 관리자 로그 동시 저장
  await prisma.$transaction([
    prisma.report.update({
      where: { id: reportId },
      data: { status: status as ReportStatus },
    }),
    prisma.adminAction.create({
      data: {
        adminId: session.user.id,
        actionType: REPORT_STATUS_TO_ACTION[status as ReportStatus],
        reportId,
        note,
      },
    }),
  ]);

  redirect(`/admin/reports/${reportId}`);
}
