"use client";

import { useActionState, useState } from "react";
import { banUser, unbanUser, type AdminActionState } from "@/lib/actions/admin";

type Props = {
  userId: string;
  isBanned: boolean;
  bannedUntil: Date | null;
  returnPath: string;
};

const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
};

export default function UserBanSection({ userId, isBanned, bannedUntil, returnPath }: Props) {
  const [banType, setBanType] = useState<"temporary" | "permanent">("temporary");
  const [banState, banAction, isBanPending] = useActionState<AdminActionState, FormData>(banUser, {});
  const [unbanState, unbanAction, isUnbanPending] = useActionState<AdminActionState, FormData>(unbanUser, {});

  const isPermanent = bannedUntil && bannedUntil.getFullYear() >= 9999;

  return (
    <div className="flex flex-col gap-4">
      {/* 현재 제재 상태 */}
      {isBanned && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${isPermanent ? "bg-red-600" : "bg-amber-500"}`}>
            {isPermanent ? "영구 차단" : "이용 제한"}
          </span>
          {!isPermanent && bannedUntil && (
            <span className="text-red-700">{bannedUntil.toLocaleDateString("ko-KR")}까지</span>
          )}
        </div>
      )}

      {/* 제재 해제 폼 */}
      {isBanned && (
        <form action={unbanAction} className="flex flex-col gap-3">
          <input type="hidden" name="userId" value={userId} />
          <input type="hidden" name="returnPath" value={returnPath} />
          {unbanState.error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{unbanState.error}</p>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">
              해제 메모 <span className="text-muted-foreground font-normal">(선택)</span>
            </label>
            <textarea
              name="note"
              rows={2}
              maxLength={500}
              placeholder="제재 해제 사유를 남겨주세요."
              className="w-full border border-border-base rounded-lg px-3 py-2 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary-base resize-none"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isUnbanPending}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {isUnbanPending ? "처리 중..." : "제재 해제"}
            </button>
          </div>
        </form>
      )}

      {/* 제재 부과 폼 */}
      {!isBanned && (
        <form action={banAction} className="flex flex-col gap-3">
          <input type="hidden" name="userId" value={userId} />
          <input type="hidden" name="returnPath" value={returnPath} />
          <input type="hidden" name="type" value={banType} />

          {banState.error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{banState.error}</p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setBanType("temporary")}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${banType === "temporary" ? "bg-amber-500 text-white border-amber-500" : "border-border-base hover:bg-muted"}`}
            >
              기간 제한
            </button>
            <button
              type="button"
              onClick={() => setBanType("permanent")}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${banType === "permanent" ? "bg-red-600 text-white border-red-600" : "border-border-base hover:bg-muted"}`}
            >
              영구 차단
            </button>
          </div>

          {banType === "temporary" && (
            <div>
              <label className="block text-sm font-medium mb-1">제한 만료일</label>
              <input
                type="date"
                name="bannedUntil"
                min={tomorrow()}
                required
                className="border border-border-base rounded-lg px-3 py-2 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary-base"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">
              제재 메모 <span className="text-muted-foreground font-normal">(선택)</span>
            </label>
            <textarea
              name="note"
              rows={2}
              maxLength={500}
              placeholder="제재 사유를 남겨주세요."
              className="w-full border border-border-base rounded-lg px-3 py-2 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary-base resize-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isBanPending}
              className={`text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50 transition-colors ${banType === "permanent" ? "bg-red-600 hover:bg-red-700" : "bg-amber-500 hover:bg-amber-600"}`}
            >
              {isBanPending ? "처리 중..." : banType === "permanent" ? "영구 차단" : "기간 제한"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
