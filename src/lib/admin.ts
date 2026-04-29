import { prisma } from "@/lib/prisma";
import { ReportReason, ReportStatus } from "@prisma/client";

/**
 * publicId 목록에 해당하는 RetainedUser의 실제 닉네임을 Map으로 반환한다.
 * 탈퇴 탭 등에서 익명화된 닉네임 옆에 실제 닉네임을 표시할 때 사용.
 */
export async function getRetainedNicknameMap(
  publicIds: string[]
): Promise<Map<string, string>> {
  if (publicIds.length === 0) return new Map();

  const retainedUsers = await prisma.retainedUser.findMany({
    where: { publicId: { in: publicIds } },
    select: { publicId: true, nickname: true },
  });

  return new Map(retainedUsers.map((r) => [r.publicId, r.nickname]));
}

export function adminDisplayName(user: { nickname: string | null; retainUntil: Date | null }) {
  const retained = !!user.retainUntil && user.retainUntil > new Date();
  if (user.nickname !== null) return { name: user.nickname, retained };
  return { name: "탈퇴한 유저", retained: false };
}

export const REASON_LABEL: Record<ReportReason, string> = {
  FRAUD: "사기",
  FALSE_INFO: "허위 정보",
  INAPPROPRIATE: "부적절한 내용",
  IMPERSONATION: "타인 사칭",
  OTHER: "기타",
};

export const STATUS_LABEL: Record<ReportStatus, string> = {
  PENDING: "대기중",
  REVIEWING: "검토중",
  RESOLVED: "처리완료",
  REJECTED: "반려",
};

export const STATUS_BADGE: Record<ReportStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  REVIEWING: "bg-blue-100 text-blue-700",
  RESOLVED: "bg-green-100 text-green-700",
  REJECTED: "bg-gray-100 text-gray-500",
};
