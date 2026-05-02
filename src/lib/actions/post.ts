"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { validatePost } from "@/lib/validators/post";
import { PostBoard, PostCategory, PostStatus } from "@prisma/client";
import { notifyNewPost } from "@/lib/notifications";
import { checkAndExpireBan } from "@/lib/ban";
import { revalidatePath } from "next/cache";

export type ActionState = {
  errors?: {
    title?: string;
    content?: string;
    board?: string;
    category?: string;
    status?: string;
    negotiable?: string;
    tradeMethod?: string;
    characterName?: string;
    contact?: string;
    general?: string;
  };
};

// ─── 작성 ────────────────────────────────────

export async function createPost(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  if (!session) redirect("/login");

  if (session.user.role === "ADMIN") return { errors: { general: "관리자 계정으로는 게시글을 작성할 수 없습니다." } };

  if (session.user.role === "TEMP") {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentCount = await prisma.post.count({
      where: { authorId: session.user.id, createdAt: { gt: oneDayAgo }, deletedAt: null },
    });
    if (recentCount >= 1) return { errors: { general: "인증대기 계정은 하루에 게시글을 1개만 작성할 수 있습니다." } };
  }

  const banMessage = await checkAndExpireBan(session.user.id);
  if (banMessage) return { errors: { general: banMessage } };

  const titleRaw = formData.get("title");
  const contentRaw = formData.get("content");
  const boardRaw = formData.get("board");
  const categoryRaw = formData.get("category");
  const statusRaw = formData.get("status");
  const negotiableRaw = formData.get("negotiable");
  const tradeMethodRaw = formData.get("tradeMethod");
  const characterNameRaw = formData.get("characterName");
  const contactRaw = formData.get("contact");

  const data = {
    title: typeof titleRaw === "string" ? titleRaw.trim() : "",
    content: typeof contentRaw === "string" ? contentRaw.trim() : "",
    board: typeof boardRaw === "string" ? boardRaw : "",
    category: typeof categoryRaw === "string" ? categoryRaw : "",
    status: typeof statusRaw === "string" ? statusRaw : "",
    negotiable: typeof negotiableRaw === "string" ? negotiableRaw : "false",
    tradeMethod: typeof tradeMethodRaw === "string" ? tradeMethodRaw : "",
    characterName: typeof characterNameRaw === "string" ? characterNameRaw.trim() : "",
    contact: typeof contactRaw === "string" ? contactRaw.trim() : "",
  };

  const errors = validatePost(data);
  if (errors) return { errors };

  const expiresAt = new Date(Date.now() + 168 * 60 * 60 * 1000); // 7일

  const post = await prisma.post.create({
    data: {
      title: data.title,
      content: data.content || null,
      board: data.board as PostBoard,
      category: data.category as PostCategory,
      status: data.status as PostStatus,
      negotiable: data.negotiable === "true",
      tradeMethod: data.tradeMethod,
      characterName: data.characterName || null,
      contact: data.contact || null,
      expiresAt,
      authorId: session.user.id,
    },
  });

  after(async () => {
    await notifyNewPost({
      postId: post.id,
      authorId: session.user.id,
      title: post.title,
      content: post.content ?? "",
    });
  });

  redirect(`/posts/${post.id}`);
}

// ─── 수정 ────────────────────────────────────

export async function updatePost(
  id: number,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  if (!session) redirect("/login");

  const post = await prisma.post.findUnique({ where: { id, deletedAt: null } });
  if (!post) return { errors: { general: "게시글을 찾을 수 없습니다." } };
  if (post.authorId !== session.user.id) return { errors: { general: "수정 권한이 없습니다." } };

  const titleRaw = formData.get("title");
  const contentRaw = formData.get("content");
  const boardRaw = formData.get("board");
  const categoryRaw = formData.get("category");
  const statusRaw = formData.get("status");
  const negotiableRaw = formData.get("negotiable");
  const tradeMethodRaw = formData.get("tradeMethod");
  const characterNameRaw = formData.get("characterName");
  const contactRaw = formData.get("contact");

  const data = {
    title: typeof titleRaw === "string" ? titleRaw.trim() : "",
    content: typeof contentRaw === "string" ? contentRaw.trim() : "",
    board: typeof boardRaw === "string" ? boardRaw : "",
    category: typeof categoryRaw === "string" ? categoryRaw : "",
    status: typeof statusRaw === "string" ? statusRaw : "",
    negotiable: typeof negotiableRaw === "string" ? negotiableRaw : "false",
    tradeMethod: typeof tradeMethodRaw === "string" ? tradeMethodRaw : "",
    characterName: typeof characterNameRaw === "string" ? characterNameRaw.trim() : "",
    contact: typeof contactRaw === "string" ? contactRaw.trim() : "",
  };

  const errors = validatePost(data);
  if (errors) return { errors };

  await prisma.post.update({
    where: { id },
    data: {
      title: data.title,
      content: data.content || null,
      board: data.board as PostBoard,
      category: data.category as PostCategory,
      status: data.status as PostStatus,
      negotiable: data.negotiable === "true",
      tradeMethod: data.tradeMethod,
      characterName: data.characterName || null,
      contact: data.contact || null,
    },
  });

  redirect(`/posts/${id}`);
}

// ─── 연락하기 ────────────────────────────────

export type ContactPostResult =
  | { contact: string }
  | { contact: null }
  | { reserved: true }
  | { error: string };

export async function contactPost(postId: number): Promise<ContactPostResult> {
  const session = await auth();
  if (!session) redirect("/login");

  if (session.user.role !== "USER") return { error: "인증된 계정만 판매자 연락처를 확인할 수 있습니다." };

  const banMessage = await checkAndExpireBan(session.user.id);
  if (banMessage) return { error: banMessage };

  const post = await prisma.post.findUnique({
    where: { id: postId, deletedAt: null },
    select: { status: true, contact: true, authorId: true },
  });

  if (!post) return { error: "게시글을 찾을 수 없습니다." };
  if (post.authorId === session.user.id) return { error: "본인 게시글입니다." };
  if (post.status !== "ACTIVE") return { reserved: true };
  if (post.contact === null) return { contact: null };

  const capturedContact = post.contact;

  try {
    await prisma.$transaction([
      prisma.comment.create({
        data: { content: "연락드렸어요", authorId: session.user.id, postId },
      }),
      prisma.post.update({
        where: { id: postId, status: "ACTIVE" },
        data: { status: "RESERVED", contact: null },
      }),
    ]);
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code;
    if (code === "P2025") return { reserved: true };
    return { error: "처리 중 오류가 발생했습니다." };
  }

  revalidatePath(`/posts/${postId}`);
  return { contact: capturedContact };
}

// ─── 연락처 남기기 ────────────────────────────

export async function leaveContact(
  postId: number,
  contact: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role === "ADMIN") return { success: false, error: "관리자 계정으로는 연락처를 남길 수 없습니다." };

  if (session.user.role === "TEMP") {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentCount = await prisma.comment.count({
      where: { authorId: session.user.id, createdAt: { gt: oneDayAgo }, deletedAt: null },
    });
    if (recentCount >= 3) return { success: false, error: "인증대기 계정은 하루에 댓글을 3개까지만 작성할 수 있습니다." };
  }

  const trimmed = contact.trim();
  if (!trimmed) return { success: false, error: "연락처를 입력해주세요." };
  if (!trimmed.startsWith("https://open.kakao.com/")) return { success: false, error: "카카오톡 오픈채팅 링크(https://open.kakao.com/...)만 입력할 수 있습니다." };
  if (trimmed.length > 50) return { success: false, error: "연락처는 50자 이내로 입력해주세요." };

  const banMessage = await checkAndExpireBan(session.user.id);
  if (banMessage) return { success: false, error: banMessage };

  const post = await prisma.post.findUnique({
    where: { id: postId, deletedAt: null },
    select: { status: true, authorId: true },
  });

  if (!post) return { success: false, error: "게시글을 찾을 수 없습니다." };
  if (post.authorId === session.user.id) return { success: false, error: "본인 게시글입니다." };
  if (post.status !== "ACTIVE" && post.status !== "RESERVED") {
    return { success: false, error: "연락처를 남길 수 없는 게시글입니다." };
  }

  const alreadyLeft = await prisma.comment.findFirst({
    where: { postId, authorId: session.user.id, contact: { not: null }, content: "연락 주세요", deletedAt: null },
    select: { id: true },
  });
  if (alreadyLeft) return { success: false, error: "이미 연락처를 남겼습니다." };

  await prisma.comment.create({
    data: { content: "연락 주세요", contact: trimmed, authorId: session.user.id, postId },
  });

  revalidatePath(`/posts/${postId}`);
  return { success: true };
}

// ─── 거래 완료 ────────────────────────────────

export async function completePost(postId: number): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session) redirect("/login");

  const post = await prisma.post.findUnique({
    where: { id: postId, deletedAt: null },
    select: { authorId: true, status: true },
  });

  if (!post) return { success: false, error: "게시글을 찾을 수 없습니다." };
  if (post.authorId !== session.user.id) return { success: false, error: "권한이 없습니다." };
  if (post.status === "COMPLETED" || post.status === "EXPIRED") {
    return { success: false, error: "이미 완료된 게시글입니다." };
  }

  await prisma.$transaction([
    prisma.post.update({
      where: { id: postId },
      data: { status: "COMPLETED", contact: null },
    }),
    prisma.comment.updateMany({
      where: { postId },
      data: { contact: null },
    }),
  ]);

  revalidatePath(`/posts/${postId}`);
  return { success: true };
}
