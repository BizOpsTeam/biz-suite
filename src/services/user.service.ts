// Customer Service Functions (stubs)
import { PrismaClient, Customer } from "@prisma/client";
import appAssert from "../utils/appAssert";
import { BAD_REQUEST, NOT_FOUND, CONFLICT } from "../constants/http";
const prisma = new PrismaClient();

export async function createCustomer(data: any): Promise<Customer> {
    // Check for existing email
    const existing = await prisma.customer.findUnique({
        where: { email: data.email },
    });
    appAssert(
        !existing,
        CONFLICT,
        "A customer with this email already exists.",
    );
    return prisma.customer.create({ data });
}

export async function getCustomers(): Promise<Customer[]> {
    return prisma.customer.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getCustomerById(id: string): Promise<Customer> {
    const customer = await prisma.customer.findUnique({ where: { id } });
    appAssert(customer, NOT_FOUND, "Customer not found");
    return customer;
}

export async function updateCustomer(id: string, data: any): Promise<Customer> {
    // Ensure customer exists
    const customer = await prisma.customer.findUnique({ where: { id } });
    appAssert(customer, NOT_FOUND, "Customer not found");
    // If updating email, check for conflicts
    if (data.email && data.email !== customer.email) {
        const existing = await prisma.customer.findUnique({
            where: { email: data.email },
        });
        appAssert(
            !existing,
            CONFLICT,
            "A customer with this email already exists.",
        );
    }
    return prisma.customer.update({ where: { id }, data });
}

export async function deleteCustomer(id: string): Promise<Customer> {
    const customer = await prisma.customer.findUnique({ where: { id } });
    appAssert(customer, NOT_FOUND, "Customer not found");
    return prisma.customer.delete({ where: { id } });
}

export async function updateUserProfile(userId: string, data: any) {
    const user = await prisma.userModel.findUnique({ where: { id: userId } });
    appAssert(user, NOT_FOUND, "User not found");
    return prisma.userModel.update({ where: { id: userId }, data });
}

export async function getUserProfile(userId: string) {
    const user = await prisma.userModel.findUnique({ where: { id: userId } });
    appAssert(user, NOT_FOUND, "User not found");
    return user;
}

export async function getCustomerStatement(customerId: string, startDate?: Date, endDate?: Date) {
    // Fetch customer
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
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
    const statement = sales.map(sale => ({
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
