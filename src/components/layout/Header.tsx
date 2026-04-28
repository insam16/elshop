import Link from "next/link";
import { auth } from "@/auth";
import { getUnreadCount } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

export default async function Header() {
  const session = await auth();
  const unreadCount = session ? await getUnreadCount(session.user.id) : 0;

  let adminNotifications = 0;
  if (session?.user.role === "ADMIN") {
    const [pendingReports, pendingCommentReports, pendingVerifications] =
      await Promise.all([
        prisma.report.count({ where: { status: "PENDING" } }),
        prisma.commentReport.count({ where: { status: "PENDING" } }),
        prisma.user.count({ where: { role: "TEMP" } }),
      ]);
    adminNotifications =
      pendingReports + pendingCommentReports + pendingVerifications;
  }

  return (
    <header className="border-b border-border-base bg-card text-foreground">
      <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-base hover:text-primary-base transition-colors">
          <div className="flex items-center gap-1.5">
            <img className="w-4 h-4" src="/favicon.ico" alt="엘샵" />
            엘샵
          </div>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/posts" className="hover:text-primary-base transition-colors">
            게시판
          </Link>
          {session ? (
            <>
              <Link
                href="/notifications"
                className="relative text-muted-foreground hover:text-primary-base transition-colors"
                aria-label="알림"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 leading-none">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
              <Link
                href="/account"
                className="text-muted-foreground hover:text-primary-base transition-colors"
              >
                {session.user.nickname ?? "?"}
              </Link>
              {session.user.role === "ADMIN" && (
                <Link
                  href="/admin/reports"
                  title="관리자 알림"
                >
                  {adminNotifications > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 min-w-[18px] h-4 flex items-center justify-center rounded-full leading-none">
                      {adminNotifications > 99 ? "99+" : adminNotifications}
                    </span>
                  )}
                </Link>
              )}
            </>
          ) : (
            <Link href="/login" className="hover:text-primary-base transition-colors">
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
