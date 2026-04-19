import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CATEGORY_LABEL, STATUS_LABEL } from "@/lib/validators/post";
import { PostCategory, PostStatus } from "@prisma/client";
import { formatDate } from "@/lib/utils/date";

const STATUS_BADGE: Record<PostStatus, string> = {
  OPEN: "bg-green-100 text-green-700",
  RESERVED: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-gray-100 text-gray-400",
};

const CATEGORY_BADGE: Record<PostCategory, string> = {
  SELL: "border border-emerald-600 text-emerald-600",
  BUY: "border border-sky-600 text-sky-600",
  TRADE: "border border-violet-600 text-violet-600",
};

export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { publicId: id, deletedAt: null },
    select: {
      nickname: true,
      name: true,
      _count: {
        select: {
          posts: { where: { deletedAt: null } },
          comments: { where: { deletedAt: null } },
        },
      },
      posts: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          category: true,
          status: true,
          createdAt: true,
          _count: {
            select: { comments: { where: { deletedAt: null } } },
          },
        },
      },
      comments: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          content: true,
          createdAt: true,
          post: {
            select: {
              id: true,
              title: true,
              category: true,
              status: true,
              deletedAt: true,
            },
          },
        },
      },
    },
  });

  if (!user) notFound();

  const displayName = user.nickname ?? user.name ?? "탈퇴한 유저";

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {/* 프로필 */}
      <div className="bg-card border border-border-base rounded-xl p-6">
        <h1 className="text-xl font-bold mb-4">{displayName}</h1>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <span>
            게시글{" "}
            <span className="font-semibold text-foreground">{user._count.posts}</span>
          </span>
          <span>
            댓글{" "}
            <span className="font-semibold text-foreground">{user._count.comments}</span>
          </span>
        </div>
      </div>

      {/* 게시글 목록 */}
      <div>
        <h2 className="text-sm font-semibold mb-3 text-muted-foreground">작성한 게시글</h2>
        {user.posts.length === 0 ? (
          <p className="text-center text-gray-400 py-12 text-sm">작성한 게시글이 없습니다.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {user.posts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/posts/${post.id}`}
                  className="flex items-center justify-between bg-card border border-border-base rounded-xl px-4 py-3 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded shrink-0 ${CATEGORY_BADGE[post.category]}`}>
                      {CATEGORY_LABEL[post.category]}
                    </span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded shrink-0 ${STATUS_BADGE[post.status]}`}>
                      {STATUS_LABEL[post.status]}
                    </span>
                    <span className="text-sm font-medium truncate">{post.title}</span>
                    {post._count.comments > 0 && (
                      <span className="text-xs font-bold text-primary-base shrink-0">
                        [{post._count.comments}]
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground shrink-0 ml-3">
                    {formatDate(post.createdAt)}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 댓글 목록 */}
      <div>
        <h2 className="text-sm font-semibold mb-3 text-muted-foreground">작성한 댓글</h2>
        {user.comments.length === 0 ? (
          <p className="text-center text-gray-400 py-12 text-sm">작성한 댓글이 없습니다.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {user.comments.map((comment) => (
              <li key={comment.id}>
                <Link
                  href={`/posts/${comment.post.id}`}
                  className="flex flex-col gap-1 bg-card border border-border-base rounded-xl px-4 py-3 hover:bg-muted transition-colors"
                >
                  {/* 원글 정보 */}
                  <div className="flex items-center gap-2 min-w-0">
                    {comment.post.deletedAt ? (
                      <span className="text-xs text-muted-foreground">(삭제된 게시글)</span>
                    ) : (
                      <>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded shrink-0 ${CATEGORY_BADGE[comment.post.category]}`}>
                          {CATEGORY_LABEL[comment.post.category]}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">{comment.post.title}</span>
                      </>
                    )}
                    <span className="text-xs text-muted-foreground shrink-0 ml-auto">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  {/* 댓글 내용 */}
                  <p className="text-sm leading-relaxed line-clamp-2 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
