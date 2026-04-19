"use client";

import { useTransition, useState } from "react";
import { anonymizeExpiredUsers } from "@/lib/actions/admin";

export default function AnonymizeButton() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  function handleClick() {
    if (!confirm("보존 기간이 만료된 탈퇴 유저의 개인정보를 즉시 익명화합니다. 진행할까요?")) return;
    startTransition(async () => {
      const res = await anonymizeExpiredUsers();
      setResult(res.error ? `오류: ${res.error}` : `${res.count}명 익명화 완료`);
    });
  }

  return (
    <div className="flex items-center gap-3">
      {result && <span className="text-sm text-muted-foreground">{result}</span>}
      <button
        onClick={handleClick}
        disabled={isPending}
        className="text-sm border border-border-base px-3 py-1.5 rounded hover:bg-muted disabled:opacity-50 transition-colors"
      >
        {isPending ? "처리 중..." : "만료 데이터 정리"}
      </button>
    </div>
  );
}
