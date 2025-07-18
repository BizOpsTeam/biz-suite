import { z } from "zod";

export const stockAdjustmentSchema = z.object({
    productId: z.string(),
    quantityChange: z
        .number()
        .int()
        .refine((val) => val !== 0, {
            message: "Quantity change cannot be zero",
        }),
    reason: z.string().min(2).max(100),
    note: z.string().max(200).optional(),
});
