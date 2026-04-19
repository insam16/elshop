-- AlterTable: email을 nullable로 변경 (네이버 OAuth는 이메일을 항상 제공하지 않음)
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;

-- CreateIndex: reports 중복 신고 방지 unique 제약 (스키마에 있었으나 마이그레이션 누락)
CREATE UNIQUE INDEX "reports_reporterId_postId_key" ON "reports"("reporterId", "postId");
