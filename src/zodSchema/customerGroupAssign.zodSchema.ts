import { z } from "zod";

export const customerGroupAssignSchema = z.object({
    groupIds: z.array(z.string()),
});
