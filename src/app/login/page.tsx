import { signIn, auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/");
  return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="text-2xl font-bold mb-6 text-center">로그인</h1>
      <div className="bg-card rounded-xl border border-border-base p-6">
        <form
          action={async () => {
            "use server";
            await signIn("naver", { redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 bg-[#03C75A] text-white py-3 rounded-lg font-medium hover:bg-[#02b350] transition-colors"
          >
            <NaverIcon />
            네이버로 로그인
          </button>
        </form>
      </div>
    </div>
  );
}

function NaverIcon() {
  return (
    <span className="font-bold text-lg leading-none">N</span>
  );
}
