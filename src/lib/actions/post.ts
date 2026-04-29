"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { validatePost } from "@/lib/validators/post";
import { PostBoard, PostCategory, PostStatus } from "@prisma/client";
import { notifyNewPost } from "@/lib/notifications";
import { checkAndExpireBan } from "@/lib/ban";

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

  if (session.user.role === "TEMP") {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentCount = await prisma.post.count({
      where: { authorId: session.user.id, createdAt: { gt: oneDayAgo }, deletedAt: null },
    });
    if (recentCount >= 1) return { errors: { general: "미인증 계정은 하루에 게시글을 1개만 작성할 수 있습니다." } };
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

  const data = {
    title: typeof titleRaw === "string" ? titleRaw.trim() : "",
    content: typeof contentRaw === "string" ? contentRaw.trim() : "",
    board: typeof boardRaw === "string" ? boardRaw : "",
    category: typeof categoryRaw === "string" ? categoryRaw : "",
    status: typeof statusRaw === "string" ? statusRaw : "",
    negotiable: typeof negotiableRaw === "string" ? negotiableRaw : "false",
    tradeMethod: typeof tradeMethodRaw === "string" ? tradeMethodRaw : "",
    characterName: typeof characterNameRaw === "string" ? characterNameRaw.trim() : "",
  };

  const errors = validatePost(data);
  if (errors) return { errors };

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

  const data = {
    title: typeof titleRaw === "string" ? titleRaw.trim() : "",
    content: typeof contentRaw === "string" ? contentRaw.trim() : "",
    board: typeof boardRaw === "string" ? boardRaw : "",
    category: typeof categoryRaw === "string" ? categoryRaw : "",
    status: typeof statusRaw === "string" ? statusRaw : "",
    negotiable: typeof negotiableRaw === "string" ? negotiableRaw : "false",
    tradeMethod: typeof tradeMethodRaw === "string" ? tradeMethodRaw : "",
    characterName: typeof characterNameRaw === "string" ? characterNameRaw.trim() : "",
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
    },
  });

  redirect(`/posts/${id}`);
}
