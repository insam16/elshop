import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "USER" | "ADMIN";
      nickname: string | null;
    };
  }

  interface User {
    role?: "USER" | "ADMIN";
    nickname?: string | null;
  }
}