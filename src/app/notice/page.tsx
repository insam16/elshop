import Link from "next/link";
import { notices } from "@/lib/data/notices";

export const metadata = { title: "공지사항 | 엘소드 샵" };

const sorted = [...notices].sort((a, b) => b.id - a.id);
const pinned = sorted.filter((n) => n.important);

function NoticeItem({ notice, pin = false }: { notice: typeof notices[number]; pin?: boolean }) {
  const inner = (
    <>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {pin && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-600 shrink-0">중요</span>
        )}
        <span className="text-sm font-medium truncate">{notice.title}</span>
        <span className="text-xs text-muted-foreground shrink-0 ml-auto">{notice.date}</span>
      </div>
      <svg className="w-3.5 h-3.5 text-muted-foreground shrink-0 ml-2 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </>
  );

  const className = `flex items-center justify-between border rounded-xl px-4 py-3 hover:bg-muted transition-colors group ${pin ? "border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900/40" : "border-border-base bg-card"
    }`;

  if (notice.external) {
    return (
      <a href={notice.href} target="_blank" rel="noopener noreferrer" className={className}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={notice.href} className={className}>
      {inner}
    </Link>
  );
}

export default function NoticePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-6">공지사항</h1>

      {notices.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12 text-center">공지사항이 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {pinned.length > 0 && (
            <ul className="flex flex-col gap-2">
              {pinned.map((notice) => (
                <li key={`pin-${notice.id}`}>
                  <NoticeItem notice={notice} pin />
                </li>
              ))}
            </ul>
          )}

          <ul className="flex flex-col gap-2">
            {sorted.map((notice) => (
              <li key={notice.id}>
                <NoticeItem notice={notice} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
