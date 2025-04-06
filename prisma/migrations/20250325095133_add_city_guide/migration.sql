/*
  Warnings:

  - You are about to drop the column `cityGuideId` on the `Place` table. All the data in the column will be lost.
  - You are about to drop the column `day` on the `Place` table. All the data in the column will be lost.
  - Added the required column `scheduleId` to the `Place` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Place` DROP FOREIGN KEY `Place_cityGuideId_fkey`;

-- DropIndex
DROP INDEX `Place_cityGuideId_fkey` ON `Place`;

-- AlterTable
ALTER TABLE `Place` DROP COLUMN `cityGuideId`,
    DROP COLUMN `day`,
    ADD COLUMN `scheduleId` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `Schedule` (
    `id` VARCHAR(191) NOT NULL,
    `cityGuideId` VARCHAR(191) NOT NULL,
    `day` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Schedule` ADD CONSTRAINT `Schedule_cityGuideId_fkey` FOREIGN KEY (`cityGuideId`) REFERENCES `CityGuide`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Place` ADD CONSTRAINT `Place_scheduleId_fkey` FOREIGN KEY (`scheduleId`) REFERENCES `Schedule`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
