import Link from "next/link";
import { auth, signOut } from "@/auth";

export default async function Header() {
  const session = await auth();

  return (
    <header className="border-b border-border-base bg-card">
      <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-primary-base">
          엘샵
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/posts" className="hover:text-primary-base transition-colors">
            거래 목록
          </Link>
          {session ? (
            <>
              <Link href="/posts/new" className="hover:text-primary-base transition-colors">
                글쓰기
              </Link>
              <span className="text-muted-foreground">
                {session.user.nickname ?? session.user.name ?? session.user.email}
              </span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button type="submit" className="hover:text-red-500">
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="hover:text-primary-base transition-colors">
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
