/*
  Warnings:

  - You are about to drop the column `day` on the `notification` table. All the data in the column will be lost.
  - You are about to drop the column `quizType` on the `notification` table. All the data in the column will be lost.
  - Added the required column `days` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quizTypes` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `notification` DROP COLUMN `day`,
    DROP COLUMN `quizType`,
    ADD COLUMN `days` JSON NOT NULL,
    ADD COLUMN `quizTypes` JSON NOT NULL;
