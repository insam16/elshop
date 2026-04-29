-- CreateTable
CREATE TABLE "retained_users" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "hashedNaverId" TEXT NOT NULL,
    "retainUntil" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "retained_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "retained_users_publicId_key" ON "retained_users"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "retained_users_hashedNaverId_key" ON "retained_users"("hashedNaverId");
