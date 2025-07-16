/*
  Warnings:

  - Added the required column `currencyCode` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currencySymbol` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "currencyCode" TEXT NOT NULL,
ADD COLUMN     "currencySymbol" TEXT NOT NULL,
ADD COLUMN     "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0;
