import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const nickname = "늘춍";

  try {
    const user = await prisma.user.update({
      where: { nickname },
      data: { role: "ADMIN" },
    });

    console.log(`Success: User "${user.nickname}" (${user.email}) has been promoted to ADMIN.`);
  } catch (error) {
    console.error("Error: Could not find or update user with nickname:", nickname);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
