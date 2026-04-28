import { signIn, auth } from "@/auth";
import { redirect } from "next/navigation";

const ERROR_MESSAGES: Record<string, string> = {
  AccessDenied: "탈퇴한 계정은 30일간 재가입이 제한됩니다.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session) redirect("/");

  const { error } = await searchParams;
  const errorMessage = error ? (ERROR_MESSAGES[error] ?? "로그인 중 오류가 발생했습니다.") : null;

  return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="text-2xl font-bold mb-6 text-center">로그인 / 회원가입</h1>
      <div className="bg-card rounded-xl border border-border-base p-6">
        {errorMessage && (
          <p className="mb-4 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2 text-center">
            {errorMessage}
          </p>
        )}
        <form
          action={async () => {
            "use server";
            await signIn("naver", { redirectTo: "/posts" });
          }}
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 bg-[#03C75A] text-white py-3 rounded-lg font-medium hover:bg-[#02b350] transition-colors"
          >
            <NaverIcon />
            네이버로 시작하기
          </button>
        </form>
        <p className="mt-4 text-xs text-muted-foreground text-center">
          시작하면 약관에 동의한 것으로 간주합니다.
        </p>
      </div>
    </div>
  );
}

function NaverIcon() {
  return (
    <span className="font-bold text-lg leading-none">N</span>
  );
}
