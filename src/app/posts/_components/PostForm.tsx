"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import type { ActionState } from "@/lib/actions/post";
import { CATEGORY_LABEL, STATUS_LABEL } from "@/lib/validators/post";
import { PostCategory, PostStatus } from "@prisma/client";

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: {
    title?: string;
    content?: string;
    category?: PostCategory;
    status?: PostStatus;
  };
  submitLabel?: string;
};

export default function PostForm({ action, defaultValues, submitLabel = "작성 완료" }: Props) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {/* 작성 주의 문구 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-xs text-yellow-800 flex flex-col gap-1">
        <p className="font-semibold">게시글 작성 전 꼭 확인해주세요</p>
        <ul className="list-disc pl-4 flex flex-col gap-0.5">
          <li>계좌번호, 전화번호 등 개인정보를 직접 노출하지 마세요.</li>
          <li>현금 선입금 요구는 사기일 수 있습니다. 안전거래를 이용하세요.</li>
          <li>허위 정보 게시 시 제재를 받을 수 있습니다.</li>
        </ul>
      </div>

      <div className="bg-card border border-border-base rounded-xl p-6 flex flex-col gap-4">
      {state.errors?.general && (
        <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
          {state.errors.general}
        </p>
      )}

      {/* 거래 종류 */}
      <div>
        <label className="block text-sm font-medium mb-1">거래 종류</label>
        <select
          name="category"
          defaultValue={defaultValues?.category ?? "SELL"}
          className="w-full bg-card border border-border-base rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-base transition-all"
        >
          {Object.values(PostCategory).map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABEL[c]}
            </option>
          ))}
        </select>
        {state.errors?.category && (
          <p className="text-xs text-red-500 mt-1">{state.errors.category}</p>
        )}
      </div>

      {/* 거래 상태 */}
      <div>
        <label className="block text-sm font-medium mb-1">거래 상태</label>
        <select
          name="status"
          defaultValue={defaultValues?.status ?? "OPEN"}
          className="w-full bg-card border border-border-base rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-base transition-all"
        >
          {Object.values(PostStatus).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        {state.errors?.status && (
          <p className="text-xs text-red-500 mt-1">{state.errors.status}</p>
        )}
      </div>

      {/* 제목 */}
      <div>
        <label className="block text-sm font-medium mb-1">제목</label>
        <input
          type="text"
          name="title"
          defaultValue={defaultValues?.title}
          maxLength={100}
          placeholder="제목을 입력하세요"
          className="w-full bg-card border border-border-base rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-base transition-all"
        />
        {state.errors?.title && (
          <p className="text-xs text-red-500 mt-1">{state.errors.title}</p>
        )}
      </div>

      {/* 내용 */}
      <div>
        <label className="block text-sm font-medium mb-1">내용</label>
        <textarea
          name="content"
          defaultValue={defaultValues?.content}
          rows={6}
          maxLength={5000}
          placeholder="아이템 설명, 가격, 거래 방법 등을 적어주세요"
          className="w-full bg-card border border-border-base rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-base resize-none transition-all"
        />
        {state.errors?.content && (
          <p className="text-xs text-red-500 mt-1">{state.errors.content}</p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="bg-primary-base text-primary-foreground px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending ? "저장 중..." : submitLabel}
        </button>
      </div>
      </div>
    </form>
  );
}
