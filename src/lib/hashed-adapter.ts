import crypto from "crypto";
import { nanoid } from "nanoid";
import type { Adapter, AdapterAccount, AdapterUser } from "next-auth/adapters";

function hashNaverId(naverId: string): string {
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

    createUser: (user: AdapterUser) =>
      adapter.createUser!({ ...user, publicId: nanoid(12) }),

    linkAccount: (account: AdapterAccount) =>
      adapter.linkAccount!(hashAccount(account)),

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
