import { signIn, auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session) redirect("/");

  const { error } = await searchParams;

  return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="text-2xl font-bold mb-6 text-center">로그인 / 회원가입</h1>
      <div className="bg-card rounded-xl border border-border-base p-6">
        {error === "underage" && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            미성년자(만 19세 미만)는 이용할 수 없습니다.
          </p>
        )}
        {error === "no_birthyear" && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            나이 확인을 위해 네이버 계정의 생년월일 정보 제공에 동의해주세요.
          </p>
        )}
        <form
          action={async () => {
            "use server";
            await signIn("naver", { redirectTo: "/account" });
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
