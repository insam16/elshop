import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ReportReason, ReportStatus } from "@prisma/client";
import { adminDisplayName, REASON_LABEL, STATUS_LABEL, STATUS_BADGE } from "@/lib/admin";

const PAGE_SIZE = 20;

export default async function AdminCommentReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const [reports, total] = await Promise.all([
    prisma.commentReport.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        reporter: { select: { nickname: true, email: true, retainUntil: true } },
        comment: {
          select: {
            id: true,
            content: true,
            deletedAt: true,
            parentId: true,
            postId: true,
            author: { select: { nickname: true, email: true, retainUntil: true } },
          },
        },
      },
    }),
    prisma.commentReport.count(),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">댓글/답글 신고 목록</h1>
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
                  <th className="px-4 py-3 font-medium">종류</th>
                  <th className="px-4 py-3 font-medium">신고 댓글 내용</th>
                  <th className="px-4 py-3 font-medium">작성자</th>
                  <th className="px-4 py-3 font-medium">신고자</th>
                  <th className="px-4 py-3 font-medium">사유</th>
                  <th className="px-4 py-3 font-medium">상태</th>
                  <th className="px-4 py-3 font-medium">일시</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-base">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-muted/50 transition-colors align-top">
                    <td className="px-4 py-3">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${report.comment.parentId ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                        {report.comment.parentId ? "답글" : "댓글"}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <a href={`/posts/${report.comment.postId}`} className="text-xs text-muted-foreground hover:text-primary-base break-words line-clamp-2">
                        {report.comment.content.slice(0, 60)}{report.comment.content.length > 60 && "..."}
                      </a>
                      {report.comment.deletedAt && (
                        <span className="ml-1 text-[10px] text-red-500 border border-red-300 px-1 rounded">삭제됨</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {(() => { const d = adminDisplayName(report.comment.author); return (<>{d.name}</>); })()}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {(() => { const d = adminDisplayName(report.reporter); return (<>{d.name}</>); })()}
                    </td>
                    <td className="px-4 py-3">{REASON_LABEL[report.reason]}</td>
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
                        href={`/admin/comment-reports/${report.id}`}
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

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-6">
              <PaginationLink href={`/admin/comment-reports?page=${page - 1}`} disabled={page <= 1}>
                ←
              </PaginationLink>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PaginationLink
                  key={p}
                  href={`/admin/comment-reports?page=${p}`}
                  active={p === page}
                >
                  {p}
                </PaginationLink>
              ))}
              <PaginationLink href={`/admin/comment-reports?page=${page + 1}`} disabled={page >= totalPages}>
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
