/*
  Warnings:

  - You are about to drop the column `date_fin` on the `reclam` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Reclam_region_id_fkey` ON `reclam`;

-- DropIndex
DROP INDEX `Reclam_user_id_fkey` ON `reclam`;

-- AlterTable
ALTER TABLE `reclam` DROP COLUMN `date_fin`,
    ADD COLUMN `attachment` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Reclam` ADD CONSTRAINT `Reclam_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `Region`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reclam` ADD CONSTRAINT `Reclam_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
