import Link from "next/link";

export const metadata = { title: "공지사항 | 엘샵" };

const notices = [
  {
    id: 1,
    date: "2026.04.28",
    title: "엘샵 오픈 안내드립니다",
    href: "/notice/1",
    external: false,
  },
];

export default function NoticePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-6">공지사항</h1>

      {notices.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12 text-center">공지사항이 없습니다.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {notices.map((notice) => (
            <li key={notice.id}>
              {notice.external ? (
                <a
                  href={notice.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between border border-border-base bg-card rounded-xl px-4 py-3 hover:bg-muted transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs text-muted-foreground shrink-0">{notice.date}</span>
                    <span className="text-sm font-medium truncate">{notice.title}</span>
                  </div>
                  <svg className="w-3.5 h-3.5 text-muted-foreground shrink-0 ml-2 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              ) : (
                <Link
                  href={notice.href}
                  className="flex items-center justify-between border border-border-base bg-card rounded-xl px-4 py-3 hover:bg-muted transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs text-muted-foreground shrink-0">{notice.date}</span>
                    <span className="text-sm font-medium truncate">{notice.title}</span>
                  </div>
                  <svg className="w-3.5 h-3.5 text-muted-foreground shrink-0 ml-2 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
