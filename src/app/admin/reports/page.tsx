import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ReportReason, ReportStatus } from "@prisma/client";

const REASON_LABEL: Record<ReportReason, string> = {
  FRAUD: "사기",
  FALSE_INFO: "허위 정보",
  INAPPROPRIATE: "부적절한 내용",
  OTHER: "기타",
};

const STATUS_LABEL: Record<ReportStatus, string> = {
  PENDING: "대기중",
  REVIEWING: "검토중",
  RESOLVED: "처리완료",
  REJECTED: "반려",
};

const STATUS_BADGE: Record<ReportStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  REVIEWING: "bg-blue-100 text-blue-700",
  RESOLVED: "bg-green-100 text-green-700",
  REJECTED: "bg-gray-100 text-gray-500",
};

export default async function AdminReportsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      reporter: { select: { nickname: true, name: true, email: true } },
      post: {
        select: {
          id: true,
          title: true,
          deletedAt: true,
          author: { select: { nickname: true, name: true, email: true } },
        },
      },
    },
  });

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">신고 목록 (관리자)</h1>

      {reports.length === 0 ? (
        <p className="text-center text-muted-foreground py-16 text-sm">신고 내역이 없습니다.</p>
      ) : (
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
                    {report.post.author.nickname ?? report.post.author.name}
                    <div className="text-xs">{report.post.author.email}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {report.reporter.nickname ?? report.reporter.name}
                    <div className="text-xs">{report.reporter.email}</div>
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
      )}
    </div>
  );
}
