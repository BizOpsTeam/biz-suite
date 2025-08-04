import { z } from "zod";

export const expenseSchema = z.object({
    amount: z.number().positive(),
    categoryId: z.string(),
    description: z.string().max(200).optional(),
    vendor: z.string().max(100).optional(),
    paymentMethod: z.enum(["COMPANY_CARD", "PERSONAL_CARD", "CASH", "BANK_TRANSFER", "CHECK"]).optional(),
    status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional().default("PENDING"),
    date: z.coerce.date(),
    isRecurring: z.boolean().optional(),
    recurrenceType: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).optional(),
    nextDueDate: z.coerce.date().optional(),
    receiptUrl: z.string().url().optional(),
    tags: z.array(z.string()).optional().default([]),
    notes: z.string().max(500).optional(),
});

export const expenseUpdateSchema = expenseSchema.partial();

export const expenseApprovalSchema = z.object({
    status: z.enum(["APPROVED", "REJECTED"]),
    notes: z.string().max(500).optional(),
});
