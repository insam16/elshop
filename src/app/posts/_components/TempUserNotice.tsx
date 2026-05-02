"use client";

import { useEffect } from "react";

const STORAGE_KEY = "temp_notice_shown";

export default function TempUserNotice() {
  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    sessionStorage.setItem(STORAGE_KEY, "1");
    alert(
      "인증대기 계정 이용 안내\n\n" +
      "• 게시글 작성: 하루 1회\n" +
      "• 댓글 작성: 하루 3회\n\n" +
      "본캐 인증 후 제한 없이 서비스를 이용할 수 있습니다.\n" +
      "(우측 상단 인증대기#0000 클릭 → 본캐 인증)"
    );
  }, []);

  return null;
}
