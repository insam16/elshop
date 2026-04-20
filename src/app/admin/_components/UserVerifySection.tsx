"use client";

import { useActionState } from "react";
import { approveUser, rejectUser, type AdminActionState } from "@/lib/actions/admin";

type Props = {
  userId: string;
  returnPath: string;
  rejectCount: number; // 이전 거절 횟수
};

export default function UserVerifySection({ userId, returnPath, rejectCount }: Props) {
  const [approveState, approveAction, isApprovePending] = useActionState<AdminActionState, FormData>(approveUser, {});
  const [rejectState, rejectAction, isRejectPending] = useActionState<AdminActionState, FormData>(rejectUser, {});

  return (
    <div className="flex flex-col gap-4">
      {rejectCount > 0 && (
        <p className="text-xs text-amber-600">이전 거절 {rejectCount}회</p>
      )}

      {/* 승인 폼 */}
      <form action={approveAction} className="flex flex-col gap-3">
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="returnPath" value={returnPath} />
        {approveState.error && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{approveState.error}</p>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">캐릭터명 (구글 시트 확인 후 입력)</label>
          <input
            type="text"
            name="characterName"
            maxLength={20}
            placeholder="인게임 캐릭터명"
            className="w-full border border-border-base rounded-lg px-3 py-2 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary-base"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isApprovePending}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {isApprovePending ? "처리 중..." : "승인"}
          </button>
        </div>
      </form>

      {/* 거절 폼 */}
      <form action={rejectAction} className="flex flex-col gap-3 border-t border-border-base pt-4">
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="returnPath" value={returnPath} />
        {rejectState.error && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{rejectState.error}</p>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">
            거절 사유 <span className="text-muted-foreground font-normal">(선택)</span>
          </label>
          <textarea
            name="note"
            rows={2}
            maxLength={200}
            placeholder="스크린샷 불명확, 코드 미표시 등"
            className="w-full border border-border-base rounded-lg px-3 py-2 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary-base resize-none"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isRejectPending}
            className="border border-red-300 text-red-500 px-4 py-2 rounded-lg text-sm hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            {isRejectPending ? "처리 중..." : "거절"}
          </button>
        </div>
      </form>
    </div>
  );
}
