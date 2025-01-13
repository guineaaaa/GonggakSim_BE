/*
  Warnings:

  - Added the required column `updatedAt` to the `Certification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Schedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `certification` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `exam` ADD COLUMN `remindState` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `notification` ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `schedule` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `examLink` VARCHAR(191) NULL,
    ADD COLUMN `isAlwaysOpen` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `lateRegistrationEnd` DATETIME(3) NULL,
    ADD COLUMN `lateRegistrationStart` DATETIME(3) NULL,
    ADD COLUMN `registrationDeadlineDays` INTEGER NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `examDate` DATETIME(3) NULL,
    MODIFY `registrationStart` DATETIME(3) NULL,
    MODIFY `registrationEnd` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `CertificationAlram` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `scheduleId` INTEGER NOT NULL,
    `alramState` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CertificationAlram` ADD CONSTRAINT `CertificationAlram_scheduleId_fkey` FOREIGN KEY (`scheduleId`) REFERENCES `Schedule`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
