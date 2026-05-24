import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border-base bg-card mt-auto">
      <div className="mx-auto max-w-4xl px-4 py-6 flex flex-col items-center gap-3">
        <nav className="flex gap-4 text-xs text-muted-foreground">
          <Link href="/terms" className="hover:text-foreground transition-colors">
            이용약관
          </Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors font-medium">
            개인정보처리방침
          </Link>
          <Link href="/policy" className="hover:text-foreground transition-colors">
            운영 정책
          </Link>
        </nav>
        <p className="text-xs text-muted-foreground">
          © 2026 엘소드 샵. 엘소드 유저 거래 게시판 · <Link href="/notice/3" className="hover:text-foreground transition-colors">v1.6</Link>
        </p>
      </div>
    </footer>
  );
}
