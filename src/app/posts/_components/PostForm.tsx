"use client";

import { useState } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import type { ActionState } from "@/lib/actions/post";
import {
  BOARD_LABEL,
  BOARD_DESC,
  CATEGORY_LABEL,
  STATUS_LABEL,
  TRADE_METHODS,
  TRADE_METHOD_LABEL,
  DEFAULT_TRADE_METHOD,
  ALLOWED_CATEGORIES,
} from "@/lib/validators/post";
import { PostBoard, PostCategory, PostStatus } from "@prisma/client";

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: {
    title?: string;
    content?: string | null;
    board?: PostBoard;
    category?: PostCategory;
    status?: PostStatus;
    negotiable?: boolean;
    tradeMethod?: string;
    characterName?: string | null;
  };
  hideStatus?: boolean;
  submitLabel?: string;
};

export default function PostForm({ action, defaultValues, hideStatus = false, submitLabel = "작성 완료" }: Props) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, {});

  const initBoard = defaultValues?.board ?? "GENERAL";
  const initCategory = defaultValues?.category ?? "SELL";
  const initTradeMethod = defaultValues?.tradeMethod ?? DEFAULT_TRADE_METHOD[initBoard];

  const [selectedBoard, setSelectedBoard] = useState<PostBoard>(initBoard);
  const [selectedCategory, setSelectedCategory] = useState<PostCategory>(initCategory);
  const [selectedTradeMethod, setSelectedTradeMethod] = useState<string>(initTradeMethod);

  function handleBoardChange(newBoard: PostBoard) {
    setSelectedBoard(newBoard);
    const allowed = ALLOWED_CATEGORIES[newBoard];
    if (!allowed.includes(selectedCategory)) setSelectedCategory("SELL");
    setSelectedTradeMethod(DEFAULT_TRADE_METHOD[newBoard]);
  }

  const itemLabel = selectedBoard === "ED" ? "ED비율 가격 수량" : "아이템명 가격 수량";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {/* 작성 주의 문구 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-xs text-yellow-800 flex flex-col gap-1">
        <p className="font-semibold">게시글 작성 전 꼭 확인해주세요</p>
        <ul className="list-disc pl-4 flex flex-col gap-0.5">
          <li>계좌번호, 전화번호 등 개인정보를 직접 노출하지 마세요.</li>
          <li>허위 정보 게시 시 제재를 받을 수 있습니다.</li>
        </ul>
      </div>

      <div className="card flex flex-col gap-5">
        {state.errors?.general && (
          <p className="form-error">
            {state.errors.general}
          </p>
        )}

        {/* 게시판 */}
        <div>
          <label className="label">게시판</label>
          <select
            name="board"
            value={selectedBoard}
            onChange={(e) => handleBoardChange(e.target.value as PostBoard)}
            className="w-full bg-card border border-border-base rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-base transition-all"
          >
            {Object.values(PostBoard).map((b) => (
              <option key={b} value={b}>
                {BOARD_LABEL[b]} ({BOARD_DESC[b]})
              </option>
            ))}
          </select>
          {state.errors?.board && (
            <p className="field-error">{state.errors.board}</p>
          )}
        </div>

        {/* 거래 상태 */}
        {hideStatus ? (
          <input type="hidden" name="status" value="OPEN" />
        ) : (
          <div>
            <label className="label">거래 상태</label>
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
              <p className="field-error">{state.errors.status}</p>
            )}
          </div>
        )}

        {/* 거래 종류 */}
        <div>
          <label className="block text-sm font-medium mb-2">거래 종류</label>
          <input type="hidden" name="category" value={selectedCategory} />
          <div className="flex gap-4">
            {ALLOWED_CATEGORIES[selectedBoard].map((c) => (
              <label key={c} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="_category_display"
                  value={c}
                  checked={selectedCategory === c}
                  onChange={() => setSelectedCategory(c)}
                  className="accent-primary-base"
                />
                <span className="text-sm">{CATEGORY_LABEL[c]}</span>
              </label>
            ))}
          </div>
          {state.errors?.category && (
            <p className="field-error">{state.errors.category}</p>
          )}
        </div>

        {/* 아이템명 가격 수량 */}
        <div>
          <label className="label">{itemLabel}</label>
          <input
            type="text"
            name="title"
            defaultValue={defaultValues?.title}
            maxLength={256}
            placeholder={`${itemLabel}을 입력하세요`}
            className="w-full bg-card border border-border-base rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-base transition-all"
          />
          {state.errors?.title && (
            <p className="field-error">{state.errors.title}</p>
          )}
        </div>

        {/* 흥정 */}
        <div>
          <label className="block text-sm font-medium mb-2">흥정</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="negotiable"
                value="true"
                defaultChecked={defaultValues?.negotiable === true}
                className="accent-primary-base"
              />
              <span className="text-sm">O</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="negotiable"
                value="false"
                defaultChecked={defaultValues?.negotiable !== true}
                className="accent-primary-base"
              />
              <span className="text-sm">X</span>
            </label>
          </div>
          {state.errors?.negotiable && (
            <p className="field-error">{state.errors.negotiable}</p>
          )}
        </div>

        {/* 거래방식 */}
        <div>
          <label className="block text-sm font-medium mb-2">거래방식 및 거래순서</label>
          <input type="hidden" name="tradeMethod" value={selectedTradeMethod} />
          <div className="flex flex-col gap-2">
            {TRADE_METHODS[selectedBoard].map((m) => (
              <label key={m} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="_tradeMethod_display"
                  value={m}
                  checked={selectedTradeMethod === m}
                  onChange={() => setSelectedTradeMethod(m)}
                  className="accent-primary-base shrink-0"
                />
                <span className="text-sm">{TRADE_METHOD_LABEL[m]}</span>
              </label>
            ))}
          </div>
          {state.errors?.tradeMethod && (
            <p className="field-error">{state.errors.tradeMethod}</p>
          )}
        </div>

        {/* 거래자 캐릭터명 */}
        <div>
          <label className="label">거래자 캐릭터명 <span className="text-muted-foreground font-normal">(선택)</span></label>
          <input
            type="text"
            name="characterName"
            defaultValue={defaultValues?.characterName ?? ""}
            maxLength={20}
            placeholder="예) 엘소드@S"
            className="w-full bg-card border border-border-base rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-base transition-all"
          />
          <p className="text-xs text-muted-foreground mt-1">
            서버 구분자 포함 가능 (예: 닉네임@S, 닉네임@G)
          </p>
          {state.errors?.characterName && (
            <p className="field-error">{state.errors.characterName}</p>
          )}
        </div>

        {/* 기타 사항 (선택) */}
        <div>
          <label className="label">
            기타 사항 <span className="text-muted-foreground font-normal">(선택)</span>
          </label>
          <textarea
            name="content"
            defaultValue={defaultValues?.content ?? ""}
            rows={4}
            maxLength={256}
            placeholder="추가 안내 사항을 입력하세요"
            className="w-full bg-card border border-border-base rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-base resize-none transition-all"
          />
          {state.errors?.content && (
            <p className="field-error">{state.errors.content}</p>
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
