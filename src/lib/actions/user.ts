"use server";

import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const RETENTION_YEARS = 1;

export async function deleteAccount() {
  const session = await auth();
  if (!session) redirect("/login");

  const userId = session.user.id;

  // 신고 이력 확인 (내 게시글이 신고된 적 있는지)
  const reportCount = await prisma.report.count({
    where: { post: { authorId: userId } },
  });

  const now = new Date();

  // OAuth 연결 해제 → 같은 네이버 계정으로 재가입 시 새 계정으로 처리됨
  await prisma.account.deleteMany({ where: { userId } });

  if (reportCount > 0) {
    // 신고 이력 있음 → 전자상거래법 근거로 1년 보존 후 익명화
    const retainUntil = new Date(now);
    retainUntil.setFullYear(retainUntil.getFullYear() + RETENTION_YEARS);

    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: now, retainUntil },
    });
  } else {
    // 신고 이력 없음 → 즉시 익명화
    await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: now,
        email: null,
        nickname: null,
        name: null,
        image: null,
      },
    });
  }

  await signOut({ redirectTo: "/" });
}
