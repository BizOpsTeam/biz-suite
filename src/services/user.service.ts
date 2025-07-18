// Customer Service Functions (stubs)
import { PrismaClient, Customer } from "@prisma/client";
import appAssert from "../utils/appAssert";
import { BAD_REQUEST, NOT_FOUND, CONFLICT } from "../constants/http";
const prisma = new PrismaClient();

export async function createCustomer(data: { name: string; email: string; ownerId: string }): Promise<Customer> {
    // Check for existing email for this owner
    const existing = await prisma.customer.findFirst({
        where: { email: data.email, ownerId: data.ownerId },
    });
    appAssert(
        !existing,
        CONFLICT,
        "A customer with this email already exists for your business.",
    );
    return prisma.customer.create({ data });
}

export async function getCustomers(ownerId: string): Promise<Customer[]> {
    return prisma.customer.findMany({ where: { ownerId }, orderBy: { createdAt: "desc" } });
}

export async function getCustomerById(id: string, ownerId: string): Promise<Customer> {
    const customer = await prisma.customer.findFirst({ where: { id, ownerId } });
    appAssert(customer, NOT_FOUND, "Customer not found");
    return customer;
}

export async function updateCustomer(id: string, ownerId: string, data: { email?: string }): Promise<Customer> {
    // Ensure customer exists and belongs to owner
    const customer = await prisma.customer.findFirst({ where: { id, ownerId } });
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

export async function deleteCustomer(id: string, ownerId: string): Promise<Customer> {
    const customer = await prisma.customer.findFirst({ where: { id, ownerId } });
    appAssert(customer, NOT_FOUND, "Customer not found");
    return prisma.customer.delete({ where: { id } });
}

export async function updateUserProfile(userId: string, data: { email?: string; name?: string }): Promise<any> {
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
    statement: { date: Date; type: string; amount: number; description: string }[];
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
