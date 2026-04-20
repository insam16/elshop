import { prisma } from "@/lib/prisma";

// 자릿수 변경 시 이 값만 수정 (4 → 5 → 6)
export const NICKNAME_DIGITS = 4;

export async function generateTempNickname(): Promise<string> {
  const counter = await prisma.tempNicknameSeq.upsert({
    where: { id: 1 },
    update: { seq: { increment: 1 } },
    create: { id: 1, seq: 1 },
  });
  return `인증대기#${String(counter.seq).padStart(NICKNAME_DIGITS, "0")}`;
}
