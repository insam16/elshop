import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma, AdminActionType } from "@prisma/client";
import UserBanSection from "@/app/admin/_components/UserBanSection";
import UserVerifySection from "@/app/admin/_components/UserVerifySection";
import PurgeUserButton from "@/app/admin/_components/PurgeUserButton";
import AnonymizeButton from "@/app/admin/_components/AnonymizeButton";
import ChangeRetentionButton from "@/app/admin/_components/ChangeRetentionButton";

const PAGE_SIZE = 20;

type RoleFilter = "TEMP" | "USER" | "ALL" | "DELETED";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; role?: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const { page: pageParam, q, role: roleParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const query = q?.trim() ?? "";
  const roleFilter: RoleFilter =
    roleParam === "USER" || roleParam === "ALL" || roleParam === "DELETED" ? roleParam : "TEMP";

  const where: Prisma.UserWhereInput = {};
  if (roleFilter === "DELETED") {
    where.deletedAt = { not: null };
  } else {
    where.deletedAt = null;
    if (roleFilter !== "ALL") where.role = roleFilter;
    else where.role = { in: ["TEMP", "USER"] };
  }

  if (query) {
    where.OR = [
      { nickname: { contains: query, mode: "insensitive" } },
      { email: { contains: query, mode: "insensitive" } },
    ];
  }

  const [users, total, tempCount] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: roleFilter === "DELETED" ? { deletedAt: "desc" } : { createdAt: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        publicId: true,
        nickname: true,
        email: true,
        role: true,
        isBanned: true,
        bannedUntil: true,
        createdAt: true,
        deletedAt: true,
        retainUntil: true,
        hashedNaverId: true,
      },
    }),
    prisma.user.count({ where }),
    prisma.user.count({ where: { role: "TEMP", deletedAt: null } }),
  ]);

  const publicIds = users.map((u) => u.publicId);
  const retainedUsers = (roleFilter === "DELETED" && publicIds.length > 0)
    ? await prisma.retainedUser.findMany({
      where: { publicId: { in: publicIds } },
      select: { publicId: true, nickname: true },
    })
    : ([] as { publicId: string; nickname: string }[]);
  const retainedNicknameByPublicId = new Map<string, string>(retainedUsers.map((r) => [r.publicId, r.nickname]));

  const userIds = users.map((u) => u.id);
  const recentActions = userIds.length > 0 ? await prisma.adminAction.findMany({
    where: {
      targetUserId: { in: userIds },
      actionType: { in: [AdminActionType.BAN_USER, AdminActionType.UNBAN_USER, AdminActionType.REJECT_USER] },
    },
    orderBy: { createdAt: "desc" },
    select: { targetUserId: true, actionType: true, createdAt: true, note: true, admin: { select: { nickname: true } } },
  }) : [];

  type RecentAction = { targetUserId: string | null; actionType: AdminActionType; createdAt: Date; note: string | null; admin: { nickname: string | null } };
  const lastActionByUser = new Map<string, RecentAction | null>(userIds.map((id) => [id, (recentActions as RecentAction[]).find((a) => a.targetUserId === id) ?? null]));
  const rejectCountByUser = new Map(userIds.map((id) => [
    id,
    recentActions.filter((a) => a.targetUserId === id && a.actionType === AdminActionType.REJECT_USER).length,
  ]));

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const returnPath = `/admin/users?role=${roleFilter}&page=${page}${query ? `&q=${encodeURIComponent(query)}` : ""}`;

  const tabBase = "px-4 py-2 text-sm rounded-lg transition-colors";
  const tabActive = `${tabBase} bg-primary-base text-primary-foreground font-medium`;
  const tabInactive = `${tabBase} border border-border-base hover:bg-muted`;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">유저 관리</h1>
        <div className="flex items-center gap-4">
          {roleFilter === "DELETED" && <AnonymizeButton />}
          <span className="text-sm text-muted-foreground">총 {total}명</span>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <Link href="/admin/users?role=TEMP" className={roleFilter === "TEMP" ? tabActive : tabInactive}>
          인증 대기
          {tempCount > 0 && (
            <span className="ml-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {tempCount}
            </span>
          )}
        </Link>
        <Link href="/admin/users?role=USER" className={roleFilter === "USER" ? tabActive : tabInactive}>
          인증 완료
        </Link>
        <Link href="/admin/users?role=ALL" className={roleFilter === "ALL" ? tabActive : tabInactive}>
          전체
        </Link>
        <Link href="/admin/users?role=DELETED" className={roleFilter === "DELETED" ? tabActive : tabInactive}>
          탈퇴
        </Link>
      </div>

      {/* 검색 */}
      <form method="GET" className="mb-5 flex gap-2">
        <input type="hidden" name="role" value={roleFilter} />
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="닉네임"
          className="border border-border-base rounded-lg px-3 py-2 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary-base flex-1 max-w-sm"
        />
        <button type="submit" className="bg-primary-base text-primary-foreground px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity">
          검색
        </button>
        {query && (
          <Link href={`/admin/users?role=${roleFilter}`} className="border border-border-base px-4 py-2 rounded-lg text-sm hover:bg-muted transition-colors">
            초기화
          </Link>
        )}
      </form>

      {users.length === 0 ? (
        <p className="text-center text-muted-foreground py-16 text-sm">유저가 없습니다.</p>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {users.map((user) => {
              const isPermanent = user.bannedUntil && user.bannedUntil.getFullYear() >= 9999;
              const isDeleted = !!user.deletedAt;
              const lastAction = lastActionByUser.get(user.id);
              const rejectCount = rejectCountByUser.get(user.id) ?? 0;
              const isTemp = user.role === "TEMP";

              if (isDeleted) {
                const now = new Date();
                const expired = user.retainUntil ? user.retainUntil < now : true;
                const retainLabel = user.retainUntil
                  ? expired
                    ? "만료됨"
                    : `${user.retainUntil.toLocaleDateString("ko-KR")} 만료`
                  : "-";
                const hasCooldown = !!user.hashedNaverId;
                const actualNickname = retainedNicknameByPublicId.get(user.publicId) ?? null;

                return (
                  <div key={user.id} className="bg-card border border-border-base rounded-xl p-5 flex flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm text-red-400">
                            {user.nickname ?? "(완전탈퇴됨)"}
                          </span>
                          {actualNickname && (
                            <span className="text-xs text-muted-foreground">
                              ({actualNickname})
                            </span>
                          )}
                          {hasCooldown && !expired && (
                            <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-amber-100 text-amber-700">쿨다운</span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">탈퇴일: {user.deletedAt!.toLocaleDateString("ko-KR")}</span>
                        <span className="text-xs text-muted-foreground">데이터 보관: {retainLabel}</span>
                        <span className="text-xs text-muted-foreground">가입: {user.createdAt.toLocaleDateString("ko-KR")}</span>
                      </div>
                      {(hasCooldown || user.retainUntil) && (
                        <div className="flex gap-2">
                          <ChangeRetentionButton userId={user.id} currentYears={user.retainUntil && user.deletedAt ? (user.retainUntil.getTime() - user.deletedAt.getTime()) > 365 * 24 * 60 * 60 * 1000 ? 3 : 1 : null} />
                          <PurgeUserButton userId={user.id} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <div key={user.id} className="bg-card border border-border-base rounded-xl p-5 flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">
                          {user.nickname ?? "-"}
                        </span>
                        {isTemp && (
                          <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-yellow-100 text-yellow-700">
                            인증대기
                          </span>
                        )}
                        {user.isBanned && (
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium text-white ${isPermanent ? "bg-red-600" : "bg-amber-500"}`}>
                            {isPermanent ? "영구차단" : "이용제한"}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{user.email ?? "-"}</span>
                      <span className="text-xs text-muted-foreground">가입 {user.createdAt.toLocaleDateString("ko-KR")}</span>
                      {lastAction && (
                        <span className="text-xs text-muted-foreground">
                          최근: {lastAction.actionType === "BAN_USER" ? "제재" : lastAction.actionType === "UNBAN_USER" ? "해제" : "거절"} ·{" "}
                          {lastAction.admin.nickname} · {lastAction.createdAt.toLocaleDateString("ko-KR")}
                          {lastAction.note && ` · ${lastAction.note}`}
                        </span>
                      )}
                    </div>
                    {!isTemp && (
                      <Link href={`/users/${user.publicId}`} className="text-xs text-primary-base hover:underline shrink-0">
                        프로필
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-border-base pt-4">
                    {isTemp ? (
                      <UserVerifySection
                        userId={user.id}
                        returnPath={returnPath}
                        rejectCount={rejectCount}
                      />
                    ) : (
                      <UserBanSection
                        userId={user.id}
                        isBanned={user.isBanned}
                        bannedUntil={user.bannedUntil}
                        returnPath={returnPath}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-6">
              <PaginationLink href={`/admin/users?role=${roleFilter}&page=${page - 1}${query ? `&q=${encodeURIComponent(query)}` : ""}`} disabled={page <= 1}>←</PaginationLink>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PaginationLink key={p} href={`/admin/users?role=${roleFilter}&page=${p}${query ? `&q=${encodeURIComponent(query)}` : ""}`} active={p === page}>{p}</PaginationLink>
              ))}
              <PaginationLink href={`/admin/users?role=${roleFilter}&page=${page + 1}${query ? `&q=${encodeURIComponent(query)}` : ""}`} disabled={page >= totalPages}>→</PaginationLink>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PaginationLink({ href, children, active, disabled }: { href: string; children: React.ReactNode; active?: boolean; disabled?: boolean }) {
  if (disabled) return <span className="px-3 py-1.5 text-sm rounded text-muted-foreground opacity-40 cursor-not-allowed">{children}</span>;
  return (
    <Link href={href} className={`px-3 py-1.5 text-sm rounded transition-colors ${active ? "bg-primary-base text-primary-foreground font-medium" : "border border-border-base hover:bg-muted"}`}>
      {children}
    </Link>
  );
}
