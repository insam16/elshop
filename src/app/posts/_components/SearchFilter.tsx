"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CATEGORY_LABEL, STATUS_LABEL } from "@/lib/validators/post";
import { PostCategory, PostStatus } from "@prisma/client";

export default function SearchFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentQ = searchParams.get("q") ?? "";
  const currentBoard = searchParams.get("board") ?? "";
  const currentCategory = searchParams.get("category") ?? "";
  const currentStatus = searchParams.get("status") ?? "";

  const [query, setQuery] = useState(currentQ);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    setQuery(currentQ);
  }, [currentQ]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      push({ q: query.trim().replace(/\s+/g, " "), category: currentCategory, status: currentStatus });
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function push(params: { q: string; category: string; status: string }) {
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (currentBoard) qs.set("board", currentBoard);
    if (params.category) qs.set("category", params.category);
    if (params.status) qs.set("status", params.status);
    router.push(`/posts${qs.size ? `?${qs}` : ""}`);
  }

  function toggleCategory(value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    push({
      q: query,
      category: currentCategory === value ? "" : value,
      status: currentStatus,
    });
  }

  function toggleStatus(value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    push({
      q: query,
      category: currentCategory,
      status: currentStatus === value ? "" : value,
    });
  }

  return (
    <div className="flex flex-col gap-3 mb-5">
      {/* 검색창 */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="제목 또는 내용 검색"
        maxLength={20}
        className="input transition-all"
      />

      {/* 거래상태 필터 */}
      <div className="flex gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground self-center">상태</span>
        {Object.values(PostStatus).map((s) => (
          <FilterChip
            key={s}
            label={STATUS_LABEL[s]}
            active={currentStatus === s}
            onClick={() => toggleStatus(s)}
          />
        ))}
      </div>

      {/* 거래종류 필터 */}
      <div className="flex gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground self-center">종류</span>
        {Object.values(PostCategory).map((c) => (
          <FilterChip
            key={c}
            label={CATEGORY_LABEL[c]}
            active={currentCategory === c}
            onClick={() => toggleCategory(c)}
          />
        ))}
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs px-3 py-1 rounded-full border transition-colors ${active
          ? "bg-primary-base text-primary-foreground border-primary-base"
          : "bg-card text-muted-foreground border-border-base hover:border-primary-base"
        }`}
    >
      {label}
    </button>
  );
}
