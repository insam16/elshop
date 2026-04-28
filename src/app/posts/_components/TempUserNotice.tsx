"use client";

import { useEffect } from "react";

const STORAGE_KEY = "temp_notice_shown";

export default function TempUserNotice() {
  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    sessionStorage.setItem(STORAGE_KEY, "1");
    alert(
      "비인증 계정 이용 안내\n\n" +
      "• 게시글 작성: 하루 1회\n" +
      "• 작성된 게시글은 일반 게시글 하단에 표시되며 24시간 후 자동 삭제됩니다.\n" +
      "• 댓글 작성: 하루 2회\n\n" +
      "본캐 인증 후 제한 없이 이용할 수 있습니다.\n" +
      "(우상단 인증대기#0000 클릭 → 본캐 인증)"
    );
  }, []);

  return null;
}
