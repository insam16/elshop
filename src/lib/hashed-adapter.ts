import crypto from "crypto";
import { nanoid } from "nanoid";
import type { Adapter, AdapterAccount, AdapterUser } from "next-auth/adapters";
import { generateTempNickname } from "@/lib/temp-nickname";
import { prisma } from "@/lib/prisma";

export function hashNaverId(naverId: string): string {
  return crypto
    .createHash("sha256")
    .update(naverId + process.env.SECRET_SALT)
    .digest("hex");
}

function hashAccount<T extends { provider: string; providerAccountId: string }>(
  account: T
): T {
  if (account.provider !== "naver") return account;
  return { ...account, providerAccountId: hashNaverId(account.providerAccountId) };
}

export function withHashedNaverId(adapter: Adapter): Adapter {
  return {
    ...adapter,

    createUser: async (user: AdapterUser) => {
      const nickname = await generateTempNickname();
      return adapter.createUser!({ ...user, publicId: nanoid(12), nickname });
    },

    linkAccount: async (account: AdapterAccount) => {
      const hashed = hashAccount(account);
      if (account.provider === "naver") {
        await prisma.user.update({
          where: { id: account.userId },
          data: { hashedNaverId: hashed.providerAccountId },
        });
      }
      await adapter.linkAccount!(hashed);
    },

    unlinkAccount: (account: Pick<AdapterAccount, "provider" | "providerAccountId">) =>
      adapter.unlinkAccount!(hashAccount(account)),

    getUserByAccount: (account: Pick<AdapterAccount, "provider" | "providerAccountId">) =>
      adapter.getUserByAccount!(hashAccount(account)),

    getAccount: (providerAccountId: string, provider: string) =>
      adapter.getAccount!(
        provider === "naver" ? hashNaverId(providerAccountId) : providerAccountId,
        provider
      ),
  };
}
