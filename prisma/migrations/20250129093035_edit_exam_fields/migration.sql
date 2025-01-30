/*
  Warnings:

  - You are about to drop the column `examRange` on the `exam` table. All the data in the column will be lost.
  - You are about to drop the column `memo` on the `exam` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `exam` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `exam` DROP COLUMN `examRange`,
    DROP COLUMN `memo`,
    DROP COLUMN `status`;
