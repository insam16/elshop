import Link from "next/link";

export default function HomePage() {
  return (
    <div className="text-center py-16">
      <h1 className="text-3xl font-bold mb-4">엘샵에 오신 걸 환영합니다</h1>
      <p className="text-muted-foreground mb-8">엘소드 유저들을 위한 아이템 거래 게시판입니다.</p>
      <div className="flex justify-center gap-4 flex-wrap">
        <Link
          href="/posts"
          className="bg-primary-base text-primary-foreground px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          거래 목록 보기
        </Link>
        <Link
          href="/posts/new"
          className="border border-primary-base text-primary-base px-6 py-2 rounded-lg hover:bg-muted transition-colors"
        >
          글 작성하기
        </Link>
      </div>

      <div className="mt-12 inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-xs text-muted-foreground hover:text-foreground transition-colors group">
        <span className="flex h-2 w-2 rounded-full bg-primary-base animate-pulse"></span>
        <span className="font-semibold uppercase tracking-wider">Notice</span>
        <a
          href="https://blog.insam16.dev/2026/04/18/%ec%97%98%ec%83%b5-%ec%98%a4%ed%94%88-%ec%95%88%eb%82%b4%eb%93%9c%eb%a6%bd%eb%8b%88%eb%8b%a4/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          엘샵 오픈 안내드립니다 (2026.04.18)
        </a>
        <svg className="w-3 h-3 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}
