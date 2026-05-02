"use server";

import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const RETENTION_YEARS = 1;
const FRAUD_RETENTION_YEARS = 3;

export async function deleteAccount() {
  const session = await auth();
  if (!session) redirect("/login");

  const userId = session.user.id;

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { publicId: true, nickname: true, hashedNaverId: true },
  });

  const reportCount = await prisma.report.count({
    where: { post: { authorId: userId }, status: "RESOLVED" },
  });

  const now = new Date();
  const retainUntil = new Date(now);
  retainUntil.setFullYear(
    retainUntil.getFullYear() + (reportCount > 0 ? FRAUD_RETENTION_YEARS : RETENTION_YEARS)
  );

  await prisma.$transaction([
    // 실제 닉네임 + hashedNaverId 보안 테이블에 보관
    prisma.retainedUser.upsert({
      where: { hashedNaverId: user.hashedNaverId! },
      create: {
        publicId: user.publicId,
        nickname: user.nickname!,
        hashedNaverId: user.hashedNaverId!,
        retainUntil,
      },
      update: {
        publicId: user.publicId,
        nickname: user.nickname!,
        retainUntil,
      },
    }),
    // 닉네임 익명화 + soft delete
    prisma.user.update({
      where: { id: userId },
      data: {
        nickname: `탈퇴#${user.publicId}`,
        role: "TEMP",
        deletedAt: now,
        retainUntil,
      },
    }),
    // OAuth 연결 해제
    prisma.account.deleteMany({ where: { userId } }),
    // 거래 가능 게시글 → 만료
    prisma.post.updateMany({
      where: { authorId: userId, status: "ACTIVE", deletedAt: null },
      data: { status: "EXPIRED", contact: null },
    }),
    // 예약 게시글 → 거래완료
    prisma.post.updateMany({
      where: { authorId: userId, status: "RESERVED", deletedAt: null },
      data: { status: "COMPLETED", contact: null },
    }),
  ]);

  await signOut({ redirectTo: "/" });
}
