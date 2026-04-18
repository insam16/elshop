import { PostCategory, PostStatus } from "@prisma/client";

export type PostFormData = {
  title: string;
  content: string;
  category: string;
  status: string;
};

export type PostValidationError = {
  title?: string;
  content?: string;
  category?: string;
  status?: string;
};

export function validatePost(data: PostFormData): PostValidationError | null {
  const errors: PostValidationError = {};

  if (!data.title.trim()) {
    errors.title = "제목을 입력해주세요.";
  } else if (data.title.trim().length > 100) {
    errors.title = "제목은 100자 이내로 입력해주세요.";
  }

  if (!data.content.trim()) {
    errors.content = "내용을 입력해주세요.";
  } else if (data.content.trim().length > 5000) {
    errors.content = "내용은 5000자 이내로 입력해주세요.";
  }

  if (!Object.values(PostCategory).includes(data.category as PostCategory)) {
    errors.category = "올바른 거래 종류를 선택해주세요.";
  }

  if (!Object.values(PostStatus).includes(data.status as PostStatus)) {
    errors.status = "올바른 거래 상태를 선택해주세요.";
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

export const CATEGORY_LABEL: Record<PostCategory, string> = {
  SELL: "판매",
  BUY: "구매",
  TRADE: "교환",
};

export const STATUS_LABEL: Record<PostStatus, string> = {
  OPEN: "거래 가능",
  RESERVED: "예약 중",
  COMPLETED: "거래 완료",
};
