/*
  Warnings:

  - A unique constraint covering the columns `[emailVerificationToken]` on the table `UserModel` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserModel_emailVerificationToken_key" ON "UserModel"("emailVerificationToken");
