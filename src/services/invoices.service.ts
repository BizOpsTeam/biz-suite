import prisma from "../config/db";
import appAssert from "../utils/appAssert";
import { NOT_FOUND, BAD_REQUEST } from "../constants/http";
// Remove: import { PrismaClient, InvoiceStatus } from "@prisma/client";
// Use the existing prisma import from config/db

export interface InvoicesQuery {
    ownerId: string;
    customerId?: string;
    status?: string;
    currencyCode?: string;
    search?: string;
    sort?: string; // e.g., 'createdAt:desc'
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
}

export const getInvoices = async (query: InvoicesQuery) => {
    const {
        ownerId,
        customerId,
        status,
        currencyCode,
        search,
        sort = "createdAt:desc",
        page = 1,
        limit = 20,
        startDate,
        endDate,
    } = query;

    const where: any = { ownerId };
    if (customerId) where["sale"] = { customerId };
    if (status) where.status = status;
    if (currencyCode) where.currencyCode = currencyCode;
    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
    }
    if (search) {
        where.OR = [
            { invoiceNumber: { contains: search, mode: "insensitive" } },
            {
                sale: {
                    customer: {
                        name: { contains: search, mode: "insensitive" },
                    },
                },
            },
            { sale: { notes: { contains: search, mode: "insensitive" } } },
        ];
    }

    // Sorting
    let orderBy: any = { createdAt: "desc" };
    if (sort) {
        const [field, direction] = sort.split(":");
        orderBy = { [field]: direction === "asc" ? "asc" : "desc" };
    }

    // Pagination
    const skip = (page - 1) * limit;
    const take = limit;

    // Query with count for pagination
    const [invoices, total] = await Promise.all([
        prisma.invoice.findMany({
            where,
            orderBy,
            skip,
            take,
            include: {
                sale: { include: { customer: true } },
                owner: true,
            },
        }),
        prisma.invoice.count({ where }),
    ]);

    return {
        data: invoices,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
};

export const searchProducts = async (
    ownerId: string,
    query?: string,
    categoryId?: string,
    inStock?: string,
) => {
    return await prisma.product.findMany({
        where: {
            ownerId: ownerId,
            ...(query && {
                name: {
                    contains: query,
                    mode: "insensitive",
                },
            }),
            // ...(categoryId && {
            //     categoryId: categoryId
            // }),
            // ...(inStock !== undefined && {
            //     stock: inStock === "true" ? {gt: 0} : 0
            // })
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

export async function updateInvoicePayment(
    id: string,
    data: {
        status: "UNPAID" | "PARTIAL" | "PAID";
        paidAmount: number;
        paidAt?: Date;
    },
) {
    const invoice = await prisma.invoice.findUnique({ where: { id } });
    appAssert(invoice, NOT_FOUND, "Invoice not found");

    // Validate paidAmount
    appAssert(
        data.paidAmount >= 0,
        BAD_REQUEST,
        "Paid amount must be non-negative",
    );
    appAssert(
        data.paidAmount <= invoice.amountDue,
        BAD_REQUEST,
        "Paid amount cannot exceed amount due",
    );

    // Validate status consistency
    if (data.status === "PAID") {
        appAssert(
            data.paidAmount === invoice.amountDue,
            BAD_REQUEST,
            "Invoice can only be marked as PAID if fully paid",
        );
    } else if (data.status === "PARTIAL") {
        appAssert(
            data.paidAmount > 0 && data.paidAmount < invoice.amountDue,
            BAD_REQUEST,
            "Partial payment must be greater than 0 and less than amount due",
        );
    } else if (data.status === "UNPAID") {
        appAssert(
            data.paidAmount === 0,
            BAD_REQUEST,
            "Unpaid invoice must have 0 paid amount",
        );
    }

    return prisma.invoice.update({
        where: { id },
        data: {
            status: data.status,
            paidAmount: data.paidAmount,
            paidAt: data.paidAt ?? (data.status === "PAID" ? new Date() : null),
            isPaid: data.status === "PAID",
        },
    });
}

export async function getInvoiceWithDetails(invoiceId: string) {
    const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
            sale: {
                include: {
                    saleItems: {
                        include: {
                            product: true,
                        },
                    },
                    customer: true,
                },
            },
            owner: true,
        },
    });
    appAssert(invoice, NOT_FOUND, "Invoice not found");
    return invoice;
}

export async function logInvoiceAuditEvent({
    invoiceId,
    eventType,
    userId,
    eventDetails,
}: {
    invoiceId: string;
    eventType: "VIEWED" | "DOWNLOADED" | "EMAILED";
    userId?: string;
    eventDetails?: string;
}) {
    await prisma.invoiceAudit.create({
        data: {
            invoiceId,
            eventType,
            userId,
            eventDetails,
        },
    });
}
