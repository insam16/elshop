import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updateReportStatus } from "@/lib/actions/admin";
import { ReportReason, ReportStatus, AdminActionType } from "@prisma/client";
import ReportActionForm from "./_components/ReportActionForm";
import PostActionButtons from "./_components/PostActionButtons";

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

function adminDisplayName(user: { nickname: string | null; name: string | null; email: string | null; retainUntil: Date | null }) {
  const hasData = user.nickname !== null || user.name !== null;
  const retained = !!user.retainUntil && user.retainUntil > new Date();
  if (hasData) return { name: user.nickname ?? user.name ?? "(닉네임 없음)", email: user.email, retained };
  return { name: "탈퇴한 유저", email: null, retained: false };
}

const ACTION_LABEL: Record<AdminActionType, string> = {
  DELETE_POST: "게시글 삭제",
  RESTORE_POST: "게시글 복구",
  RESOLVE_REPORT: "신고 처리완료",
  REJECT_REPORT: "신고 반려",
  BAN_USER: "사용자 제재",
};

export default async function AdminReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const { id } = await params;

  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      reporter: { select: { nickname: true, name: true, email: true, retainUntil: true } },
      post: {
        select: {
          id: true,
          title: true,
          content: true,
          deletedAt: true,
          author: { select: { nickname: true, name: true, email: true, retainUntil: true } },
        },
      },
      adminActions: {
        orderBy: { createdAt: "desc" },
        include: {
          admin: { select: { nickname: true, name: true } },
        },
      },
    },
  });

  if (!report) notFound();

  const action = updateReportStatus.bind(null, id);

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div>
        <Link
          href="/admin/reports"
          className="text-sm text-muted-foreground hover:text-primary-base transition-colors"
        >
          ← 신고 목록
        </Link>
      </div>

      {/* 신고 정보 */}
      <section className="bg-card border border-border-base rounded-xl p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="font-bold">신고 상세</h1>
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

      {/* 게시글 정보 */}
      <section className="bg-card border border-border-base rounded-xl p-6 flex flex-col gap-3">
        <h2 className="font-bold text-sm">신고 대상 게시글</h2>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
          <dt className="text-muted-foreground">제목</dt>
          <dd>
            {report.post.deletedAt ? (
              <span className="line-through text-muted-foreground">{report.post.title} (삭제됨)</span>
            ) : (
              <Link href={`/posts/${report.post.id}`} className="text-primary-base hover:underline">
                {report.post.title}
              </Link>
            )}
          </dd>

          <dt className="text-muted-foreground">작성자</dt>
          <dd>
            {(() => { const d = adminDisplayName(report.post.author); return <>{d.name}{d.retained && <span className="ml-1 text-[10px] text-amber-600 border border-amber-300 px-1 rounded">보존중</span>}{d.email && <span className="text-xs text-muted-foreground ml-1">({d.email})</span>}</>; })()}
          </dd>

          <dt className="text-muted-foreground">내용</dt>
          <dd className="text-muted-foreground whitespace-pre-wrap text-xs leading-relaxed">
            {report.post.content.slice(0, 200)}
            {report.post.content.length > 200 && "..."}
          </dd>
        </dl>
      </section>

      {/* 게시글 숨김/복구 */}
      <section className="bg-card border border-border-base rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-sm">게시글 처리</h2>
          <span className={`text-xs px-2 py-0.5 rounded font-medium ${report.post.deletedAt ? "bg-gray-100 text-gray-500" : "bg-green-100 text-green-700"}`}>
            {report.post.deletedAt ? "숨김" : "게시 중"}
          </span>
        </div>
        <PostActionButtons
          reportId={report.id}
          postId={report.post.id}
          isHidden={!!report.post.deletedAt}
        />
      </section>

      {/* 신고 상태 변경 폼 */}
      <section className="bg-card border border-border-base rounded-xl p-6">
        <h2 className="font-bold text-sm mb-4">신고 처리</h2>
        <ReportActionForm action={action} currentStatus={report.status} />
      </section>

      {/* 처리 이력 */}
      {report.adminActions.length > 0 && (
        <section className="bg-card border border-border-base rounded-xl p-6">
          <h2 className="font-bold text-sm mb-4">처리 이력</h2>
          <ul className="flex flex-col gap-3">
            {report.adminActions.map((log) => (
              <li key={log.id} className="text-sm flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{ACTION_LABEL[log.actionType]}</span>
                  <span className="text-xs text-muted-foreground">
                    {log.admin.nickname ?? log.admin.name} ·{" "}
                    {log.createdAt.toLocaleDateString("ko-KR")}
                  </span>
                </div>
                {log.note && (
                  <p className="text-xs text-muted-foreground pl-1">{log.note}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
