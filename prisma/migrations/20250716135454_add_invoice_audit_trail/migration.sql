-- CreateEnum
CREATE TYPE "InvoiceAuditEventType" AS ENUM ('VIEWED', 'DOWNLOADED', 'EMAILED');

-- CreateTable
CREATE TABLE "InvoiceAudit" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "userId" TEXT,
    "eventType" "InvoiceAuditEventType" NOT NULL,
    "eventDetails" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceAudit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InvoiceAudit" ADD CONSTRAINT "InvoiceAudit_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceAudit" ADD CONSTRAINT "InvoiceAudit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
