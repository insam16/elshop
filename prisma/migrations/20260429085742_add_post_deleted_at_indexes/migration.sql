-- DropIndex
DROP INDEX "posts_board_category_status_idx";

-- DropIndex
DROP INDEX "posts_createdAt_idx";

-- DropIndex
DROP INDEX "posts_isPremium_premiumUntil_idx";

-- CreateIndex
CREATE INDEX "posts_deletedAt_createdAt_idx" ON "posts"("deletedAt", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "posts_deletedAt_board_createdAt_idx" ON "posts"("deletedAt", "board", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "posts_deletedAt_isPremium_premiumUntil_idx" ON "posts"("deletedAt", "isPremium", "premiumUntil");

-- CreateIndex
CREATE INDEX "posts_deletedAt_board_category_status_idx" ON "posts"("deletedAt", "board", "category", "status");
