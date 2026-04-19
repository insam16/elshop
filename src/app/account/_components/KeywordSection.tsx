"use client";

import { useActionState, useTransition, useRef } from "react";
import { addKeyword, deleteKeyword, toggleKeyword, type KeywordState } from "@/lib/actions/keyword";

type Keyword = {
  id: string;
  keyword: string;
  isEnabled: boolean;
};

const MAX_KEYWORDS = 10;

export default function KeywordSection({ keywords }: { keywords: Keyword[] }) {
  const [state, formAction, isPending] = useActionState<KeywordState, FormData>(addKeyword, {});
  const formRef = useRef<HTMLFormElement>(null);

  if (!state.error && !isPending) formRef.current?.reset();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">키워드 알림</p>
        <span className="text-xs text-muted-foreground">{keywords.length}/{MAX_KEYWORDS}</span>
      </div>
      <p className="text-xs text-muted-foreground">
        등록한 키워드가 포함된 새 게시글이 올라오면 알림을 받습니다.
      </p>

      {/* 키워드 목록 */}
      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {keywords.map((kw) => (
            <KeywordChip key={kw.id} keyword={kw} />
          ))}
        </div>
      )}

      {/* 추가 폼 */}
      {keywords.length < MAX_KEYWORDS && (
        <form ref={formRef} action={formAction} className="flex gap-2">
          <input
            name="keyword"
            type="text"
            maxLength={20}
            placeholder="키워드 입력 (2~20자)"
            className="flex-1 border border-border-base rounded-lg px-3 py-1.5 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary-base"
          />
          <button
            type="submit"
            disabled={isPending}
            className="bg-primary-base text-primary-foreground px-3 py-1.5 rounded-lg text-sm hover:opacity-90 disabled:opacity-50 transition-opacity shrink-0"
          >
            추가
          </button>
        </form>
      )}
      {state.error && <p className="text-xs text-red-500">{state.error}</p>}
    </div>
  );
}

function KeywordChip({ keyword }: { keyword: Keyword }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div
      className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs transition-opacity ${
        isPending ? "opacity-40" : ""
      } ${
        keyword.isEnabled
          ? "bg-primary-base/10 border-primary-base/30 text-primary-base"
          : "bg-muted border-border-base text-muted-foreground line-through"
      }`}
    >
      <button
        onClick={() => startTransition(async () => { await toggleKeyword(keyword.id); })}
        className="hover:opacity-70 transition-opacity"
        title={keyword.isEnabled ? "비활성화" : "활성화"}
      >
        {keyword.keyword}
      </button>
      <button
        onClick={() => {
          if (!confirm(`"${keyword.keyword}" 키워드를 삭제할까요?`)) return;
          startTransition(async () => { await deleteKeyword(keyword.id); });
        }}
        className="ml-0.5 hover:text-red-500 transition-colors"
        title="삭제"
      >
        ×
      </button>
    </div>
  );
}
