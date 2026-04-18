import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { validateNickname } from "@/lib/validators/nickname";
import NicknameForm from "./NicknameForm";

type FormState = {
  error: string;
};

export default async function NicknamePage() {
  const session = await auth();

  if (!session) redirect("/login");
  if (session.user.nickname) redirect("/");

  async function setNickname(
    _prevState: FormState,
    formData: FormData
  ): Promise<FormState> {
    "use server";

    const session = await auth();
    if (!session) redirect("/login");

    const raw = formData.get("nickname");
    const nickname = typeof raw === "string" ? raw.trim() : "";

    // 1. 서버 검증
    const validationError = validateNickname(nickname);
    if (validationError) {
      return { error: validationError };
    }

    // 2. 미리 중복 체크 (UX)
    const exists = await prisma.user.findUnique({
      where: { nickname },
    });
    if (exists) {
      return { error: "이미 사용 중인 닉네임입니다." };
    }

    // 3. 실제 저장 + 최종 방어
    try {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { nickname },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return { error: "이미 사용 중인 닉네임입니다." };
        }
      }

      return { error: "닉네임 저장 중 오류가 발생했습니다." };
    }

    redirect("/");
  }

  return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="text-2xl font-bold mb-2 text-center">닉네임 설정</h1>
      <p className="text-sm text-gray-500 mb-6 text-center">
        본캐 닉네임을 입력해주세요.
      </p>

      <NicknameForm action={setNickname} />
    </div>
  );
}