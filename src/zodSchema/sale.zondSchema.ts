import { z } from "zod"


export const PaymentMethodEnum = z.enum(["CASH", "CREDIT_CARD", "CREDIT", "MOBILE_MONEY"]);

export const saleItemSchema = z.object({
    productId: z.string().min(10),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
    discount: z.number().nonnegative().default(0),
    tax: z.number().nonnegative().default(0)
})

export const saleSchema = z.object({
    customerName : z.string().min(3).max(50),
    paymentMethod: PaymentMethodEnum,
    channel: z.string(),
    notes: z.string().max(300),
    items: z.array(saleItemSchema).min(1),
    dueDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format" })
    .transform((val) => new Date(val)).optional()
})



