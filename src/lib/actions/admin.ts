"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdminActionType, NotificationType, ReportStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type AdminActionState = {
  error?: string;
  conflict?: {
    nickname: string;
    conflictUserId: string;
    conflictNickname: string;
  };
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

export async function updateCommentReportStatus(
  reportId: string,
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");

  const status = formData.get("status") as string;
  const rawNote = (formData.get("note") as string ?? "").trim();

  if (rawNote.length > 500) return { error: "처리 메모는 500자 이내로 입력해주세요." };

  if (!Object.values(ReportStatus).includes(status as ReportStatus)) {
    return { error: "올바른 상태값을 선택해주세요." };
  }

  const report = await prisma.commentReport.findUnique({ where: { id: reportId } });
  if (!report) return { error: "신고를 찾을 수 없습니다." };

  const note = rawNote || null;
  const actionType =
    status === ReportStatus.RESOLVED ? AdminActionType.RESOLVE_COMMENT_REPORT :
    status === ReportStatus.REJECTED ? AdminActionType.REJECT_COMMENT_REPORT :
    null;

  await prisma.$transaction([
    prisma.commentReport.update({
      where: { id: reportId },
      data: { status: status as ReportStatus },
    }),
    ...(actionType
      ? [prisma.adminAction.create({
          data: { adminId: session.user.id, actionType, commentReportId: reportId, note },
        })]
      : []),
  ]);

  redirect(`/admin/comment-reports/${reportId}`);
}

export async function deleteCommentByAdmin(
  commentReportId: string,
  commentId: string
): Promise<AdminActionState> {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { deletedAt: true, postId: true },
  });
  if (!comment) return { error: "댓글을 찾을 수 없습니다." };
  if (comment.deletedAt) return { error: "이미 삭제된 댓글입니다." };

  await prisma.$transaction([
    prisma.comment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    }),
    prisma.adminAction.create({
      data: {
        adminId: session.user.id,
        actionType: AdminActionType.DELETE_COMMENT,
        commentId,
        commentReportId,
      },
    }),
  ]);

  revalidatePath(`/posts/${comment.postId}`);
  redirect(`/admin/comment-reports/${commentReportId}`);
}

export async function approveUser(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");

  const userId = (formData.get("userId") as string) ?? "";
  const characterName = ((formData.get("characterName") as string) ?? "").trim();
  const returnPath = (formData.get("returnPath") as string) || "/admin/users";

  if (!userId) return { error: "유저 ID가 누락되었습니다." };
  if (!characterName) return { error: "캐릭터명을 입력해주세요." };
  if (characterName.length > 20) return { error: "캐릭터명은 20자 이내로 입력해주세요." };

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user) return { error: "유저를 찾을 수 없습니다." };
  if (user.role !== "TEMP") return { error: "인증 대기 중인 유저가 아닙니다." };

  const force = formData.get("force") === "true";
  const existing = await prisma.user.findUnique({
    where: { nickname: characterName },
    select: { id: true, nickname: true },
  });

  if (existing && !force) {
    return {
      conflict: {
        nickname: characterName,
        conflictUserId: existing.id,
        conflictNickname: existing.nickname!,
      },
    };
  }

  if (existing && force) {
    // 기존 닉네임 보유자를 임시 닉네임으로 변경 후 알림
    const counter = await prisma.tempNicknameSeq.upsert({
      where: { id: 2 },
      update: { seq: { increment: 1 } },
      create: { id: 2, seq: 1 },
    });
    const tempNickname = `닉변#${String(counter.seq).padStart(4, "0")}`;
    await prisma.$transaction([
      prisma.user.update({
        where: { id: existing.id },
        data: { nickname: tempNickname, role: "TEMP" },
      }),
      prisma.notification.create({
        data: {
          userId: existing.id,
          actorUserId: session.user.id,
          type: NotificationType.NICKNAME_CHANGED,
          title: "닉네임이 변경되었습니다",
          body: `게임 닉네임 소유자 변경으로 인해 닉네임이 임시 닉네임으로 변경되었습니다. 새 닉네임으로 재인증해주세요.`,
          link: "/account",
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { nickname: characterName, role: "USER" },
      }),
      prisma.adminAction.create({
        data: {
          adminId: session.user.id,
          actionType: AdminActionType.APPROVE_USER,
          targetUserId: userId,
          note: `캐릭터명: ${characterName} (기존 보유자 닉네임 강제 변경)`,
        },
      }),
    ]);
    redirect(returnPath);
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { nickname: characterName, role: "USER" },
    }),
    prisma.adminAction.create({
      data: {
        adminId: session.user.id,
        actionType: AdminActionType.APPROVE_USER,
        targetUserId: userId,
        note: `캐릭터명: ${characterName}`,
      },
    }),
  ]);

  redirect(returnPath);
}

export async function rejectUser(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");

  const userId = (formData.get("userId") as string) ?? "";
  const note = ((formData.get("note") as string) ?? "").trim() || null;
  const returnPath = (formData.get("returnPath") as string) || "/admin/users";

  if (!userId) return { error: "유저 ID가 누락되었습니다." };

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user) return { error: "유저를 찾을 수 없습니다." };
  if (user.role !== "TEMP") return { error: "인증 대기 중인 유저가 아닙니다." };

  await prisma.adminAction.create({
    data: {
      adminId: session.user.id,
      actionType: AdminActionType.REJECT_USER,
      targetUserId: userId,
      note,
    },
  });

  redirect(returnPath);
}

export async function banUser(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");

  const userId = (formData.get("userId") as string) ?? "";
  const type = (formData.get("type") as string) ?? "";
  const dateStr = (formData.get("bannedUntil") as string) ?? "";
  const note = ((formData.get("note") as string) ?? "").trim() || null;
  const returnPath = (formData.get("returnPath") as string) || "/admin/users";

  if (!userId) return { error: "유저 ID가 누락되었습니다." };

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user) return { error: "유저를 찾을 수 없습니다." };
  if (user.role === "ADMIN") return { error: "관리자 계정은 제재할 수 없습니다." };

  let bannedUntil: Date;
  if (type === "permanent") {
    bannedUntil = new Date("9999-12-31");
  } else {
    if (!dateStr) return { error: "제한 기간을 선택해주세요." };
    bannedUntil = new Date(dateStr);
    if (isNaN(bannedUntil.getTime()) || bannedUntil <= new Date()) {
      return { error: "오늘 이후 날짜를 선택해주세요." };
    }
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { isBanned: true, bannedUntil },
    }),
    prisma.adminAction.create({
      data: {
        adminId: session.user.id,
        actionType: AdminActionType.BAN_USER,
        targetUserId: userId,
        note,
      },
    }),
  ]);

  redirect(returnPath);
}

export async function unbanUser(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");

  const userId = (formData.get("userId") as string) ?? "";
  const note = ((formData.get("note") as string) ?? "").trim() || null;
  const returnPath = (formData.get("returnPath") as string) || "/admin/users";

  if (!userId) return { error: "유저 ID가 누락되었습니다." };

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) return { error: "유저를 찾을 수 없습니다." };

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { isBanned: false, bannedUntil: null },
    }),
    prisma.adminAction.create({
      data: {
        adminId: session.user.id,
        actionType: AdminActionType.UNBAN_USER,
        targetUserId: userId,
        note,
      },
    }),
  ]);

  redirect(returnPath);
}

export async function changeUserRetention(
  userId: string,
  years: 1 | 3
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { deletedAt: true, publicId: true },
  });
  if (!user?.deletedAt) return { error: "탈퇴한 유저가 아닙니다." };

  const newRetainUntil = new Date(user.deletedAt);
  newRetainUntil.setFullYear(newRetainUntil.getFullYear() + years);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { retainUntil: newRetainUntil },
    }),
    prisma.retainedUser.updateMany({
      where: { publicId: user.publicId },
      data: { retainUntil: newRetainUntil },
    }),
  ]);

  revalidatePath("/admin/users");
  return {};
}

export async function purgeDeletedUser(userId: string): Promise<void> {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { deletedAt: true, publicId: true } });
  if (!user?.deletedAt) return;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { email: null, nickname: null, name: null, image: null, hashedNaverId: null, retainUntil: null },
    }),
    prisma.retainedUser.deleteMany({ where: { publicId: user.publicId } }),
  ]);

  revalidatePath("/admin/users");
}

export async function anonymizeExpiredUsers(): Promise<AnonymizeResult> {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");

  const now = new Date();

  const expired = await prisma.retainedUser.findMany({
    where: { retainUntil: { lt: now } },
    select: { id: true },
  });

  if (expired.length === 0) return { count: 0 };

  const ids = expired.map((r) => r.id);
  await prisma.retainedUser.deleteMany({ where: { id: { in: ids } } });

  revalidatePath("/admin/users");
  return { count: ids.length };
}

export async function hidePost(
  reportId: string,
  postId: number,
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
  postId: number,
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
