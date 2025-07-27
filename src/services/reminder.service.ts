import prisma from "../config/db";
import { TReminderStatus, TReminderType } from "../constants/types";

export class ReminderService {
    static async createReminder(data: {
        customerId: string;
        creatorId: string;
        due: Date;
        amount?: number;
        message?: string;
        type?: TReminderType;
    }) {
        return prisma.reminder.create({
            data: {
                customerId: data.customerId,
                creatorId: data.creatorId,
                due: data.due,
                amount: data.amount,
                message: data.message,
                type: data.type || "CUSTOM",
            },
            include: {
                customer: true,
                creator: true,
            },
        });
    }

    static async getReminders(
        filter: {
            customerId?: string;
            status?: TReminderStatus;
            type?: TReminderType;
            creatorId?: string;
        } = {},
    ) {
        return prisma.reminder.findMany({
            where: {
                ...filter,
            },
            include: {
                customer: true,
                creator: true,
            },
            orderBy: {
                due: "asc",
            },
        });
    }

    static async updateReminder(
        id: string,
        data: Partial<{
            due: Date;
            amount: number;
            message: string;
            status: TReminderStatus;
            type: TReminderType;
            sentAt: Date;
        }>,
    ) {
        return prisma.reminder.update({
            where: { id },
            data,
        });
    }

    static async deleteReminder(id: string) {
        return prisma.reminder.delete({ where: { id } });
    }

    // Optionally, add a method to mark as sent and set sentAt
    static async markAsSent(id: string) {
        return prisma.reminder.update({
            where: { id },
            data: {
                status: "SENT",
                sentAt: new Date(),
            },
        });
    }
}
