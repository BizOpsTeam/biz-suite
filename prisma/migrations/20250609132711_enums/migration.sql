/*
  Warnings:

  - The `role` column on the `UserModel` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "UserModel" DROP COLUMN "role",
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'worker';

-- DropEnum
DROP TYPE "Role";
