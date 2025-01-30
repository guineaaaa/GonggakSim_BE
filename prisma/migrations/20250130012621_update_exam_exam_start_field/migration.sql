/*
  Warnings:

  - Made the column `examStart` on table `exam` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `exam` MODIFY `examStart` DATETIME(3) NOT NULL;
