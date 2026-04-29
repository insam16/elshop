"use client";

import { useTransition } from "react";
import { changeUserRetention } from "@/lib/actions/admin";

export default function ChangeRetentionButton({
  userId,
  currentYears,
}: {
  userId: string;
  currentYears: 1 | 3 | null;
}) {
  const [isPending, startTransition] = useTransition();

  function handleChange(years: 1 | 3) {
    if (!confirm(`데이터 보관 기간을 탈퇴일 기준 ${years}년으로 변경합니다. 진행할까요?`)) return;
    startTransition(async () => {
      const res = await changeUserRetention(userId, years);
      if (res.error) alert(res.error);
    });
  }

  return (
    <div className="flex gap-1">
      <button
        onClick={() => handleChange(1)}
        disabled={isPending || currentYears === 1}
        className={`text-xs px-2.5 py-1 rounded border transition-colors disabled:opacity-50 ${
          currentYears === 1
            ? "border-border-base bg-muted text-muted-foreground cursor-default"
            : "border-blue-300 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
        }`}
      >
        1년
      </button>
      <button
        onClick={() => handleChange(3)}
        disabled={isPending || currentYears === 3}
        className={`text-xs px-2.5 py-1 rounded border transition-colors disabled:opacity-50 ${
          currentYears === 3
            ? "border-border-base bg-muted text-muted-foreground cursor-default"
            : "border-amber-300 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30"
        }`}
      >
        3년
      </button>
    </div>
  );
}
