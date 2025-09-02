/*
  Warnings:

  - You are about to drop the column `source` on the `Quote` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."SourceType" AS ENUM ('YOUTUBE', 'BOOK', 'ARTICLE', 'PODCAST', 'SPEECH', 'INTERVIEW', 'DOCUMENTARY', 'WEBSITE', 'OTHER');

-- AlterTable
ALTER TABLE "public"."Quote" DROP COLUMN "source",
ADD COLUMN     "sourceId" TEXT;

-- CreateTable
CREATE TABLE "public"."Source" (
    "id" TEXT NOT NULL,
    "type" "public"."SourceType" NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT,
    "timestamp" TEXT,
    "channel" TEXT,
    "author" TEXT,
    "publisher" TEXT,
    "year" INTEGER,
    "isbn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Quote" ADD CONSTRAINT "Quote_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."Source"("id") ON DELETE SET NULL ON UPDATE CASCADE;
