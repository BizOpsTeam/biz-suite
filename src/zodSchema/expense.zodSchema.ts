import { z } from "zod";

export const expenseSchema = z.object({
    amount: z.number().positive(),
    categoryId: z.string(),
    description: z.string().max(200).optional(),
    date: z.coerce.date(),
    isRecurring: z.boolean().optional(),
    recurrenceType: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).optional(),
    nextDueDate: z.coerce.date().optional(),
});
