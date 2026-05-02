import { PostBoard, PostCategory, PostStatus } from "@prisma/client";

export type PostFormData = {
  title: string;
  content: string;
  board: string;
  category: string;
  status: string;
  negotiable: string;
  tradeMethod: string;
  characterName: string;
  contact: string;
};

export type PostValidationError = {
  title?: string;
  content?: string;
  board?: string;
  category?: string;
  status?: string;
  negotiable?: string;
  tradeMethod?: string;
  characterName?: string;
  contact?: string;
};

// 한글=2, 나머지=1
function gameLength(str: string): number {
  return [...str].reduce((sum, ch) => sum + (/[가-힣]/.test(ch) ? 2 : 1), 0);
}

export function validateCharacterName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "캐릭터명을 입력해주세요.";

  const atIdx = trimmed.indexOf("@");
  if (atIdx !== -1) {
    if (trimmed.indexOf("@", atIdx + 1) !== -1) return "@ 기호는 한 번만 사용할 수 있습니다.";
    if (atIdx !== trimmed.length - 2) return "@뒤에는 S 또는 G만 올 수 있습니다.";
    const suffix = trimmed[atIdx + 1];
    if (suffix !== "S" && suffix !== "G") return "@뒤에는 S 또는 G만 올 수 있습니다.";
  }

  const namePart = atIdx !== -1 ? trimmed.slice(0, atIdx) : trimmed;
  if (!/^[a-zA-Z0-9가-힣]+$/.test(namePart)) {
    return "캐릭터명은 한글, 영문, 숫자만 사용할 수 있습니다.";
  }

  const nameLen = gameLength(namePart);
  if (nameLen < 1) return "캐릭터명을 입력해주세요.";
  if (nameLen > 12) return "캐릭터명(@앞)은 최대 12 길이(한글=2)입니다.";

  return null;
}

export const TRADE_METHODS: Record<PostBoard, string[]> = {
  CREDIT: ["ITEM_CHECK_PAY_TRADE", "GUILD_JOIN_PAY_TRADE_LEAVE", "OTHER"],
  ED: ["ED_CHECK_PAY_TRADE", "MAIL", "BOARD", "OTHER"],
  GENERAL: ["DIRECT", "BOARD", "OTHER"],
  OTHER: ["GUILD_MASTER", "SCREEN_SHARE", "OTHER"],
};

export const TRADE_METHOD_LABEL: Record<string, string> = {
  ITEM_CHECK_PAY_TRADE: "아이템 확인 - 입금 - 거래",
  GUILD_JOIN_PAY_TRADE_LEAVE: "길드 가입 - 입금 - 거래 - 길드 탈퇴",
  ED_CHECK_PAY_TRADE: "ED 확인 - 입금 - 거래",
  MAIL: "우편",
  BOARD: "게시판",
  DIRECT: "개인거래",
  GUILD_MASTER: "입금 - 길드 마스터 위임",
  SCREEN_SHARE: "화면 공유로 닉네임 확인 - 입금 - 닉네임 삭제 - 닉네임 취득",
  OTHER: "기타 (기타 사항에 입력)",
};

export const DEFAULT_TRADE_METHOD: Record<PostBoard, string> = {
  CREDIT: "ITEM_CHECK_PAY_TRADE",
  ED: "ED_CHECK_PAY_TRADE",
  GENERAL: "DIRECT",
  OTHER: "GUILD_MASTER",
};

export const ALLOWED_CATEGORIES: Record<PostBoard, PostCategory[]> = {
  CREDIT: ["SELL", "BUY"],
  ED: ["SELL", "BUY"],
  GENERAL: ["SELL", "BUY", "TRADE"],
  OTHER: ["SELL", "BUY"],
};

export function validatePost(data: PostFormData): PostValidationError | null {
  const errors: PostValidationError = {};

  if (!data.title.trim()) {
    errors.title = "아이템명/가격/수량을 입력해주세요.";
  } else if (gameLength(data.title.trim()) > 256) {
    errors.title = "256 길이를 초과했습니다.";
  }

  if (data.content?.trim() && gameLength(data.content.trim()) > 256) {
    errors.content = "기타 사항은 256 길이를 초과할 수 없습니다.";
  }

  if (!Object.values(PostBoard).includes(data.board as PostBoard)) {
    errors.board = "올바른 게시판을 선택해주세요.";
    return errors;
  }

  const board = data.board as PostBoard;

  if (!Object.values(PostCategory).includes(data.category as PostCategory)) {
    errors.category = "올바른 거래 종류를 선택해주세요.";
  } else if (!ALLOWED_CATEGORIES[board].includes(data.category as PostCategory)) {
    errors.category = "이 게시판에서는 선택할 수 없는 거래 종류입니다.";
  }

  if (!Object.values(PostStatus).includes(data.status as PostStatus)) {
    errors.status = "올바른 거래 상태를 선택해주세요.";
  }

  if (data.negotiable !== "true" && data.negotiable !== "false") {
    errors.negotiable = "흥정 여부를 선택해주세요.";
  }

  if (!TRADE_METHODS[board].includes(data.tradeMethod)) {
    errors.tradeMethod = "올바른 거래방식을 선택해주세요.";
  }

  if (data.characterName) {
    const charErr = validateCharacterName(data.characterName);
    if (charErr) errors.characterName = charErr;
  }

  if (!data.contact.trim()) {
    errors.contact = "연락처를 입력해주세요.";
  } else if (!data.contact.trim().startsWith("https://open.kakao.com/")) {
    errors.contact = "카카오톡 오픈채팅 링크(https://open.kakao.com/...)만 입력할 수 있습니다.";
  } else if (data.contact.trim().length > 200) {
    errors.contact = "연락처는 200자 이내로 입력해주세요.";
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

export const BOARD_LABEL: Record<PostBoard, string> = {
  CREDIT: "신용",
  ED: "ED",
  GENERAL: "일반",
  OTHER: "기타",
};

export const BOARD_DESC: Record<PostBoard, string> = {
  CREDIT: "아이템-현금",
  ED: "ED-현금",
  GENERAL: "아이템-ED",
  OTHER: "기타",
};

export const CATEGORY_LABEL: Record<PostCategory, string> = {
  SELL: "팝니다",
  BUY: "삽니다",
  TRADE: "교환",
};

export const STATUS_LABEL: Record<PostStatus, string> = {
  ACTIVE: "거래 가능",
  RESERVED: "예약",
  COMPLETED: "거래 완료",
  EXPIRED: "만료됨",
};

export const CATEGORY_BADGE: Record<PostCategory, string> = {
  SELL: "bg-red-400 text-white",
  BUY: "bg-sky-500 text-white",
  TRADE: "bg-violet-500 text-white",
};

export const STATUS_BADGE: Record<PostStatus, string> = {
  ACTIVE: "bg-teal-500 text-white",
  RESERVED: "bg-amber-500 text-white",
  COMPLETED: "bg-gray-400 text-white",
  EXPIRED: "bg-gray-300 text-gray-600",
};
