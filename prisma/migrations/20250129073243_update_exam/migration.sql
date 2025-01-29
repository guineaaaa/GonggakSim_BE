/*
  Warnings:

  - You are about to drop the column `examDate` on the `exam` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `exam` DROP COLUMN `examDate`,
    ADD COLUMN `examEnd` DATETIME(3) NULL,
    ADD COLUMN `examStart` DATETIME(3) NULL;
