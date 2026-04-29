import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BOARD_LABEL, CATEGORY_LABEL, STATUS_LABEL, CATEGORY_BADGE, STATUS_BADGE } from "@/lib/validators/post";
import { PostBoard, PostCategory, PostStatus } from "@prisma/client";
import { formatDate } from "@/lib/utils/date";

export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { publicId: id },
    select: {
      nickname: true,
      deletedAt: true,
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
          board: true,
          category: true,
          status: true,
          isPremium: true,
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

  const displayName = user.nickname ?? "알 수 없음";
  const isDeleted = !!user.deletedAt;

  return (
    <div className="flex flex-col gap-6">
      {/* 프로필 */}
      <div className="card">
        <h1 className="text-xl font-bold mb-1">{displayName}</h1>
        {isDeleted && (
          <p className="text-xs text-muted-foreground mb-4">탈퇴한 사용자입니다.</p>
        )}
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
                <PostRow post={post} />
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
                  <div className="flex items-center gap-2 min-w-0">
                    {comment.post.deletedAt ? (
                      <span className="text-xs text-muted-foreground">(삭제된 게시글)</span>
                    ) : (
                      <>
                        <span className={`post-badge ${CATEGORY_BADGE[comment.post.category]}`}>
                          {CATEGORY_LABEL[comment.post.category]}
                        </span>
                        <span className={`post-badge ${STATUS_BADGE[comment.post.status]}`}>
                          {STATUS_LABEL[comment.post.status]}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">{comment.post.title}</span>
                      </>
                    )}
                    <span className="text-xs text-muted-foreground shrink-0 ml-auto">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
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

type PostRowProps = {
  post: {
    id: number;
    title: string;
    board: PostBoard;
    category: PostCategory;
    status: PostStatus;
    isPremium: boolean;
    createdAt: Date;
    _count: { comments: number };
  };
};

function PostRow({ post }: PostRowProps) {
  return (
    <div
      className={`border rounded-xl px-4 py-3 hover:bg-muted transition-colors ${
        post.isPremium
          ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
          : "bg-card border-border-base"
      }`}
    >
      <Link href={`/posts/${post.id}`} className="flex items-center gap-2 min-w-0">
        {post.isPremium && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded shrink-0 bg-amber-500 text-white">
            프리미엄
          </span>
        )}
        <span className="board-label-badge">
          [{BOARD_LABEL[post.board]}]
        </span>
        <span className={`post-badge ${CATEGORY_BADGE[post.category]}`}>
          {CATEGORY_LABEL[post.category]}
        </span>
        <span className={`post-badge ${STATUS_BADGE[post.status]}`}>
          {STATUS_LABEL[post.status]}
        </span>
        <span className="hidden sm:block text-sm font-medium truncate">{post.title}</span>
        {post._count.comments > 0 && (
          <span className="hidden sm:block text-xs font-bold text-primary-base shrink-0">
            [{post._count.comments}]
          </span>
        )}
        <span className="ml-auto text-xs text-muted-foreground shrink-0">
          {formatDate(post.createdAt)}
        </span>
      </Link>
      {/* 모바일 전용 두 번째 줄: 제목 */}
      <Link href={`/posts/${post.id}`} className="sm:hidden flex items-center gap-1.5 mt-1.5 min-w-0">
        <span className="text-sm font-medium truncate">{post.title}</span>
        {post._count.comments > 0 && (
          <span className="text-xs font-bold text-primary-base shrink-0">
            [{post._count.comments}]
          </span>
        )}
      </Link>
    </div>
  );
}
