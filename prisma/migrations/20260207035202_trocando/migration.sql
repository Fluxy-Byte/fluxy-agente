/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "phone" TEXT NOT NULL,
    "start_date_conversation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_date_conversation" TIMESTAMP(3),
    "pipeline_user" TEXT NOT NULL DEFAULT 'NOVO',

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_phone_key" ON "user"("phone");
