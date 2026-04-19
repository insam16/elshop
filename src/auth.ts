import NextAuth from "next-auth";
import Naver, { NaverProfile } from "next-auth/providers/naver";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { withHashedNaverId } from "@/lib/hashed-adapter";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: withHashedNaverId(PrismaAdapter(prisma)),
  providers: [
    Naver({
      clientId: process.env.AUTH_NAVER_ID!,
      clientSecret: process.env.AUTH_NAVER_SECRET!,
      profile(profile: NaverProfile) {
        return {
          id: profile.response.id,
          name: profile.response.name,
          email: profile.response.email,
          image: profile.response.profile_image,
          nickname: profile.response.nickname,
        };
      },
    }),
  ],
  session: { strategy: "database" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      session.user.publicId = user.publicId ?? "";
      session.user.role = (user.role ?? "USER") as "USER" | "ADMIN";
      session.user.nickname = user.nickname ?? null;
      return session;
    },
  },
});
