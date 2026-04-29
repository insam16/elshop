"use server";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashNaverId } from "@/lib/hashed-adapter";

const RETENTION_YEARS = 1;
const FRAUD_RETENTION_YEARS = 3;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const params = new URLSearchParams(body);
  const accessToken = params.get("access_token");

  if (!accessToken) {
    return NextResponse.json({ error: "missing access_token" }, { status: 400 });
  }

  const naverRes = await fetch("https://openapi.naver.com/v1/nid/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!naverRes.ok) {
    return NextResponse.json({ error: "invalid token" }, { status: 401 });
  }

  const naverData = await naverRes.json();
  const naverId: string | undefined = naverData?.response?.id;

  if (!naverId) {
    return NextResponse.json({ error: "could not resolve user" }, { status: 400 });
  }

  const hashed = hashNaverId(naverId);

  const user = await prisma.user.findFirst({
    where: { hashedNaverId: hashed, deletedAt: null },
    select: { id: true, publicId: true, nickname: true, hashedNaverId: true },
  });

  if (!user) {
    return NextResponse.json({ ok: true });
  }

  const reportCount = await prisma.report.count({
    where: { post: { authorId: user.id }, status: "RESOLVED" },
  });

  const now = new Date();
  const retainUntil = new Date(now);
  retainUntil.setFullYear(
    retainUntil.getFullYear() + (reportCount > 0 ? FRAUD_RETENTION_YEARS : RETENTION_YEARS)
  );

  await prisma.$transaction([
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
    prisma.user.update({
      where: { id: user.id },
      data: {
        nickname: `탈퇴#${user.publicId}`,
        deletedAt: now,
        retainUntil,
      },
    }),
    prisma.account.deleteMany({ where: { userId: user.id } }),
  ]);

  return NextResponse.json({ ok: true });
}
