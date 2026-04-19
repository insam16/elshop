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

const PREMIUM_DISPLAY_LIMIT = 10;
const REGULAR_PAGE_SIZE = 20;

type SearchParams = {
  q?: string;
  category?: string;
  status?: string;
  page?: string;
  showAllPremium?: string;
};

type PostInclude = {
  author: { id: string; publicId: string; nickname: string | null; name: string | null };
  _count: { comments: number };
};


function buildWhereClause(
  q: string | undefined,
  category: string | undefined,
  status: string | undefined,
) {
  return {
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
          { title: { contains: q, mode: "insensitive" as const } },
          { content: { contains: q, mode: "insensitive" as const } },
        ],
      }
      : {}),
  };
}

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q: rawQ, category, status, page: pageParam, showAllPremium } = await searchParams;
  const q = rawQ?.slice(0, 20);
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const showAll = showAllPremium === "1";

  const baseWhere = buildWhereClause(q, category, status);
  const now = new Date();

  const premiumWhere = {
    ...baseWhere,
    isPremium: true,
    premiumUntil: { gt: now },
  };

  // 일반 게시글: 프리미엄이 아니거나 만료된 것
  const regularWhere = {
    ...baseWhere,
    OR: [
      { isPremium: false },
      { isPremium: true, premiumUntil: { lte: now } },
    ],
  };

  const includeOpts = {
    author: { select: { id: true, publicId: true, nickname: true, name: true } },
    _count: {
      select: { comments: { where: { deletedAt: null } } },
    },
  } as const;

  const [premiumPosts, premiumTotal, regularPosts, regularTotal] = await Promise.all([
    prisma.post.findMany({
      where: premiumWhere,
      include: includeOpts,
      orderBy: { premiumUntil: "asc" }, // 만료 임박 순으로 상단 노출 우선
      ...(showAll ? {} : { take: PREMIUM_DISPLAY_LIMIT }),
    }),
    prisma.post.count({ where: premiumWhere }),
    prisma.post.findMany({
      where: regularWhere,
      include: includeOpts,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * REGULAR_PAGE_SIZE,
      take: REGULAR_PAGE_SIZE,
    }),
    prisma.post.count({ where: regularWhere }),
  ]);

  const totalPages = Math.ceil(regularTotal / REGULAR_PAGE_SIZE);

  function buildSearchQs(overrides: Record<string, string | undefined> = {}) {
    const merged = { q, category, status, showAllPremium, ...overrides };
    const qs = new URLSearchParams();
    if (merged.q) qs.set("q", merged.q);
    if (merged.category) qs.set("category", merged.category);
    if (merged.status) qs.set("status", merged.status);
    if (merged.showAllPremium) qs.set("showAllPremium", merged.showAllPremium);
    if ("page" in merged && merged.page) qs.set("page", merged.page as string);
    return qs;
  }

  function paginationHref(p: number) {
    const qs = buildSearchQs({ page: p > 1 ? String(p) : undefined });
    return `/posts${qs.size ? `?${qs}` : ""}`;
  }

  const hasAnyPost = premiumPosts.length > 0 || regularPosts.length > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">게시판</h1>
        <Link
          href="/posts/new"
          className="bg-primary-base text-primary-foreground px-4 py-1.5 rounded-lg text-sm hover:opacity-90 transition-opacity"
        >
          글쓰기
        </Link>
      </div>

      <Suspense fallback={null}>
        <SearchFilter />
      </Suspense>

      {!hasAnyPost ? (
        <p className="text-center text-gray-400 py-16 text-sm">
          {q ? `"${q}" 검색 결과가 없습니다.` : "게시글이 없습니다."}
        </p>
      ) : (
        <>
          {/* 프리미엄 섹션 */}
          {premiumPosts.length > 0 && (
            <section className="mb-6">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-sm font-bold text-amber-600">★ 프리미엄</span>
                <span className="text-xs text-muted-foreground">
                  ({showAll ? premiumTotal : Math.min(premiumTotal, PREMIUM_DISPLAY_LIMIT)}건)
                </span>
              </div>
              <ul className="flex flex-col gap-2">
                {premiumPosts.map((post) => (
                  <li key={post.id}>
                    <PostRow post={post} premium />
                  </li>
                ))}
              </ul>
              {!showAll && premiumTotal > PREMIUM_DISPLAY_LIMIT && (
                <div className="mt-2 text-center">
                  <Link
                    href={`/posts?${buildSearchQs({ showAllPremium: "1" })}`}
                    className="text-xs text-amber-600 hover:text-amber-700 border border-amber-300 bg-amber-50 px-4 py-1.5 rounded-full transition-colors inline-block"
                  >
                    프리미엄 상품 더보기 ({premiumTotal}건) ▼
                  </Link>
                </div>
              )}
              {showAll && premiumTotal > PREMIUM_DISPLAY_LIMIT && (
                <div className="mt-2 text-center">
                  <Link
                    href={`/posts?${buildSearchQs({ showAllPremium: undefined })}`}
                    className="text-xs text-muted-foreground hover:text-foreground border border-border-base bg-card px-4 py-1.5 rounded-full transition-colors inline-block"
                  >
                    프리미엄 상품 접기 ▲
                  </Link>
                </div>
              )}
              <div className="border-t border-border-base mt-4" />
            </section>
          )}

          {/* 일반 게시글 */}
          {regularPosts.length > 0 && (
            <>
              <ul className="flex flex-col gap-2">
                {regularPosts.map((post) => (
                  <li key={post.id}>
                    <PostRow post={post} />
                  </li>
                ))}
              </ul>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <nav className="flex justify-center items-center gap-1 mt-6">
                  <Link
                    href={paginationHref(page - 1)}
                    aria-disabled={page <= 1}
                    className={`px-3 py-1.5 rounded text-sm border transition-colors ${page <= 1
                        ? "pointer-events-none border-border-base text-muted-foreground opacity-40"
                        : "border-border-base hover:bg-muted"
                      }`}
                  >
                    ←
                  </Link>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === totalPages ||
                        Math.abs(p - page) <= 2,
                    )
                    .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === "..." ? (
                        <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground text-sm">
                          …
                        </span>
                      ) : (
                        <Link
                          key={item}
                          href={paginationHref(item as number)}
                          className={`px-3 py-1.5 rounded text-sm border transition-colors ${page === item
                              ? "bg-primary-base text-primary-foreground border-primary-base"
                              : "border-border-base hover:bg-muted"
                            }`}
                        >
                          {item}
                        </Link>
                      ),
                    )}
                  <Link
                    href={paginationHref(page + 1)}
                    aria-disabled={page >= totalPages}
                    className={`px-3 py-1.5 rounded text-sm border transition-colors ${page >= totalPages
                        ? "pointer-events-none border-border-base text-muted-foreground opacity-40"
                        : "border-border-base hover:bg-muted"
                      }`}
                  >
                    →
                  </Link>
                </nav>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

type PostRowProps = {
  post: {
    id: number;
    title: string;
    category: PostCategory;
    status: PostStatus;
    createdAt: Date;
    author: { id: string; publicId: string; nickname: string | null; name: string | null };
    _count: { comments: number };
  } & PostInclude;
  premium?: boolean;
};

function PostRow({ post, premium }: PostRowProps) {
  return (
    <div
      className={`flex items-center justify-between border rounded-xl px-4 py-3 hover:bg-muted transition-colors ${premium
          ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
          : "bg-card border-border-base"
        }`}
    >
      <Link href={`/posts/${post.id}`} className="flex items-center gap-2 min-w-0 flex-1">
        {premium && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded shrink-0 bg-amber-500 text-white">
            프리미엄
          </span>
        )}
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
        ) : (
          "탈퇴한 유저"
        )}{" "}
        · {formatDate(post.createdAt)}
      </div>
    </div>
  );
}
