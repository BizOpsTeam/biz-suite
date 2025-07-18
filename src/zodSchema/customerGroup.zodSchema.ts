import { z } from "zod";

export const customerGroupSchema = z.object({
    name: z.string().min(2).max(50),
    description: z.string().max(200).optional(),
});
