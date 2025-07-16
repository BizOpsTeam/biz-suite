-- AlterTable
ALTER TABLE "UserModel" ADD COLUMN     "defaultCurrencyCode" TEXT,
ADD COLUMN     "defaultCurrencySymbol" TEXT,
ADD COLUMN     "defaultTaxRate" DOUBLE PRECISION,
ADD COLUMN     "invoicePrefix" TEXT,
ADD COLUMN     "invoiceSequenceNext" INTEGER DEFAULT 1,
ADD COLUMN     "invoiceSequenceStart" INTEGER DEFAULT 1,
ADD COLUMN     "invoiceSuffix" TEXT;
