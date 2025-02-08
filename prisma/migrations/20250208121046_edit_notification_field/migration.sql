/*
  Warnings:

  - Added the required column `userId` to the `CertificationAlram` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `certificationalram` ADD COLUMN `userId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `notification` ADD COLUMN `selectedQuizRanges` JSON NULL;
