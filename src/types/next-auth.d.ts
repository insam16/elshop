import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      publicId: string;
      role: "USER" | "ADMIN";
      nickname: string | null;
    };
  }

  interface User {
    publicId?: string;
    role?: "USER" | "ADMIN";
    nickname?: string | null;
  }
}