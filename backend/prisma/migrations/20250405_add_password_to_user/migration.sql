-- Add email column with default value
ALTER TABLE `User` ADD COLUMN `email` VARCHAR(191) NULL;

-- Add password column with default value
ALTER TABLE `User` ADD COLUMN `password` VARCHAR(255) NULL;

-- Add unique constraint on email column
ALTER TABLE `User` ADD UNIQUE INDEX `User_email_key`(`email`);
