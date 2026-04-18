import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { createPost } from "@/lib/actions/post";
import PostForm from "../_components/PostForm";

export default async function NewPostPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-6">거래 글 작성</h1>
      <PostForm action={createPost} />
    </div>
  );
}
