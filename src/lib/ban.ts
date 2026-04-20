import { prisma } from "@/lib/prisma";

export const PERMANENT_BAN_DATE = new Date("9999-12-31");

export function isBanActive(isBanned: boolean, bannedUntil: Date | null): boolean {
  if (!isBanned) return false;
  if (!bannedUntil) return false;
  return bannedUntil > new Date();
}

export function getBanMessage(bannedUntil: Date | null): string {
  if (!bannedUntil || bannedUntil.getFullYear() >= 9999) {
    return "계정이 영구 차단되어 이 기능을 사용할 수 없습니다.";
  }
  return `계정이 ${bannedUntil.toLocaleDateString("ko-KR")}까지 이용 제한되어 있습니다.`;
}

export async function checkAndExpireBan(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isBanned: true, bannedUntil: true },
  });
  if (!user || !user.isBanned || !user.bannedUntil) return null;

  if (user.bannedUntil <= new Date()) {
    await prisma.user.update({
      where: { id: userId },
      data: { isBanned: false, bannedUntil: null },
    });
    return null;
  }

  return getBanMessage(user.bannedUntil);
}
