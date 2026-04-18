import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { Provider } from "next-auth/providers";

const NaverProvider: Provider = {
  id: "naver",
  name: "네이버",
  type: "oauth",
  authorization: {
    url: "https://nid.naver.com/oauth2.0/authorize",
    params: { response_type: "code" },
  },
  token: "https://nid.naver.com/oauth2.0/token",
  userinfo: {
    url: "https://openapi.naver.com/v1/nid/me",
    async request({ tokens }) {
      const res = await fetch("https://openapi.naver.com/v1/nid/me", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      const data = await res.json();
      return data.response; // { id, email, name, profile_image, ... }
    },
  },
  profile(profile: NaverProfile) {
    //console.log("NAVER PROFILE:", profile)
    return {
      id: profile.id,
      name: profile.name ?? null,
      email: profile.email ?? null,
      image: profile.profile_image ?? null,
    };
  },
  clientId: process.env.NAVER_CLIENT_ID!,
  clientSecret: process.env.NAVER_CLIENT_SECRET!,
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [NaverProvider],
  session: { strategy: "database" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    session({ session, user }) {
      const u = user as { id: string; role: string; nickname: string | null };
      session.user.id = u.id;
      session.user.role = u.role as "USER" | "ADMIN";
      session.user.nickname = u.nickname;
      return session;
    },
  },
});

type NaverProfile = {
  id: string;
  email: string;
  name?: string;
  profile_image?: string;
};
