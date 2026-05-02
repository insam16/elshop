export type Notice = {
  id: number;
  date: string;
  title: string;
  href: string;
  external: boolean;
  important: boolean;
  showInBanner: boolean;
};

export const notices: Notice[] = [
  {
    id: 3,
    date: "2026.05.02",
    title: "업데이트 v1.6 — 연락하기",
    href: "/notice/3",
    external: false,
    important: true,
    showInBanner: true,
  },
  {
    id: 2,
    date: "2026.04.29",
    title: "사기 예방 가이드",
    href: "/notice/2",
    external: false,
    important: true,
    showInBanner: true,
  },
  {
    id: 1,
    date: "2026.04.28",
    title: "엘샵 오픈 안내드립니다",
    href: "/notice/1",
    external: false,
    important: false,
    showInBanner: false,
  },
];
