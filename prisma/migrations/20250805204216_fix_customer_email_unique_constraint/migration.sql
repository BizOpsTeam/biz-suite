/*
  Warnings:

  - A unique constraint covering the columns `[email,ownerId]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Customer_email_key";

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_ownerId_key" ON "Customer"("email", "ownerId");
