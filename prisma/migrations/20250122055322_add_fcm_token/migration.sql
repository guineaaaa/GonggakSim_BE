/*
  Warnings:

  - You are about to drop the column `fcmToken` on the `exam` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `exam` DROP COLUMN `fcmToken`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `fcmToken` VARCHAR(191) NULL;
