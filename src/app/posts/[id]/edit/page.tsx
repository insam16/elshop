import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updatePost } from "@/lib/actions/post";
import PostForm from "../../_components/PostForm";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (isNaN(id)) notFound();
  const [post, session] = await Promise.all([
    prisma.post.findUnique({ where: { id, deletedAt: null } }),
    auth(),
  ]);

  if (!post) notFound();
  if (!session) redirect("/login");
  if (post.authorId !== session.user.id) redirect(`/posts/${id}`);

  const action = updatePost.bind(null, id);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-6">게시글 수정</h1>
      <PostForm
        action={action}
        defaultValues={{
          title: post.title,
          content: post.content,
          category: post.category,
          status: post.status,
        }}
        submitLabel="수정 완료"
      />
    </div>
  );
}
