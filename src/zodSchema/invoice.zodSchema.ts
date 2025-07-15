import { z } from "zod";

export const updateInvoicePaymentSchema = z.object({
  status: z.enum(["UNPAID", "PARTIAL", "PAID"]),
  paidAmount: z.number().min(0, "Paid amount must be non-negative"),
  paidAt: z.date().optional(),
}); 