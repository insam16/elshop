import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const now = new Date();

  const [activePosts, reservedPosts] = await Promise.all([
    prisma.post.findMany({
      where: { status: "ACTIVE", expiresAt: { lt: now }, deletedAt: null },
      select: { id: true },
    }),
    prisma.post.findMany({
      where: { status: "RESERVED", expiresAt: { lt: now }, deletedAt: null },
      select: { id: true },
    }),
  ]);

  const activeIds = activePosts.map((p) => p.id);
  const reservedIds = reservedPosts.map((p) => p.id);
  const allExpiredIds = [...activeIds, ...reservedIds];

  await prisma.$transaction([
    ...(activeIds.length > 0
      ? [prisma.post.updateMany({ where: { id: { in: activeIds } }, data: { status: "EXPIRED", contact: null } })]
      : []),
    ...(reservedIds.length > 0
      ? [prisma.post.updateMany({ where: { id: { in: reservedIds } }, data: { status: "COMPLETED", contact: null } })]
      : []),
    ...(allExpiredIds.length > 0
      ? [prisma.comment.updateMany({ where: { postId: { in: allExpiredIds } }, data: { contact: null } })]
      : []),
  ]);

  return NextResponse.json({
    expired: activeIds.length,
    completed: reservedIds.length,
  });
}
