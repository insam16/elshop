import Link from "next/link";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DeleteAccountButton from "./DeleteAccountButton";
import KeywordSection from "./_components/KeywordSection";

export default async function AccountPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const isTemp = session.user.role === "TEMP";

  const keywords = isTemp ? [] : await prisma.notificationKeyword.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    select: { id: true, keyword: true, isEnabled: true },
  });

  return (
    <div className="max-w-sm mx-auto mt-16 space-y-8">
      <h1 className="text-2xl font-bold">설정</h1>

      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">닉네임</p>
        <div className="flex items-center gap-2">
          <p className="font-medium">{session.user.nickname ?? "-"}</p>
          {isTemp && (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-medium">
              인증대기
            </span>
          )}
        </div>
        {!isTemp && (
          <Link
            href={`/users/${session.user.publicId}`}
            className="inline-block mt-1 text-xs text-muted-foreground hover:text-primary-base transition-colors"
          >
            내 활동 보기 →
          </Link>
        )}
      </div>

      {/* 인증 안내 */}
      {isTemp && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 space-y-3">
          <p className="text-sm font-semibold text-yellow-800">본캐 인증이 필요합니다</p>
          <ol className="text-sm text-yellow-700 space-y-1.5 list-decimal list-inside">
            <li>게임에 접속합니다.</li>
            <li>채팅창에 오늘 날짜와 본인의 임시 닉네임(<strong>{session.user.nickname}</strong>)을 입력합니다.</li>
            <li>초상화와 엘소드 닉네임, 캐릭터 창(기본키 U), 채팅창이 보이는 상태에서 스크린샷을 찍습니다.</li>
            <li>아래 구글폼에 스크린샷과 캐릭터명을 제출합니다.</li>
          </ol>
          <a
            href="https://forms.gle/YKJL3nZQWA1cgkfFA"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-600 transition-colors"
          >
            인증 신청 구글폼 →
          </a>
          <p className="text-xs text-yellow-600">
            제출 후 관리자 검토를 거쳐 승인되면 캐릭터명으로 닉네임이 변경됩니다.
          </p>
        </div>
      )}

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <button
          type="submit"
          className="w-full border border-border-base rounded-lg px-4 py-2 text-sm hover:bg-muted transition-colors text-left"
        >
          로그아웃
        </button>
      </form>

      {!isTemp && (
        <div className="border-t pt-8">
          <KeywordSection keywords={keywords} />
        </div>
      )}

      <div className="border-t pt-8 space-y-3">
        <p className="text-sm font-medium text-red-600">위험 구역</p>
        <p className="text-sm text-muted-foreground">
          탈퇴 시 개인정보가 삭제됩니다. 작성한 게시글과 댓글은 익명으로 유지됩니다.
        </p>
        <p className="text-xs text-muted-foreground">
          단, 신고 이력이 있는 경우 전자상거래법에 따라 1년간 개인정보가 보존될 수 있습니다.
        </p>
        <DeleteAccountButton />
      </div>
    </div>
  );
}
