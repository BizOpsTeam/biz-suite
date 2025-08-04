import { z } from "zod";

export const budgetSchema = z.object({
    categoryId: z.string(),
    allocated: z.number().positive(),
    period: z.enum(["MONTHLY", "QUARTERLY", "YEARLY"]).default("MONTHLY"),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    isActive: z.boolean().optional().default(true),
});

export const budgetUpdateSchema = budgetSchema.partial(); 