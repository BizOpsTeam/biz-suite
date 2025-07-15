import {z} from "zod"


// Define the schema for the user object
export const userSchema = z.object({
    name: z.string().min(1).max(50),
    email: z.string().email(),
    password: z.string().min(8).max(100),
    role: z.enum(["admin", "worker", "user"]).default("admin"),
})

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(100),
})

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