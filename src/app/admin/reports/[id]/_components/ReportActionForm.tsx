"use client";

import { useActionState } from "react";
import { ReportStatus } from "@prisma/client";
import type { AdminActionState } from "@/lib/actions/admin";

const STATUS_LABEL: Record<ReportStatus, string> = {
  PENDING: "대기중",
  REVIEWING: "검토중",
  RESOLVED: "처리완료",
  REJECTED: "반려",
};

type Props = {
  action: (_prev: AdminActionState, formData: FormData) => Promise<AdminActionState>;
  currentStatus: ReportStatus;
};

export default function ReportActionForm({ action, currentStatus }: Props) {
  const [state, formAction, isPending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && (
        <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{state.error}</p>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">상태 변경</label>
        <select
          name="status"
          defaultValue={currentStatus}
          className="w-full border border-border-base rounded-lg px-3 py-2 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary-base"
        >
          {Object.values(ReportStatus).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          처리 메모 <span className="text-muted-foreground font-normal">(선택)</span>
        </label>
        <textarea
          name="note"
          rows={3}
          maxLength={500}
          placeholder="처리 사유나 메모를 남겨주세요."
          className="w-full border border-border-base rounded-lg px-3 py-2 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary-base resize-none"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="bg-primary-base text-primary-foreground px-4 py-2 rounded-lg text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isPending ? "저장 중..." : "처리 저장"}
        </button>
      </div>
    </form>
  );
}
