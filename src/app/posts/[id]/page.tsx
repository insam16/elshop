import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BOARD_LABEL, CATEGORY_LABEL, STATUS_LABEL, TRADE_METHOD_LABEL, CATEGORY_BADGE, STATUS_BADGE } from "@/lib/validators/post";
import { formatDate } from "@/lib/utils/date";
import ReportModal from "../_components/ReportModal";
import DeleteRequestModal from "../_components/DeleteRequestModal";
import Comments from "./_components/Comments";
import ContactSection from "./_components/ContactSection";
import CompletePostButton from "./_components/CompletePostButton";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (isNaN(id)) notFound();
  const post = await prisma.post.findUnique({
    where: { id, deletedAt: null },
    include: {
      author: { select: { id: true, publicId: true, nickname: true, name: true, role: true } },
      comments: {
        where: { deletedAt: null, parentId: null },
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { id: true, publicId: true, nickname: true, name: true } },
          replies: {
            where: { deletedAt: null },
            orderBy: { createdAt: "asc" },
            include: { author: { select: { id: true, publicId: true, nickname: true, name: true } } },
          },
        },
      },
    },
  });

  if (!post) notFound();

  const isAuthor = session.user.id === post.author.id;
  const isActive = post.status === "ACTIVE" || post.status === "RESERVED";

  // contact는 클라이언트에 노출하지 않음 — hasContact boolean만 전달
  const hasContact = post.contact !== null;
  const viewerHasContact = !isAuthor && post.comments.some(
    c => c.author.id === session.user.id && c.contact !== null
  );
  const comments = post.comments.map(({ contact: _c, ...c }) => ({
    ...c,
    hasContact: _c !== null,
    replies: c.replies.map(({ contact: _rc, ...r }) => ({ ...r })),
  }));

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">
      <div>
        <Link href="/posts" className="text-sm text-muted-foreground hover:text-primary-base transition-colors">
          ← 목록으로
        </Link>
      </div>

      <div className="card">
        {/* 뱃지 + 제목 */}
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-xs px-2 py-0.5 rounded pl-0 pr-0">
            [{BOARD_LABEL[post.board]}]
          </span>
          <span className={`post-badge ${CATEGORY_BADGE[post.category]}`}>
            {CATEGORY_LABEL[post.category]}
          </span>
          <span className={`post-badge ${STATUS_BADGE[post.status]}`}>
            {STATUS_LABEL[post.status]}
          </span>
        </div>
        <div>
          <h1 className="text-xl font-bold mb-1.5">{post.title}</h1>
        </div>

        {/* 메타 */}
        <div className="text-sm text-muted-foreground mb-4">
          {post.author.nickname ? (
            <Link href={`/users/${post.author.publicId}`} className="hover:text-primary-base transition-colors">
              {post.author.nickname}
            </Link>
          ) : "탈퇴한 유저"} ·{" "}
          {formatDate(post.createdAt)}
        </div>

        {/* 거래 정보 */}
        <div className="text-sm flex flex-col gap-1.5 mb-6 border border-border-base rounded-lg px-4 py-3 bg-muted/40">
          <div className="flex gap-2">
            <span className="text-muted-foreground w-20 shrink-0">흥정</span>
            <span>{post.negotiable ? "O" : "X"}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-muted-foreground w-20 shrink-0">거래방식</span>
            <span>{TRADE_METHOD_LABEL[post.tradeMethod] ?? post.tradeMethod}</span>
          </div>
          {post.characterName && (
            <div className="flex gap-2">
              <span className="text-muted-foreground w-20 shrink-0">캐릭터명</span>
              <span>{post.characterName}</span>
            </div>
          )}
          {/* 판매자에게만 자신의 연락처 표시 (ACTIVE 상태에서만) */}
          {isAuthor && post.status === "ACTIVE" && post.contact && (
            <div className="flex gap-2">
              <span className="text-muted-foreground w-20 shrink-0">내 연락처</span>
              <span className="break-all">{post.contact}</span>
            </div>
          )}
        </div>

        {/* 기타 사항 */}
        {post.content && (
          <div className="mb-8">
            <p className="text-xs text-muted-foreground mb-1">기타 사항</p>
            <div className="text-foreground leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>
          </div>
        )}

        {/* 상태 안내 */}
        {post.status === "COMPLETED" && (
          <p className="text-sm text-muted-foreground text-center py-2 mb-4">거래 완료된 게시글입니다.</p>
        )}
        {post.status === "EXPIRED" && (
          <p className="text-sm text-muted-foreground text-center py-2 mb-4">만료된 게시글입니다.</p>
        )}

        {/* 하단 버튼 */}
        <div className="flex justify-between items-center">
          {isAuthor ? (
            <div className="flex items-center gap-2">
              {isActive && (
                <Link
                  href={`/posts/${id}/edit`}
                  className="text-sm border border-border-base px-3 py-1 rounded hover:bg-muted transition-colors"
                >
                  수정
                </Link>
              )}
              {post.status === "RESERVED" && <CompletePostButton postId={id} />}
              <DeleteRequestModal postId={id} />
            </div>
          ) : (
            <div />
          )}
          {!isAuthor && <ReportModal postId={id} />}
        </div>
      </div>

      {/* 구매자 연락 섹션 */}
      {!isAuthor && isActive && session.user.role !== "ADMIN" && (
        <ContactSection
          postId={id}
          hasContact={hasContact}
          status={post.status}
          userRole={session.user.role}
          viewerHasContact={viewerHasContact}
        />
      )}

      {/* 댓글 */}
      <div className="card">
        <Comments
          postId={id}
          comments={comments}
          currentUserId={session?.user.id}
          isAdmin={session?.user.role === "ADMIN"}
          postStatus={post.status}
          isPostAuthor={isAuthor}
        />
      </div>
    </div>
  );
}
