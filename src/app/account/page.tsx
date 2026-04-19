import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DeleteAccountButton from "./DeleteAccountButton";

export default async function AccountPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="max-w-sm mx-auto mt-16 space-y-8">
      <h1 className="text-2xl font-bold">계정 설정</h1>

      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">닉네임</p>
        <p className="font-medium">{session.user.nickname ?? "-"}</p>
      </div>

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
