-- AlterEnum: rename OPEN to ACTIVE, add EXPIRED
ALTER TYPE "PostStatus" RENAME VALUE 'OPEN' TO 'ACTIVE';

ALTER TYPE "PostStatus" ADD VALUE 'EXPIRED';

-- AlterTable: posts
ALTER TABLE "posts" ADD COLUMN "contact" TEXT;
ALTER TABLE "posts" ADD COLUMN "expiresAt" TIMESTAMP(3);

-- AlterTable: comments
ALTER TABLE "comments" ADD COLUMN "contact" TEXT;
