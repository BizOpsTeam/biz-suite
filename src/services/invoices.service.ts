import prisma from "../config/db";
import { InvoiceStatus } from "@prisma/client";

export interface InvoicesOptions {
    page?: number;
    limit?: number;
    search?: string;
    status?: InvoiceStatus;
    startDate?: Date;
    endDate?: Date;
    ownerId: string;
}

export interface InvoiceWithDetails {
    id: string;
    invoiceNumber: string;
    amountDue: number;
    dueDate: Date;
    isPaid: boolean;
    status: InvoiceStatus;
    paidAmount: number;
    paidAt?: Date;
    currencyCode: string;
    currencySymbol: string;
    taxRate: number;
    taxAmount: number;
    createdAt: Date;
    updatedAt: Date;
    sale: {
        id: string;
        totalAmount: number;
        channel: string;
        paymentMethod: string;
        status: string;
        createdAt: Date;
        customer: {
            id: string;
            name: string;
            email: string;
            phone?: string;
            address?: string;
        };
        saleItems: Array<{
            id: string;
            quantity: number;
            price: number;
            product: {
                id: string;
                name: string;
                description?: string;
            };
        }>;
    };
    receipt?: {
        id: string;
        receiptNumber: string;
        issuedAt: Date;
        emailed: boolean;
        emailedAt?: Date;
    };
}

export async function getInvoices(options: InvoicesOptions) {
    const { page = 1, limit = 10, search = "", status, startDate, endDate, ownerId } = options;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
        ownerId,
    };

    if (search) {
        where.OR = [
            { invoiceNumber: { contains: search, mode: 'insensitive' } },
            { sale: { customer: { name: { contains: search, mode: 'insensitive' } } } },
            { sale: { customer: { email: { contains: search, mode: 'insensitive' } } } },
        ];
    }

    if (status) {
        where.status = status;
    }

    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
    }

    const [invoices, total] = await Promise.all([
        prisma.invoice.findMany({
            where,
            include: {
                sale: {
                    include: {
                        customer: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                                address: true,
                            },
                        },
                        saleItems: {
                            include: {
                                product: {
                                    select: {
                                        id: true,
                                        name: true,
                                        description: true,
                                        price: true,
                                    },
                                },
                            },
                        },
                    },
                },
                receipt: {
                    select: {
                        id: true,
                        receiptNumber: true,
                        issuedAt: true,
                        emailed: true,
                        emailedAt: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        }),
        prisma.invoice.count({ where }),
    ]);

    return {
        invoices,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}

export async function getInvoiceById(invoiceId: string, ownerId: string): Promise<InvoiceWithDetails | null> {
    const invoice = await prisma.invoice.findFirst({
        where: {
            id: invoiceId,
            ownerId,
        },
        include: {
            sale: {
                include: {
                    customer: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                            address: true,
                        },
                    },
                    saleItems: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    description: true,
                                    price: true,
                                },
                            },
                        },
                    },
                },
            },
            receipt: {
                select: {
                    id: true,
                    receiptNumber: true,
                    issuedAt: true,
                    emailed: true,
                    emailedAt: true,
                },
            },
            auditLogs: {
                orderBy: { createdAt: 'desc' },
                take: 10,
            },
        },
    });

    return invoice as InvoiceWithDetails | null;
}

export async function getInvoiceStats(ownerId: string) {
    const [
        totalInvoices,
        paidInvoices,
        unpaidInvoices,
        overdueInvoices,
        totalAmount,
        paidAmount,
        outstandingAmount,
    ] = await Promise.all([
        prisma.invoice.count({ where: { ownerId } }),
        prisma.invoice.count({ where: { ownerId, isPaid: true } }),
        prisma.invoice.count({ where: { ownerId, isPaid: false } }),
        prisma.invoice.count({ 
            where: { 
                ownerId, 
                isPaid: false, 
                dueDate: { lt: new Date() } 
            } 
        }),
        prisma.invoice.aggregate({
            where: { ownerId },
            _sum: { amountDue: true },
        }),
        prisma.invoice.aggregate({
            where: { ownerId, isPaid: true },
            _sum: { paidAmount: true },
        }),
        prisma.invoice.aggregate({
            where: { ownerId, isPaid: false },
            _sum: { amountDue: true },
        }),
    ]);

    return {
        totalInvoices,
        paidInvoices,
        unpaidInvoices,
        overdueInvoices,
        totalAmount: totalAmount._sum.amountDue || 0,
        paidAmount: paidAmount._sum.paidAmount || 0,
        outstandingAmount: outstandingAmount._sum.amountDue || 0,
        paymentRate: totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0,
    };
}

export async function updateInvoiceStatus(invoiceId: string, ownerId: string, status: InvoiceStatus, paidAmount?: number) {
    const invoice = await prisma.invoice.findFirst({
        where: { id: invoiceId, ownerId },
    });

    if (!invoice) return null;

    const updateData: any = { status };

    if (status === 'PAID' && paidAmount) {
        updateData.isPaid = true;
        updateData.paidAmount = paidAmount;
        updateData.paidAt = new Date();
    } else if (status === 'UNPAID') {
        updateData.isPaid = false;
        updateData.paidAmount = 0;
        updateData.paidAt = null;
    }

    return await prisma.invoice.update({
        where: { id: invoiceId },
        data: updateData,
        include: {
            sale: {
                include: {
                    customer: true,
                },
            },
        },
    });
}

export async function markInvoiceAsViewed(invoiceId: string, userId: string) {
    return await prisma.invoiceAudit.create({
        data: {
            invoiceId,
            userId,
            eventType: 'VIEWED',
            eventDetails: 'Invoice viewed by user',
        },
    });
}

export async function deleteInvoice(invoiceId: string, ownerId: string) {
    const invoice = await prisma.invoice.findFirst({
        where: {
            id: invoiceId,
            ownerId,
        },
    });

    if (!invoice) {
        return null;
    }

    return await prisma.invoice.delete({
        where: { id: invoiceId },
    });
}

export async function logInvoiceAuditEvent({
    invoiceId,
    eventType,
    userId,
    eventDetails,
}: {
    invoiceId: string;
    eventType: 'VIEWED' | 'DOWNLOADED' | 'EMAILED';
    userId?: string;
    eventDetails?: string;
}) {
    await prisma.invoiceAudit.create({
        data: {
            invoiceId,
            userId,
            eventType,
            eventDetails,
        },
    });
}
