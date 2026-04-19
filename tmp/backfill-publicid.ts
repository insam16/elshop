import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { nanoid } from "nanoid";

async function main() {
  const users = await prisma.user.findMany({ select: { id: true } });
  console.log(`backfill ${users.length} users`);
  for (const u of users) {
    await prisma.user.update({ where: { id: u.id }, data: { publicId: nanoid(12) } });
  }
  console.log("done");
}

main().finally(() => prisma.$disconnect());
