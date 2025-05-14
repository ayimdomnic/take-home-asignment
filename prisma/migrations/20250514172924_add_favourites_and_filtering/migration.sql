-- AlterTable
ALTER TABLE "files" ADD COLUMN     "lastAccessedAt" TIMESTAMP(3),
ADD COLUMN     "starred" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trashed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trashedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "FileShare" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permission" TEXT NOT NULL DEFAULT 'VIEW',

    CONSTRAINT "FileShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FileShare_fileId_userId_key" ON "FileShare"("fileId", "userId");

-- AddForeignKey
ALTER TABLE "FileShare" ADD CONSTRAINT "FileShare_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileShare" ADD CONSTRAINT "FileShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
