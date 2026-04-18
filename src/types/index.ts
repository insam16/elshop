export type PostCategory = "판매" | "구매" | "교환";

export type Post = {
  id: number;
  title: string;
  content: string;
  category: PostCategory;
  author: string;
  createdAt: string;
};

export type Report = {
  id: number;
  postId: number;
  reporter: string;
  reason: string;
  status: "대기중" | "처리완료" | "반려";
  createdAt: string;
};
