/*
  Warnings:

  - You are about to drop the column `examDate` on the `schedule` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `schedule` DROP COLUMN `examDate`,
    ADD COLUMN `examEnd` DATETIME(3) NULL,
    ADD COLUMN `examStart` DATETIME(3) NULL;
