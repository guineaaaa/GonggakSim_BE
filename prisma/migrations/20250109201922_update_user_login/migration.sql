/*
  Warnings:

  - You are about to drop the column `oauthToken` on the `user` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Exam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `QuizResult` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `exam` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `notification` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `quizresult` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `oauthToken`,
    ADD COLUMN `oauthAccessToken` VARCHAR(191) NULL,
    ADD COLUMN `oauthRefreshToken` VARCHAR(191) NULL,
    MODIFY `oauthProvider` VARCHAR(191) NULL,
    MODIFY `userCategory` VARCHAR(191) NULL,
    MODIFY `employmentStatus` VARCHAR(191) NULL,
    MODIFY `age` INTEGER NULL,
    MODIFY `department` VARCHAR(191) NULL,
    MODIFY `grade` VARCHAR(191) NULL;
