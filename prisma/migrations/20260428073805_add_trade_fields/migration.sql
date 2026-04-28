-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "characterName" TEXT,
ADD COLUMN     "negotiable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tradeMethod" TEXT NOT NULL DEFAULT 'OTHER',
ALTER COLUMN "content" DROP NOT NULL;
