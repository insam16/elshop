"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type KeywordState = {
  error?: string;
};

const MAX_KEYWORDS = 10;

export async function addKeyword(
  _prev: KeywordState,
  formData: FormData
): Promise<KeywordState> {
  const session = await auth();
  if (!session) redirect("/login");

  const keyword = (formData.get("keyword") as string).trim();

  if (!keyword) return { error: "키워드를 입력해주세요." };
  if (keyword.length < 2) return { error: "키워드는 2자 이상이어야 합니다." };
  if (keyword.length > 20) return { error: "키워드는 20자 이하여야 합니다." };

  const count = await prisma.notificationKeyword.count({
    where: { userId: session.user.id },
  });
  if (count >= MAX_KEYWORDS) return { error: `키워드는 최대 ${MAX_KEYWORDS}개까지 등록할 수 있습니다.` };

  try {
    await prisma.notificationKeyword.create({
      data: { userId: session.user.id, keyword },
    });
  } catch (e: unknown) {
    if ((e as { code?: string })?.code === "P2002") return { error: "이미 등록된 키워드입니다." };
    return { error: "키워드 등록 중 오류가 발생했습니다." };
  }

  revalidatePath("/account");
  return {};
}

export async function deleteKeyword(id: string): Promise<KeywordState> {
  const session = await auth();
  if (!session) redirect("/login");

  await prisma.notificationKeyword.deleteMany({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/account");
  return {};
}

export async function toggleKeyword(id: string): Promise<KeywordState> {
  const session = await auth();
  if (!session) redirect("/login");

  const keyword = await prisma.notificationKeyword.findFirst({
    where: { id, userId: session.user.id },
    select: { isEnabled: true },
  });
  if (!keyword) return { error: "키워드를 찾을 수 없습니다." };

  await prisma.notificationKeyword.update({
    where: { id },
    data: { isEnabled: !keyword.isEnabled },
  });

  revalidatePath("/account");
  return {};
}
