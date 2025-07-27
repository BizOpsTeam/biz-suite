import { z } from "zod";

export const campaignSchema = z.object({
  name: z.string().min(2, 'Campaign name is required'),
  message: z.string().min(5, 'Message is required'),
  broadcastToAll: z.boolean(),
  recipients: z.array(z.string().uuid()), // array of customer IDs
  schedule: z.string().optional(), // ISO string
});

export type CampaignInput = z.infer<typeof campaignSchema>;
