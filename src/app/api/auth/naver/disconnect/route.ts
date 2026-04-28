"use server";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashNaverId } from "@/lib/hashed-adapter";

const RETENTION_YEARS = 1;
const COOLDOWN_DAYS = 30;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const params = new URLSearchParams(body);
  const accessToken = params.get("access_token");

  if (!accessToken) {
    return NextResponse.json({ error: "missing access_token" }, { status: 400 });
  }

  // access_token으로 네이버 유저 ID 조회
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
  });

  if (!user) {
    // 이미 탈퇴했거나 존재하지 않는 계정
    return NextResponse.json({ ok: true });
  }

  const reportCount = await prisma.report.count({
    where: { post: { authorId: user.id } },
  });

  const now = new Date();

  // OAuth 연결 제거 → 재로그인 불가
  await prisma.account.deleteMany({ where: { userId: user.id } });

  if (reportCount > 0) {
    // 신고 이력 있음 → hashedNaverId 보존 (재가입 차단용), 1년 후 만료
    const retainUntil = new Date(now);
    retainUntil.setFullYear(retainUntil.getFullYear() + RETENTION_YEARS);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        deletedAt: now,
        retainUntil,
        email: null,
        nickname: null,
        name: null,
        image: null,
      },
    });
  } else {
    // 신고 이력 없음 → 즉시 익명화 + 30일 쿨다운 후 재가입 허용
    const cooldownUntil = new Date(now);
    cooldownUntil.setDate(cooldownUntil.getDate() + COOLDOWN_DAYS);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        deletedAt: now,
        retainUntil: cooldownUntil,
        email: null,
        nickname: null,
        name: null,
        image: null,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
