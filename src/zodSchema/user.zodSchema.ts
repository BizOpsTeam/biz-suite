import { z } from "zod";

// Define the schema for the user object
export const userSchema = z.object({
    name: z.string().min(1).max(50),
    email: z.string().email(),
    password: z.string().min(8).max(100),
    role: z.enum(["admin", "worker", "user"]).default("admin"),
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(100),
});

export const createCustomerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    address: z.string().optional(),
});

export const updateCustomerSchema = z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
});

export const updateUserProfileSchema = z.object({
    name: z.string().min(1).max(50).optional(),
    logoUrl: z.string().url().optional(),
    companyAddress: z.string().max(255).optional(),
    companyPhone: z.string().max(30).optional(),
    defaultCurrencyCode: z.string().min(3).max(5).optional(),
    defaultCurrencySymbol: z.string().min(1).max(3).optional(),
    defaultTaxRate: z.number().min(0).max(1).optional(),
    invoicePrefix: z.string().max(20).optional(),
    invoiceSuffix: z.string().max(20).optional(),
    invoiceSequenceStart: z.number().int().min(1).optional(),
    invoiceSequenceNext: z.number().int().min(1).optional(),
});
