"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { validatePost } from "@/lib/validators/post";
import { PostCategory, PostStatus } from "@prisma/client";

export type ActionState = {
  errors?: {
    title?: string;
    content?: string;
    category?: string;
    status?: string;
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

  const titleRaw = formData.get("title");
  const contentRaw = formData.get("content");
  const categoryRaw = formData.get("category");
  const statusRaw = formData.get("status");

  const data = {
    title: typeof titleRaw === "string" ? titleRaw.trim() : "",
    content: typeof contentRaw === "string" ? contentRaw.trim() : "",
    category: typeof categoryRaw === "string" ? categoryRaw : "",
    status: typeof statusRaw === "string" ? statusRaw : "",
  };

  const errors = validatePost(data);
  if (errors) return { errors };

  const post = await prisma.post.create({
    data: {
      title: data.title.slice(0, 100),
      content: data.content.slice(0, 5000),
      category: data.category as PostCategory,
      status: data.status as PostStatus,
      authorId: session.user.id,
    },
  });

  redirect(`/posts/${post.id}`);
}

// ─── 수정 ────────────────────────────────────

export async function updatePost(
  id: string,
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
  const categoryRaw = formData.get("category");
  const statusRaw = formData.get("status");

  const data = {
    title: typeof titleRaw === "string" ? titleRaw.trim() : "",
    content: typeof contentRaw === "string" ? contentRaw.trim() : "",
    category: typeof categoryRaw === "string" ? categoryRaw : "",
    status: typeof statusRaw === "string" ? statusRaw : "",
  };

  const errors = validatePost(data);
  if (errors) return { errors };

  await prisma.post.update({
    where: { id },
    data: {
      title: data.title.slice(0, 100),
      content: data.content.slice(0, 5000),
      category: data.category as PostCategory,
      status: data.status as PostStatus,
    },
  });

  redirect(`/posts/${id}`);
}

// ─── 삭제 ────────────────────────────────────

export async function deletePost(id: string): Promise<ActionState> {
  const session = await auth();
  if (!session) redirect("/login");

  const post = await prisma.post.findUnique({ where: { id, deletedAt: null } });
  if (!post) return { errors: { general: "게시글을 찾을 수 없습니다." } };
  if (post.authorId !== session.user.id) return { errors: { general: "삭제 권한이 없습니다." } };

  await prisma.post.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  redirect("/posts");
}
