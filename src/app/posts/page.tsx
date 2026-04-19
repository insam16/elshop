import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { CATEGORY_LABEL, STATUS_LABEL } from "@/lib/validators/post";
import { PostCategory, PostStatus } from "@prisma/client";
import { formatDate } from "@/lib/utils/date";
import SearchFilter from "./_components/SearchFilter";

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

type SearchParams = {
  q?: string;
  category?: string;
  status?: string;
};

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q: rawQ, category, status } = await searchParams;
  const q = rawQ?.slice(0, 20); // 검색어 최대 20자 제한

  const posts = await prisma.post.findMany({
    where: {
      deletedAt: null,
      ...(category && Object.values(PostCategory).includes(category as PostCategory)
        ? { category: category as PostCategory }
        : {}),
      ...(status && Object.values(PostStatus).includes(status as PostStatus)
        ? { status: status as PostStatus }
        : {}),
      ...(q
        ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { content: { contains: q, mode: "insensitive" } },
          ],
        }
        : {}),
    },
    include: {
      author: { select: { id: true, publicId: true, nickname: true, name: true } },
      _count: {
        select: {
          comments: { where: { deletedAt: null } }
        }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">거래 목록</h1>
        <Link
          href="/posts/new"
          className="bg-primary-base text-primary-foreground px-4 py-1.5 rounded-lg text-sm hover:opacity-90 transition-opacity"
        >
          글쓰기
        </Link>
      </div>

      {/* useSearchParams는 Suspense 경계 필요 */}
      <Suspense fallback={null}>
        <SearchFilter />
      </Suspense>

      {posts.length === 0 ? (
        <p className="text-center text-gray-400 py-16 text-sm">
          {q ? `"${q}" 검색 결과가 없습니다.` : "게시글이 없습니다."}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {posts.map((post) => (
            <li key={post.id}>
              <div className="flex items-center justify-between bg-card border border-border-base rounded-xl px-4 py-3 hover:bg-muted transition-colors">
                <Link href={`/posts/${post.id}`} className="flex items-center gap-2 min-w-0 flex-1">
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
                </Link>
                <div className="text-xs text-muted-foreground shrink-0 ml-3">
                  {post.author.nickname ? (
                    <Link href={`/users/${post.author.publicId}`} className="hover:text-primary-base transition-colors">
                      {post.author.nickname}
                    </Link>
                  ) : "탈퇴한 유저"} ·{" "}
                  {formatDate(post.createdAt)}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
