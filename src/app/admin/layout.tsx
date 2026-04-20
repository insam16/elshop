import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");

  const [pendingReports, pendingCommentReports, pendingVerifications] = await Promise.all([
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.commentReport.count({ where: { status: "PENDING" } }),
    prisma.user.count({ where: { role: "TEMP" } }),
  ]);

  return (
    <div>
      <div className="mb-6 pb-4 border-b border-border-base flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded font-medium">
            ADMIN
          </span>
          <span className="text-sm text-muted-foreground">
            {session.user.nickname ?? "?"}
          </span>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/admin/reports" className="flex items-center gap-1.5 text-muted-foreground hover:text-primary-base transition-colors">
            게시글 신고
            {pendingReports > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 min-w-[18px] h-4 flex items-center justify-center rounded-full">
                {pendingReports > 99 ? "99+" : pendingReports}
              </span>
            )}
          </Link>
          <Link href="/admin/comment-reports" className="flex items-center gap-1.5 text-muted-foreground hover:text-primary-base transition-colors">
            댓글 신고
            {pendingCommentReports > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 min-w-[18px] h-4 flex items-center justify-center rounded-full">
                {pendingCommentReports > 99 ? "99+" : pendingCommentReports}
              </span>
            )}
          </Link>
          <Link href="/admin/users" className="flex items-center gap-1.5 text-muted-foreground hover:text-primary-base transition-colors">
            유저 관리
            {pendingVerifications > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 min-w-[18px] h-4 flex items-center justify-center rounded-full">
                {pendingVerifications > 99 ? "99+" : pendingVerifications}
              </span>
            )}
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
