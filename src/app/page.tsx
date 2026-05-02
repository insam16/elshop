import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-10 py-10">

      {/* 히어로 */}
      <div className="text-center flex flex-col gap-4">
        <h1 className="text-3xl font-bold leading-tight">
          기다리는 거래에서,<br />바로 연결되는 거래로
        </h1>
        <p className="text-muted-foreground">
          댓글 기다릴 필요 없이, 클릭 한 번으로 바로 연락하세요.<br />
          불필요한 대기를 없앤 엘소드 전용 거래 플랫폼입니다.
        </p>
        <div className="flex justify-center gap-3 flex-wrap">
          <Link
            href="/posts"
            className="bg-primary-base text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            지금 거래 시작하기
          </Link>
          <Link
            href="/about"
            className="border border-border-base px-6 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors"
          >
            어떻게 작동하는지 알아보기
          </Link>
        </div>
      </div>

      {/* 문제 제기 */}
      <div className="card flex flex-col gap-3 text-sm">
        <p className="font-semibold">이런 불편, 겪어보셨나요?</p>
        <ul className="flex flex-col gap-1.5 text-muted-foreground list-disc list-inside pl-1">
          <li>댓글 → 답변 → 연락처까지 이어지는 긴 대기 구조</li>
          <li>오픈채팅 링크·DM 노출로 인한 스팸·불필요한 연락</li>
          <li>오래된 거래글이 방치되는 문제</li>
        </ul>
        <p className="text-muted-foreground">기존 방식은 거래보다 "대기"에 더 많은 시간을 쓰게 만듭니다.</p>
      </div>

      {/* 기능 소개 */}
      <div className="flex flex-col gap-3">
        <p className="font-semibold">엘샵은 이렇게 해결합니다</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              icon: "🔗",
              title: "대기 없는 거래",
              desc: "클릭 한 번으로 거래 상대와 바로 연결됩니다.",
            },
            {
              icon: "🔒",
              title: "연락처 보호 시스템",
              desc: "연락처는 1회만 공개되며 이후 자동 삭제됩니다. 스팸 걱정 없이 거래하세요.",
            },
            {
              icon: "⏱",
              title: "게시글 자동 만료",
              desc: "거래글은 7일 후 자동으로 만료됩니다. 항상 최신 거래 정보만 확인할 수 있습니다.",
            },
            {
              icon: "🛡",
              title: "선택 인증 시스템",
              desc: "인증 없이도 게시글 작성이 가능합니다. 판매자 연락처 확인은 인증 유저만 가능합니다.",
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="card flex flex-col gap-1.5 text-sm">
              <p className="font-medium">{icon} {title}</p>
              <p className="text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 사기 예방 가이드 */}
      <div className="bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/40 rounded-xl p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">사기 피해 예방을 위한 가이드</p>
        </div>
        <ul className="text-xs text-amber-700 dark:text-amber-500 flex flex-col gap-1 list-disc list-inside pl-1">
          <li>게시글에 계좌번호, 전화번호 등 개인정보를 직접 노출하지 마세요.</li>
          <li>댓글 없이 다른 수단으로 거래를 시도하는 이용자를 각별히 주의하세요.</li>
          <li>의심스러운 거래 상대는 <strong>신고</strong> 기능을 이용해주세요.</li>
          <li>피해 발생 시 거래 내역을 캡처해 두세요.</li>
        </ul>
        <Link href="/notice/2" className="text-xs text-amber-700 dark:text-amber-500 hover:underline">
          사기 예방 가이드 자세히 보기 →
        </Link>
      </div>

      {/* 링크 모음 */}
      <div className="flex flex-col items-center gap-2">
        {[
          { label: "공지사항", href: "/notice", external: false },
          { label: "버그 신고 / 기능 요청 (네이버폼)", href: "https://naver.me/GsB4618H", external: true },
          { label: "빠른 문의 (카카오톡)", href: "https://open.kakao.com/me/insam16", external: true },
        ].map(({ label, href, external }) => (
          <div key={label} className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-xs text-muted-foreground hover:text-foreground transition-colors group">
            <span className="flex h-2 w-2 rounded-full bg-primary-base animate-pulse" />
            <a
              href={href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="hover:underline"
            >
              {label}
            </a>
            <svg className="w-3 h-3 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        ))}
      </div>

    </div>
  );
}
