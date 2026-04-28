"use server";

import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const RETENTION_YEARS = 1;
const COOLDOWN_DAYS = 30;

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

  // 이메일·이름·이미지는 즉시 삭제. 닉네임은 사기 방지를 위해 retainUntil까지 보존.
  const anonymize = {
    email: null,
    name: null,
    image: null,
  };

  if (reportCount > 0) {
    // 신고 이력 있음 → 닉네임 + hashedNaverId 1년 보관 후 삭제
    const retainUntil = new Date(now);
    retainUntil.setFullYear(retainUntil.getFullYear() + RETENTION_YEARS);
    await prisma.user.update({
      where: { id: userId },
      data: { ...anonymize, deletedAt: now, retainUntil },
    });
  } else {
    // 신고 이력 없음 → 닉네임 + hashedNaverId 30일 보관 후 삭제
    const cooldownUntil = new Date(now);
    cooldownUntil.setDate(cooldownUntil.getDate() + COOLDOWN_DAYS);
    await prisma.user.update({
      where: { id: userId },
      data: { ...anonymize, deletedAt: now, retainUntil: cooldownUntil },
    });
  }

  await signOut({ redirectTo: "/" });
}
