import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const nickname = "인증대기#0001";

  try {
    const user = await prisma.user.update({
      where: { nickname },
      data: { role: "ADMIN", nickname: "늘춍" },
    });

    console.log(`Success: User "${user.nickname}" (${user.id}) has been promoted to ADMIN.`);
  } catch (error) {
    console.error("Error: Could not find or update user with nickname:", nickname);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

// ❯ admin으로 승급시키는 방법
// npx tsx tmp/promote-admin.ts
//
// ● PostgreSQL 컨테이너에서 직접 SQL로 변경하면 됩니다.
//
//   docker exec -it postgres_db psql -U $POSTGRES_USER -d $POSTGRES_DB
//
//   접속 후:
//
//   -- 현재 유저 확인
//   SELECT id, email, nickname, role FROM users;
//
//   -- admin으로 승급 (이메일로)
//   UPDATE users SET role = 'ADMIN' WHERE email = '본인이메일@example.com';
//
//   -- 확인
//   SELECT email, role FROM users WHERE email = '본인이메일@example.com';
//
//   -- 나가기
//   \q