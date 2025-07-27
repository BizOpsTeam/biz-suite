import prisma from "../config/db";
import { CampaignInput } from "../zodSchema/campaign.zodSchema";

export class CampaignService {
    static async createCampaign(data: CampaignInput, ownerId: string) {
        // If broadcastToAll, fetch all customer IDs for the owner
        let recipientIds = data.recipients;
        if (data.broadcastToAll) {
            const customers = await prisma.customer.findMany({
                where: { ownerId },
                select: { id: true },
            });
            recipientIds = customers.map((c) => c.id);
        }

        // Create campaign and link recipients
        return prisma.campaign.create({
            data: {
                name: data.name,
                message: data.message,
                broadcastToAll: data.broadcastToAll,
                schedule: data.schedule ? new Date(data.schedule) : undefined,
                recipients: {
                    create: recipientIds.map((customerId) => ({ customerId })),
                },
                ownerId,
            },
            include: {
                recipients: true,
            },
        });
    }

    static async getCampaigns(ownerId: string) {
        return prisma.campaign.findMany({
            where: { ownerId },
            include: { recipients: true },
        });
    }
}
