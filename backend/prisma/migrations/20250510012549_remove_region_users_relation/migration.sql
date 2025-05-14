/*
  Warnings:

  - You are about to drop the column `region_id` on the `user` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Reclam_region_id_fkey` ON `reclam`;

-- DropIndex
DROP INDEX `Reclam_user_id_fkey` ON `reclam`;

-- DropIndex
DROP INDEX `User_region_id_fkey` ON `user`;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `region_id`;

-- AddForeignKey
ALTER TABLE `Reclam` ADD CONSTRAINT `Reclam_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `Region`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reclam` ADD CONSTRAINT `Reclam_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
