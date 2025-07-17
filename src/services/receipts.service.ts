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

export async function logReceiptAuditEvent({
  receiptId,
  eventType,
  userId,
  eventDetails,
}: {
  receiptId: string;
  eventType: 'VIEWED' | 'DOWNLOADED' | 'EMAILED';
  userId?: string;
  eventDetails?: string;
}) {
  await prisma.receiptAudit.create({
    data: {
      receiptId,
      eventType,
      userId,
      eventDetails,
    },
  });
}

export interface ReceiptsQuery {
  ownerId: string;
  customerId?: string;
  status?: string;
  issuedById?: string;
  search?: string;
  sort?: string; // e.g., 'issuedAt:desc'
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export async function getReceipts(query: ReceiptsQuery) {
  const {
    ownerId,
    customerId,
    status,
    issuedById,
    search,
    sort = 'issuedAt:desc',
    page = 1,
    limit = 20,
    startDate,
    endDate,
  } = query;

  const where: any = {
    invoice: { ownerId },
  };
  if (customerId) where.invoice.sale = { customerId };
  if (status) where.status = status;
  if (issuedById) where.issuedById = issuedById;
  if (startDate || endDate) {
    where.issuedAt = {};
    if (startDate) where.issuedAt.gte = new Date(startDate);
    if (endDate) where.issuedAt.lte = new Date(endDate);
  }
  if (search) {
    where.OR = [
      { receiptNumber: { contains: search, mode: 'insensitive' } },
      { invoice: { sale: { customer: { name: { contains: search, mode: 'insensitive' } } } } },
    ];
  }

  // Sorting
  let orderBy: any = { issuedAt: 'desc' };
  if (sort) {
    const [field, direction] = sort.split(':');
    orderBy = { [field]: direction === 'asc' ? 'asc' : 'desc' };
  }

  // Pagination
  const skip = (page - 1) * limit;
  const take = limit;

  // Query with count for pagination
  const [receipts, total] = await Promise.all([
    prisma.receipt.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        invoice: { include: { sale: { include: { customer: true } }, owner: true } },
        issuedBy: true,
      },
    }),
    prisma.receipt.count({ where }),
  ]);

  return {
    data: receipts,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
} 