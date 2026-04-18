import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CATEGORY_LABEL, STATUS_LABEL } from "@/lib/validators/post";
import { formatDate } from "@/lib/utils/date";
import DeleteButton from "../_components/DeleteButton";
import ReportModal from "../_components/ReportModal";
import Comments from "./_components/Comments";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, session] = await Promise.all([
    prisma.post.findUnique({
      where: { id, deletedAt: null },
      include: {
        author: { select: { id: true, nickname: true, name: true } },
        comments: {
          where: { deletedAt: null },
          orderBy: { createdAt: "asc" },
          include: { author: { select: { id: true, nickname: true, name: true } } },
        },
      },
    }),
    auth(),
  ]);

  if (!post) notFound();

  const isAuthor = session?.user.id === post.author.id;

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">
      <div>
        <Link href="/posts" className="text-sm text-muted-foreground hover:text-primary-base transition-colors">
          ← 목록으로
        </Link>
      </div>

      <div className="bg-card border border-border-base rounded-xl p-6">
        {/* 뱃지 + 제목 */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
            {CATEGORY_LABEL[post.category]}
          </span>
          <span className="text-xs bg-primary-base/10 text-primary-base px-2 py-0.5 rounded">
            {STATUS_LABEL[post.status]}
          </span>
          <h1 className="text-xl font-bold">{post.title}</h1>
        </div>

        {/* 메타 */}
        <div className="text-sm text-muted-foreground mb-6">
          {post.author.nickname ?? post.author.name} ·{" "}
          {formatDate(post.createdAt)}
        </div>

        {/* 내용 */}
        <div className="text-foreground leading-relaxed whitespace-pre-wrap mb-8">
          {post.content}
        </div>

        {/* 하단 버튼 */}
        <div className="flex justify-between items-center">
          {isAuthor ? (
            <div className="flex gap-2">
              <Link
                href={`/posts/${id}/edit`}
                className="text-sm border border-border-base px-3 py-1 rounded hover:bg-muted transition-colors"
              >
                수정
              </Link>
              <DeleteButton postId={id} />
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
