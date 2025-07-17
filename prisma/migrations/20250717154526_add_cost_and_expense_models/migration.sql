-- CreateEnum
CREATE TYPE "ReceiptAuditEventType" AS ENUM ('VIEWED', 'DOWNLOADED', 'EMAILED');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "cost" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "SaleItem" ADD COLUMN     "cost" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "ReceiptAudit" (
    "id" TEXT NOT NULL,
    "receiptId" TEXT NOT NULL,
    "userId" TEXT,
    "eventType" "ReceiptAuditEventType" NOT NULL,
    "eventDetails" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReceiptAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ReceiptAudit" ADD CONSTRAINT "ReceiptAudit_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "Receipt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceiptAudit" ADD CONSTRAINT "ReceiptAudit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "UserModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
