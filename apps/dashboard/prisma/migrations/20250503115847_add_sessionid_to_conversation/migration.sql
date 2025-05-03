/*
  Warnings:

  - A unique constraint covering the columns `[sessionId]` on the table `Conversation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sessionId` to the `Conversation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "sessionId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_sessionId_key" ON "Conversation"("sessionId");
