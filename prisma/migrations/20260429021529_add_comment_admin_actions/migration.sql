-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AdminActionType" ADD VALUE 'DELETE_COMMENT';
ALTER TYPE "AdminActionType" ADD VALUE 'RESOLVE_COMMENT_REPORT';
ALTER TYPE "AdminActionType" ADD VALUE 'REJECT_COMMENT_REPORT';

-- AlterTable
ALTER TABLE "admin_actions" ADD COLUMN     "commentId" TEXT,
ADD COLUMN     "commentReportId" TEXT;

-- CreateIndex
CREATE INDEX "admin_actions_commentId_idx" ON "admin_actions"("commentId");

-- CreateIndex
CREATE INDEX "admin_actions_commentReportId_idx" ON "admin_actions"("commentReportId");

-- AddForeignKey
ALTER TABLE "admin_actions" ADD CONSTRAINT "admin_actions_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_actions" ADD CONSTRAINT "admin_actions_commentReportId_fkey" FOREIGN KEY ("commentReportId") REFERENCES "comment_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;
