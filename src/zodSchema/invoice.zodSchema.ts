import { z } from "zod";

export const updateInvoicePaymentSchema = z.object({
    status: z.enum(["UNPAID", "PARTIAL", "PAID"]),
    paidAmount: z.number().min(0, "Paid amount must be non-negative"),
    paidAt: z.date().optional(),
});

export const createInvoiceSchema = z.object({
    saleId: z.string(),
    amountDue: z.number().min(0),
    dueDate: z.string().or(z.date()),
    currencyCode: z.string().min(3).max(5),
    currencySymbol: z.string().min(1).max(3),
    taxRate: z.number().min(0).max(1), // e.g., 0.075 for 7.5%
    taxAmount: z.number().min(0),
});
