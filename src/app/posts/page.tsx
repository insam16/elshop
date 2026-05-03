import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BOARD_LABEL, BOARD_DESC, CATEGORY_LABEL, STATUS_LABEL, CATEGORY_BADGE, STATUS_BADGE } from "@/lib/validators/post";
import { Prisma, PostBoard, PostCategory, PostStatus } from "@prisma/client";
import { formatDate } from "@/lib/utils/date";
import SearchFilter from "./_components/SearchFilter";
import TempUserNotice from "./_components/TempUserNotice";
import { notices } from "@/lib/data/notices";

const PREMIUM_DISPLAY_LIMIT = 10;
const REGULAR_PAGE_SIZE = 20;

type SearchParams = {
  q?: string;
  board?: string;
  category?: string;
  status?: string;
  page?: string;
  showAllPremium?: string;
};

type PostInclude = {
  author: { id: string; publicId: string; nickname: string | null; name: string | null };
  _count: { comments: number };
};


function buildBaseConditions(
  q: string | undefined,
  board: string | undefined,
  category: string | undefined,
  status: string | undefined,
): Prisma.PostWhereInput[] {
  const conditions: Prisma.PostWhereInput[] = [{ deletedAt: null }];
  if (board && Object.values(PostBoard).includes(board as PostBoard))
    conditions.push({ board: board as PostBoard });
  if (category && Object.values(PostCategory).includes(category as PostCategory))
    conditions.push({ category: category as PostCategory });
  if (status && Object.values(PostStatus).includes(status as PostStatus))
    conditions.push({ status: status as PostStatus });
  if (q) {
    for (const word of q.trim().split(/\s+/).filter(Boolean)) {
      conditions.push({
        OR: [
          { title: { contains: word, mode: "insensitive" } },
          { content: { contains: word, mode: "insensitive" } },
        ],
      });
    }
  }
  return conditions;
}

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { q: rawQ, board, category, status, page: pageParam, showAllPremium } = await searchParams;
  const q = rawQ?.slice(0, 20);
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const showAll = showAllPremium === "1";
  const activeBoard = board && Object.values(PostBoard).includes(board as PostBoard)
    ? (board as PostBoard)
    : null;

  const baseConditions = buildBaseConditions(q, activeBoard ?? undefined, category, status);
  const now = new Date();

  const premiumWhere: Prisma.PostWhereInput = {
    AND: [...baseConditions, { isPremium: true }, { premiumUntil: { gt: now } }],
  };

  // 일반 게시글: 프리미엄이 아니거나 만료된 것
  const regularWhere: Prisma.PostWhereInput = {
    AND: [
      ...baseConditions,
      { OR: [{ isPremium: false }, { isPremium: true, premiumUntil: { lte: now } }] },
    ],
  };

  const includeOpts = {
    author: { select: { id: true, publicId: true, nickname: true, name: true, role: true } },
    _count: {
      select: { comments: { where: { deletedAt: null } } },
    },
  } as const;

  const [premiumPosts, premiumTotal, regularPosts, regularTotal] = await Promise.all([
    prisma.post.findMany({
      where: premiumWhere,
      include: includeOpts,
      orderBy: { premiumUntil: "asc" },
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
    const merged = { q, board: activeBoard ?? undefined, category, status, showAllPremium, ...overrides };
    const qs = new URLSearchParams();
    if (merged.q) qs.set("q", merged.q);
    if (merged.board) qs.set("board", merged.board);
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
      {session.user.role === "TEMP" && <TempUserNotice />}
      <div className="page-header">
        <h1 className="text-xl font-bold">게시판</h1>
        <Link
          href="/posts/new"
          className="bg-primary-base text-primary-foreground px-4 py-1.5 rounded-lg text-sm hover:opacity-90 transition-opacity"
        >
          글쓰기
        </Link>
      </div>

      {/* 공지사항 */}
      {notices.some((n) => n.showInBanner) && (
        <div className="mb-4 border border-border-base rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border-base">
            <span className="text-xs font-semibold text-muted-foreground">공지사항</span>
            <Link href="/notice" className="text-xs text-muted-foreground hover:text-primary-base transition-colors">
              전체보기 →
            </Link>
          </div>
          <ul>
            {[...notices].filter((n) => n.showInBanner).sort((a, b) => b.id - a.id).map((notice, idx, arr) => (
              <li key={notice.id} className={idx < arr.length - 1 ? "border-b border-border-base" : ""}>
                <Link
                  href={notice.href}
                  className="flex items-center gap-2 px-4 py-2.5 hover:bg-muted transition-colors"
                >
                  {notice.important && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-600 shrink-0">중요</span>
                  )}
                  <span className="text-sm truncate flex-1">{notice.title}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{notice.date}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 게시판 탭 */}
      <div className="flex border-b border-border-base mb-4">
        <Link
          href="/posts"
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeBoard === null
            ? "border-primary-base text-primary-base"
            : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
        >
          전체
        </Link>
        {Object.values(PostBoard).map((b) => {
          const href = `/posts?board=${b}`;
          const isActive = activeBoard === b;
          return (
            <Link
              key={b}
              href={href}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${isActive
                ? "border-primary-base text-primary-base"
                : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
              {BOARD_LABEL[b]}
              {isActive
                ? <span className="ml-1 text-xs opacity-60">({BOARD_DESC[b]})</span>
                : <span></span>
              }

            </Link>
          );
        })}
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
                <span className="text-sm font-bold text-violet-600">★ 프리미엄 ★ </span>
                <span className="text-xs text-muted-foreground">
                  ({showAll ? premiumTotal : Math.min(premiumTotal, PREMIUM_DISPLAY_LIMIT)}건)
                </span>
              </div>
              <ul className="flex flex-col gap-2">
                {premiumPosts.map((post) => (
                  <li key={post.id}>
                    <PostRow post={post} premium showBoard={activeBoard === null} />
                  </li>
                ))}
              </ul>
              {!showAll && premiumTotal > PREMIUM_DISPLAY_LIMIT && (
                <div className="mt-2 text-center">
                  <Link
                    href={`/posts?${buildSearchQs({ showAllPremium: "1" })}`}
                    className="text-xs text-violet-600 hover:text-violet-700 border border-violet-300 bg-violet-50 px-4 py-1.5 rounded-full transition-colors inline-block"
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
                    <PostRow post={post} showBoard={activeBoard === null} />
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
    board: PostBoard;
    category: PostCategory;
    status: PostStatus;
    createdAt: Date;
    author: { id: string; publicId: string; nickname: string | null; name: string | null; role: string };
    _count: { comments: number };
  } & PostInclude;
  premium?: boolean;
  showBoard?: boolean;
};

function PostRow({ post, premium, showBoard }: PostRowProps) {
  const isDimmed = post.status === "COMPLETED" || post.status === "EXPIRED";
  return (
    <div
      className={`border rounded-xl px-4 py-3 hover:bg-muted transition-colors ${premium
        ? "bg-violet-50 border-violet-200 dark:bg-violet-950/20 dark:border-violet-800"
        : isDimmed
          ? "bg-gray-100 border-gray-300 dark:bg-gray-900/60 dark:border-gray-800 dark:opacity-80"
          : "bg-card border-border-base"
        }`}
    >
      {/* 배지 + (데스크탑: 제목) + 메타 */}
      <div className="flex items-center justify-between gap-2">
        <Link href={`/posts/${post.id}`} className="flex items-center gap-2 min-w-0 flex-1">
          {premium && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded shrink-0 bg-violet-500 text-white">
              프리미엄
            </span>
          )}
          {showBoard && (
            <span className="board-label-badge">
              [{BOARD_LABEL[post.board]}]
            </span>
          )}
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
        </Link>
        <div className="text-xs text-muted-foreground shrink-0 ml-1">
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
