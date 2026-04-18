import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
