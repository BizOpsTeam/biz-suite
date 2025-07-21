import { z } from "zod";

export const PaymentMethodEnum = z.enum([
    "CASH",
    "CREDIT_CARD",
    "CREDIT",
    "MOBILE_MONEY",
]);

export const saleItemSchema = z.object({
    productId: z.string().min(10),
    quantity: z.number().int().positive(),
    discount: z.number().nonnegative().default(0),
    tax: z.number().nonnegative().default(0),
});

export const saleSchema = z.object({
    customerId: z.string().min(1, "Customer ID is required"),
    paymentMethod: PaymentMethodEnum,
    channel: z.string(),
    notes: z.string().max(300),
    items: z.array(saleItemSchema).min(1),
    dueDate: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
            message: "Invalid date format",
        })
        .transform((val) => new Date(val))
        .optional(),
    currencyCode: z.string().min(3).max(5),
    currencySymbol: z.string().min(1).max(3),
    taxRate: z.number().min(0).max(1),
});
