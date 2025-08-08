// Customer Service Functions (stubs)
import { PrismaClient, Customer } from "@prisma/client";
import appAssert from "../utils/appAssert";
import { NOT_FOUND, CONFLICT } from "../constants/http";
const prisma = new PrismaClient();

export async function createCustomer(data: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    ownerId: string;
}): Promise<Customer> {
    try {
        return await prisma.customer.create({ data });
    } catch (error: any) {
        // Handle unique constraint violation
        if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
            throw new Error("A customer with this email already exists for your business.");
        }
        throw error;
    }
}

export async function getCustomers(ownerId: string, page: number, limit: number, search: string): Promise<Customer[]> {
    return prisma.customer.findMany({
        where: { ownerId, name: { contains: search, mode: "insensitive" } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
    });
}

export async function getTotalCustomers(ownerId: string): Promise<number> {
    const count = await prisma.customer.count({ where: { ownerId } });
    return count;
}

export async function getCustomerById(
    id: string,
    ownerId: string,
): Promise<Customer> {
    const customer = await prisma.customer.findFirst({
        where: { id, ownerId },
    });
    appAssert(customer, NOT_FOUND, "Customer not found");
    return customer;
}

export async function updateCustomer(
    id: string,
    ownerId: string,
    data: { email?: string },
): Promise<Customer> {
    // Ensure customer exists and belongs to owner
    const customer = await prisma.customer.findFirst({
        where: { id, ownerId },
    });
    appAssert(customer, NOT_FOUND, "Customer not found");
    // If updating email, check for conflicts
    if (data.email && data.email !== customer.email) {
        const existing = await prisma.customer.findFirst({
            where: { email: data.email, ownerId },
        });
        appAssert(
            !existing,
            CONFLICT,
            "A customer with this email already exists for your business.",
        );
    }
    return prisma.customer.update({ where: { id }, data });
}

export async function deleteCustomer(
    id: string,
    ownerId: string,
): Promise<Customer> {
    const customer = await prisma.customer.findFirst({
        where: { id, ownerId },
    });
    appAssert(customer, NOT_FOUND, "Customer not found");
    return prisma.customer.delete({ where: { id } });
}

export async function updateUserProfile(
    userId: string,
    data: { email?: string; name?: string },
): Promise<any> {
    const user = await prisma.userModel.findUnique({ where: { id: userId } });
    appAssert(user, NOT_FOUND, "User not found");
    return prisma.userModel.update({ where: { id: userId }, data });
}

export async function getUserProfile(userId: string): Promise<any> {
    const user = await prisma.userModel.findUnique({ where: { id: userId } });
    appAssert(user, NOT_FOUND, "User not found");
    return user;
}

export async function getCustomerStatement(
    customerId: string,
    ownerId: string,
    startDate?: Date,
    endDate?: Date,
): Promise<{
    customer: { id: string; name: string; email: string };
    statement: {
        date: Date;
        type: string;
        amount: number;
        description: string;
    }[];
    totalSales: number;
    totalPayments: number;
    outstandingBalance: number;
}> {
    // Fetch customer
    const customer = await prisma.customer.findFirst({
        where: { id: customerId, ownerId },
    });
    if (!customer) throw new Error("Customer not found");
    // Fetch sales for customer in date range
    const saleWhere: any = { customerId };
    if (startDate && endDate) {
        saleWhere.createdAt = { gte: startDate, lte: endDate };
    } else if (startDate) {
        saleWhere.createdAt = { gte: startDate };
    } else if (endDate) {
        saleWhere.createdAt = { lte: endDate };
    }
    const sales = await prisma.sale.findMany({
        where: saleWhere,
        orderBy: { createdAt: "asc" },
    });
    // Payments: if you have a payment model, fetch here. For now, assume only sales.
    // Build statement
    const statement = sales.map((sale) => ({
        date: sale.createdAt,
        type: "sale",
        amount: sale.totalAmount,
        description: `Sale #${sale.id}`,
    }));
    const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    // If you have payments, subtract them here
    const totalPayments = 0;
    const outstandingBalance = totalSales - totalPayments;
    return {
        customer: {
            id: customer.id,
            name: customer.name,
            email: customer.email,
        },
        statement,
        totalSales,
        totalPayments,
        outstandingBalance,
    };
}

export async function getCustomerDetails(customerId: string, ownerId: string) {
    const customer = await prisma.customer.findFirst({
        where: {
            id: customerId,
            ownerId,
        },
        include: {
            sales: {
                orderBy: { createdAt: 'desc' },
                take: 10,
            },
            memberships: {
                include: {
                    group: true,
                },
            },
            campaignRecipients: {
                include: {
                    campaign: true,
                },
            },
            reminders: {
                orderBy: { due: 'desc' },
                take: 10,
            },
        },
    });

    if (!customer) return null;

    // Get customer's invoices through sales
    const invoices = await prisma.invoice.findMany({
        where: {
            sale: {
                customerId: customerId,
            },
            ownerId,
        },
        include: {
            sale: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
    });

    // Calculate financial summary
    const totalSpent = customer.sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const averageOrderValue = customer.sales.length > 0 ? totalSpent / customer.sales.length : 0;
    const totalOrders = customer.sales.length;
    const lastOrderDate = customer.sales.length > 0 ? customer.sales[0].createdAt : null;

    // Get total invoices and amounts
    const totalInvoices = invoices.length;
    const totalInvoiced = invoices.reduce((sum, invoice) => sum + invoice.amountDue, 0);
    const paidInvoices = invoices.filter(invoice => invoice.isPaid).length;
    const totalPaid = invoices
        .filter(invoice => invoice.isPaid)
        .reduce((sum, invoice) => sum + invoice.paidAmount, 0);

    return {
        customer,
        sales: customer.sales,
        invoices,
        customerGroups: customer.memberships.map(m => m.group),
        campaigns: customer.campaignRecipients.map(cr => cr.campaign),
        reminders: customer.reminders,
        financialSummary: {
            totalSpent,
            averageOrderValue,
            totalOrders,
            lastOrderDate,
            totalInvoices,
            totalInvoiced,
            paidInvoices,
            totalPaid,
            outstandingAmount: totalInvoiced - totalPaid,
        },
    };
}

export async function getCustomerSales(customerId: string, ownerId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [sales, total] = await Promise.all([
        prisma.sale.findMany({
            where: {
                customerId,
                ownerId,
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        }),
        prisma.sale.count({
            where: {
                customerId,
                ownerId,
            },
        }),
    ]);

    return {
        sales,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}

export async function getCustomerInvoices(customerId: string, ownerId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [invoices, total] = await Promise.all([
        prisma.invoice.findMany({
            where: {
                sale: {
                    customerId,
                },
                ownerId,
            },
            include: {
                sale: true,
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        }),
        prisma.invoice.count({
            where: {
                sale: {
                    customerId,
                },
                ownerId,
            },
        }),
    ]);

    return {
        invoices,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}

export async function getCustomerCampaigns(customerId: string, ownerId: string) {
    const campaigns = await prisma.campaignRecipient.findMany({
        where: {
            customerId,
            campaign: {
                ownerId,
            },
        },
        include: {
            campaign: true,
        },
        orderBy: {
            campaign: {
                createdAt: 'desc',
            },
        },
    });

    return campaigns.map(cr => cr.campaign);
}
