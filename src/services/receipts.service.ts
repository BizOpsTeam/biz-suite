import prisma from '../config/db';
import { Receipt } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

/**
 * Creates a receipt for a given invoice and user.
 * @param invoiceId - The ID of the invoice
 * @param issuedById - The user issuing the receipt
 * @returns The created Receipt
 */
export async function createReceiptForInvoice(invoiceId: string, issuedById: string): Promise<Receipt> {
  // Generate a unique receipt number (could be improved for custom logic)
  const receiptNumber = `RCPT-${Date.now()}-${uuidv4().slice(0, 8)}`;

  // Ensure invoice exists and is not already receipted
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { receipt: true },
  });
  if (!invoice) throw new Error('Invoice not found');
  if (invoice.receipt) throw new Error('Receipt already exists for this invoice');

  const receipt = await prisma.receipt.create({
    data: {
      receiptNumber,
      invoiceId,
      issuedById,
      issuedAt: new Date(),
    },
  });
  return receipt;
} 