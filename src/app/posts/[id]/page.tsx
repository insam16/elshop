import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BOARD_LABEL, CATEGORY_LABEL, STATUS_LABEL, TRADE_METHOD_LABEL, CATEGORY_BADGE, STATUS_BADGE } from "@/lib/validators/post";
import { formatDate } from "@/lib/utils/date";
import ReportModal from "../_components/ReportModal";
import DeleteRequestModal from "../_components/DeleteRequestModal";
import Comments from "./_components/Comments";

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

  // TEMP 작성자의 게시글은 24시간 후 만료
  if (post.author.role === "TEMP") {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (post.createdAt < twentyFourHoursAgo) notFound();
  }

  const isAuthor = session.user.id === post.author.id;

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">
      <div>
        <Link href="/posts" className="text-sm text-muted-foreground hover:text-primary-base transition-colors">
          ← 목록으로
        </Link>
      </div>

      <div className="bg-card border border-border-base rounded-xl p-6">
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

        {/* 하단 버튼 */}
        <div className="flex justify-between items-center">
          {isAuthor ? (
            <div className="flex items-center gap-2">
              <Link
                href={`/posts/${id}/edit`}
                className="text-sm border border-border-base px-3 py-1 rounded hover:bg-muted transition-colors"
              >
                수정
              </Link>
              <DeleteRequestModal postId={id} />
            </div>
          ) : (
            <div />
          )}
          {session && !isAuthor && <ReportModal postId={id} />}
        </div>
      </div>

      {/* 댓글 */}
      <div className="bg-card border border-border-base rounded-xl p-6">
        <Comments
          postId={id}
          comments={post.comments}
          currentUserId={session?.user.id}
          isAdmin={session?.user.role === "ADMIN"}
        />
      </div>
    </div>
  );
}
