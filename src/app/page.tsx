import Link from "next/link";

export default function HomePage() {
  return (
    <div className="text-center py-16">
      <h1 className="text-3xl font-bold mb-4">엘샵에 오신 것을 환영합니다</h1>
      <p className="text-muted-foreground mb-8">엘소드 유저들을 위한 아이템 거래 게시판입니다.</p>
      <div className="flex justify-center gap-4 flex-wrap">
        <Link
          href="/posts"
          className="bg-primary-base text-primary-foreground px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          게시판 보기
        </Link>
        <Link
          href="/posts/new"
          className="border border-primary-base text-primary-base px-6 py-2 rounded-lg hover:bg-muted transition-colors"
        >
          글 작성하기
        </Link>
      </div>

      {/* 사기 예방 가이드 */}
      <div className="mt-10 max-w-md mx-auto bg-amber-50 border border-amber-200 rounded-xl p-5 text-left">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <p className="text-sm font-semibold text-amber-800">사기 피해 예방을 위한 가이드</p>
        </div>
        <ul className="text-xs text-amber-700 space-y-1.5 list-disc list-inside">
          <li>게시글에 계좌번호, 전화번호 등 개인정보를 직접 노출하지 마세요.</li>
          <li>댓글 없이 다른 수단으로 거래를 시도하는 이용자를 각별히 주의하세요.</li>
          <li>의심스러운 거래 상대는 <strong>신고</strong> 기능을 이용해주세요.</li>
          <li>피해 발생 시 거래 내역을 캡처해 두세요.</li>
        </ul>
      </div>

      <div className="flex flex-col items-center">
        <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-xs text-muted-foreground hover:text-foreground transition-colors group">
          <span className="flex h-2 w-2 rounded-full bg-primary-base animate-pulse"></span>
          <a
            href="/notice"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            공지사항
          </a>
          <svg className="w-3 h-3 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
        <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-xs text-muted-foreground hover:text-foreground transition-colors group">
          <span className="flex h-2 w-2 rounded-full bg-primary-base animate-pulse"></span>
          <a
            href="https://naver.me/GsB4618H"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            버그 신고 / 기능 요청 (네이버폼)
          </a>
          <svg className="w-3 h-3 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
        <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-xs text-muted-foreground hover:text-foreground transition-colors group">
          <span className="flex h-2 w-2 rounded-full bg-primary-base animate-pulse"></span>
          <a
            href="https://open.kakao.com/me/insam16"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            빠른 문의 (카카오톡)
          </a>
          <svg className="w-3 h-3 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
