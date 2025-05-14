/*
  Warnings:

  - A unique constraint covering the columns `[blobId]` on the table `files` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `blobId` to the `files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `files` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "files" ADD COLUMN     "blobId" TEXT NOT NULL,
ADD COLUMN     "url" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "files_blobId_key" ON "files"("blobId");
