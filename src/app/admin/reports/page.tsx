import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ReportReason, ReportStatus } from "@prisma/client";
import { adminDisplayName, REASON_LABEL, STATUS_LABEL, STATUS_BADGE } from "@/lib/admin";

const PAGE_SIZE = 20;


export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        reporter: { select: { nickname: true, email: true, retainUntil: true } },
        post: {
          select: {
            id: true,
            title: true,
            deletedAt: true,
            author: { select: { nickname: true, email: true, retainUntil: true } },
          },
        },
      },
    }),
    prisma.report.count(),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">게시글 신고 목록</h1>
        <span className="text-sm text-muted-foreground">총 {total}건</span>
      </div>

      {reports.length === 0 ? (
        <p className="text-center text-muted-foreground py-16 text-sm">신고 내역이 없습니다.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm bg-card border border-border-base rounded-xl overflow-hidden">
              <thead className="bg-muted text-muted-foreground text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">신고 게시글</th>
                  <th className="px-4 py-3 font-medium">게시글 작성자</th>
                  <th className="px-4 py-3 font-medium">신고자</th>
                  <th className="px-4 py-3 font-medium">사유</th>
                  <th className="px-4 py-3 font-medium">상세</th>
                  <th className="px-4 py-3 font-medium">상태</th>
                  <th className="px-4 py-3 font-medium">일시</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-base">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-muted/50 transition-colors align-top">
                    <td className="px-4 py-3">
                      {report.post.deletedAt ? (
                        <span className="text-muted-foreground line-through">
                          {report.post.title}
                        </span>
                      ) : (
                        <a
                          href={`/posts/${report.post.id}`}
                          className="text-primary-base hover:underline"
                        >
                          {report.post.title}
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {(() => { const d = adminDisplayName(report.post.author); return (<>{d.name}</>); })()}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {(() => { const d = adminDisplayName(report.reporter); return (<>{d.name}</>); })()}
                    </td>
                    <td className="px-4 py-3">{REASON_LABEL[report.reason]}</td>
                    <td className="px-4 py-3 max-w-[160px] text-muted-foreground text-xs break-words">
                      {report.detail ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_BADGE[report.status]}`}>
                        {STATUS_LABEL[report.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {report.createdAt.toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/reports/${report.id}`}
                        className="text-primary-base hover:underline text-xs"
                      >
                        상세
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-6">
              <PaginationLink href={`/admin/reports?page=${page - 1}`} disabled={page <= 1}>
                ←
              </PaginationLink>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PaginationLink
                  key={p}
                  href={`/admin/reports?page=${p}`}
                  active={p === page}
                >
                  {p}
                </PaginationLink>
              ))}
              <PaginationLink href={`/admin/reports?page=${page + 1}`} disabled={page >= totalPages}>
                →
              </PaginationLink>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PaginationLink({
  href,
  children,
  active,
  disabled,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <span className="px-3 py-1.5 text-sm rounded text-muted-foreground opacity-40 cursor-not-allowed">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 text-sm rounded transition-colors ${active
        ? "bg-primary-base text-primary-foreground font-medium"
        : "border border-border-base hover:bg-muted"
        }`}
    >
      {children}
    </Link>
  );
}
