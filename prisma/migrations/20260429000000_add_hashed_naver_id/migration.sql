-- AlterTable
ALTER TABLE "users" ADD COLUMN "hashedNaverId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_hashedNaverId_key" ON "users"("hashedNaverId");
