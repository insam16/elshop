import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updateCommentReportStatus } from "@/lib/actions/admin";
import { ReportReason, ReportStatus } from "@prisma/client";
import CommentReportActionForm from "./_components/CommentReportActionForm";
import CommentActionButtons from "./_components/CommentActionButtons";
import UserBanSection from "@/app/admin/_components/UserBanSection";

const REASON_LABEL: Record<ReportReason, string> = {
  FRAUD: "사기",
  FALSE_INFO: "허위 정보",
  INAPPROPRIATE: "부적절한 내용",
  IMPERSONATION: "타인 사칭",
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

function adminDisplayName(user: { nickname: string | null; name: string | null; email: string | null; retainUntil: Date | null }) {
  const hasData = user.nickname !== null || user.name !== null;
  const retained = !!user.retainUntil && user.retainUntil > new Date();
  if (hasData) return { name: user.nickname ?? user.name ?? "(닉네임 없음)", email: user.email, retained };
  return { name: "탈퇴한 유저", email: null, retained: false };
}

export default async function AdminCommentReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const { id } = await params;

  const report = await prisma.commentReport.findUnique({
    where: { id },
    include: {
      reporter: { select: { nickname: true, name: true, email: true, retainUntil: true } },
      comment: {
        select: {
          id: true,
          content: true,
          deletedAt: true,
          parentId: true,
          postId: true,
          createdAt: true,
          author: { select: { id: true, nickname: true, name: true, email: true, retainUntil: true, isBanned: true, bannedUntil: true } },
          post: { select: { id: true, title: true } },
        },
      },
    },
  });

  if (!report) notFound();

  const action = updateCommentReportStatus.bind(null, id);
  const commentType = report.comment.parentId ? "답글" : "댓글";

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div>
        <Link
          href="/admin/comment-reports"
          className="text-sm text-muted-foreground hover:text-primary-base transition-colors"
        >
          ← 댓글 신고 목록
        </Link>
      </div>

      {/* 신고 정보 */}
      <section className="bg-card border border-border-base rounded-xl p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="font-bold">{commentType} 신고 상세</h1>
          <span className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_BADGE[report.status]}`}>
            {STATUS_LABEL[report.status]}
          </span>
        </div>

        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
          <dt className="text-muted-foreground">신고 사유</dt>
          <dd>{REASON_LABEL[report.reason]}</dd>

          <dt className="text-muted-foreground">상세 내용</dt>
          <dd className="text-muted-foreground">{report.detail ?? "-"}</dd>

          <dt className="text-muted-foreground">신고자</dt>
          <dd>
            {(() => { const d = adminDisplayName(report.reporter); return <>{d.name}{d.retained && <span className="ml-1 text-[10px] text-amber-600 border border-amber-300 px-1 rounded">보존중</span>}{d.email && <span className="text-xs text-muted-foreground ml-1">({d.email})</span>}</>; })()}
          </dd>

          <dt className="text-muted-foreground">접수일</dt>
          <dd>{report.createdAt.toLocaleDateString("ko-KR")}</dd>
        </dl>
      </section>

      {/* 댓글 정보 */}
      <section className="bg-card border border-border-base rounded-xl p-6 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-sm">신고 대상 {commentType}</h2>
          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${report.comment.parentId ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
            {commentType}
          </span>
        </div>

        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
          <dt className="text-muted-foreground">게시글</dt>
          <dd>
            <Link href={`/posts/${report.comment.post.id}`} className="text-primary-base hover:underline">
              {report.comment.post.title}
            </Link>
          </dd>

          <dt className="text-muted-foreground">작성자</dt>
          <dd>
            {(() => { const d = adminDisplayName(report.comment.author); return <>{d.name}{d.retained && <span className="ml-1 text-[10px] text-amber-600 border border-amber-300 px-1 rounded">보존중</span>}{d.email && <span className="text-xs text-muted-foreground ml-1">({d.email})</span>}</>; })()}
          </dd>

          <dt className="text-muted-foreground">작성일</dt>
          <dd>{report.comment.createdAt.toLocaleDateString("ko-KR")}</dd>

          <dt className="text-muted-foreground">내용</dt>
          <dd className="whitespace-pre-wrap text-xs leading-relaxed">
            {report.comment.content}
            {report.comment.deletedAt && (
              <span className="ml-2 text-[10px] text-red-500 border border-red-300 px-1 rounded align-middle">삭제됨</span>
            )}
          </dd>
        </dl>
      </section>

      {/* 댓글 삭제 처리 */}
      <section className="bg-card border border-border-base rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-sm">{commentType} 처리</h2>
          <span className={`text-xs px-2 py-0.5 rounded font-medium ${report.comment.deletedAt ? "bg-gray-100 text-gray-500" : "bg-green-100 text-green-700"}`}>
            {report.comment.deletedAt ? "삭제됨" : "게시 중"}
          </span>
        </div>
        <CommentActionButtons
          commentReportId={report.id}
          commentId={report.comment.id}
          isDeleted={!!report.comment.deletedAt}
        />
      </section>

      {/* 유저 제재 */}
      <section className="bg-card border border-border-base rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-sm">작성자 제재</h2>
          {(() => { const d = adminDisplayName(report.comment.author); return <span className="text-xs text-muted-foreground">{d.name}</span>; })()}
        </div>
        <UserBanSection
          userId={report.comment.author.id}
          isBanned={report.comment.author.isBanned}
          bannedUntil={report.comment.author.bannedUntil}
          returnPath={`/admin/comment-reports/${report.id}`}
        />
      </section>

      {/* 신고 상태 변경 */}
      <section className="bg-card border border-border-base rounded-xl p-6">
        <h2 className="font-bold text-sm mb-4">신고 처리</h2>
        <CommentReportActionForm action={action} currentStatus={report.status} />
      </section>
    </div>
  );
}
