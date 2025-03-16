import {z} from "zod"


// Define the schema for the user object
export const userSchema = z.object({
    name: z.string().min(1).max(50),
    email: z.string().email(),
    password: z.string().min(8).max(100),
})

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(100),
})