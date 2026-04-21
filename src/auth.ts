import NextAuth from "next-auth";
import Naver, { NaverProfile } from "next-auth/providers/naver";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { withHashedNaverId } from "@/lib/hashed-adapter";

// birthyear: "YYYY", birthday: "MM-DD" (Naver format)
function isUnder19(birthyear: string, birthday?: string | null): boolean {
  const today = new Date();
  const year = parseInt(birthyear, 10);
  if (birthday) {
    const [month, day] = birthday.split("-").map(Number);
    return today < new Date(year + 19, month - 1, day);
  }
  return today < new Date(year + 19, 11, 31);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: withHashedNaverId(PrismaAdapter(prisma)),
  providers: [
    Naver({
      clientId: process.env.AUTH_NAVER_ID!,
      clientSecret: process.env.AUTH_NAVER_SECRET!,
      profile(profile: NaverProfile) {
        return { id: profile.response.id };
      },
    }),
  ],
  session: { strategy: "database" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    signIn({ account, profile }) {
      if (account?.provider === "naver") {
        const { birthyear, birthday } = (profile as NaverProfile).response;
        if (!birthyear) return "/login?error=no_birthyear";
        if (isUnder19(birthyear, birthday)) return "/login?error=underage";
      }
      return true;
    },
    session({ session, user }) {
      session.user.id = user.id;
      session.user.publicId = user.publicId ?? "";
      session.user.role = (user.role ?? "TEMP") as "TEMP" | "USER" | "ADMIN";
      session.user.nickname = user.nickname ?? null;
      return session;
    },
  },
});
