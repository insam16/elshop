import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      nickname: true,
      email: true,
      role: true
    }
  });
  console.log("Current users in DB:");
  console.table(users);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
