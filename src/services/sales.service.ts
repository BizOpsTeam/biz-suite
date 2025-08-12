import { startOfToday, subDays, subWeeks, subYears } from "date-fns";
import prisma from "../config/db";
import { BAD_REQUEST } from "../constants/http";
import { TSaleData } from "../constants/types";
import AppError from "../errors/AppError";
import { generateInvoiceNumber } from "../utils/prismaHelpers";
import { Prisma } from "@prisma/client";
import { createReceiptForInvoice } from "./receipts.service";

export const createSale = async (saleData: TSaleData, ownerId: string) => {
    return await prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
            // 1. Fetch all products needed for the sale in one go
            const productIds = saleData.items.map((item) => item.productId);
            const products = await tx.product.findMany({
                where: { id: { in: productIds } },
                select: { id: true, stock: true, cost: true, price: true },
            });
            const productMap: Record<
                string,
                {
                    id: string;
                    stock: number;
                    cost: number | null;
                    price: number;
                }
            > = Object.fromEntries(products.map((p) => [p.id, { ...p }]));

            // 2. Check stock and prepare updates in memory
            for (const item of saleData.items) {
                const product = productMap[item.productId];
                if (!product || product.stock < item.quantity) {
                    throw new AppError(
                        BAD_REQUEST,
                        `INSUFFICIENT_STOCK for product ${item.productId}`,
                    );
                }
                product.stock -= item.quantity; // decrement in memory
            }

            // 3. Update all product stocks in parallel
            await Promise.all(
                saleData.items.map((item) =>
                    tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { decrement: item.quantity } },
                    }),
                ),
            );

            // 4. Create the sale with all calculated amounts
            const newSale = await tx.sale.create({
                data: {
                    channel: saleData.channel,
                    customerId: saleData.customerId,
                    discount: saleData.totalDiscount,
                    paymentMethod: saleData.paymentMethod,
                    taxAmount: saleData.totalTax,  // Use the calculated tax amount
                    totalAmount: saleData.totalAmount,
                    status: saleData.paymentMethod === "CREDIT" ? "pending" : "completed",
                    notes: saleData.notes,
                    ownerId: ownerId,
                },
            });

            // 5. Prepare sale items with cost
            const saleItemsData = saleData.items.map((item) => ({
                saleId: newSale.id,
                productId: item.productId,
                quantity: item.quantity,
                price: productMap[item.productId]?.price,
                discount: item.discount,
                tax: item.tax,
                cost: productMap[item.productId]?.cost ?? null,
            }));
            await tx.saleItem.createMany({ data: saleItemsData });

            // 6. Create invoice with all financial details
            const invoiceNumber = await generateInvoiceNumber(ownerId);
            const newInvoice = await tx.invoice.create({
                data: {
                    saleId: newSale.id,
                    invoiceNumber: invoiceNumber,
                    amountDue: saleData.paymentMethod === "CREDIT" ? saleData.totalAmount : 0, // Full amount due for credit, 0 for paid
                    paidAmount: saleData.paymentMethod === "CREDIT" ? 0 : saleData.totalAmount, // 0 for credit, full amount for paid
                    isPaid: saleData.paymentMethod !== "CREDIT", // Mark as paid if not credit
                    status: saleData.paymentMethod === "CREDIT" ? "UNPAID" : "PAID",
                    ownerId: ownerId,
                    dueDate: saleData.dueDate ? new Date(saleData.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now if not specified
                    currencyCode: saleData.currencyCode,
                    currencySymbol: saleData.currencySymbol,
                    taxRate: saleData.taxRate,
                    taxAmount: saleData.totalTax,
                },
            });

            // 7. Create receipt if not CREDIT
            let newReceipt = null;
            if (saleData.paymentMethod !== "CREDIT") {
                newReceipt = await createReceiptForInvoice(
                    newInvoice.id,
                    ownerId,
                    tx,
                );
            }

            // 8. Low stock alert (after all updates)
            for (const product of Object.values(productMap)) {
                if (product.stock < 5) {
                    console.warn(
                        `LOW STOCK ALERT: Product ${product.id} has only ${product.stock} left.`,
                    );
                    // Optionally, trigger notification/email here
                }
            }

            return { newSale, newInvoice, newReceipt };
        },
        { timeout: 15000 }, // 15 seconds
    );
};

export const getSalesStats = async (period: string, ownerId: string) => {
    let startDate: Date;
    let dateTruncUnit: string;
    switch (period) {
        case "day":
            startDate = subDays(new Date(), 0);
            return getTodaysSales();
            break;
        case "week":
            startDate = subWeeks(new Date(), 4);
            dateTruncUnit = "week";
            return await getWeeklySalesStats(ownerId);
            break;
        case "month":
            const currentYear = new Date().getFullYear();
            return await getMonthlySalesStats(currentYear, ownerId);
            break;
        case "year":
            startDate = subYears(new Date(), 3);
            dateTruncUnit = "year";
            break;
        default:
            throw new AppError(BAD_REQUEST, "Invalid Period Value");
    }

    const startDateISO = startDate.toISOString();

    const results = (await prisma.$queryRawUnsafe(
        `
      SELECT 
        DATE_TRUNC('${dateTruncUnit}', "createdAt") AS period,
        SUM("totalAmount") AS total
      FROM "Sale"
      WHERE "createdAt" >= '${startDateISO}' AND "ownerId" = '${ownerId}'
      GROUP BY period
      ORDER BY period ASC
    `,
    )) as any[];

    return results;
};

export const getTodaysSales = async () => {
    return await prisma.sale.findMany({
        where: {
            createdAt: {
                gte: startOfToday(),
            },
        },
    });
};

export const getWeeklySalesStats = async (ownerId: string) => {
    const startDate = subDays(new Date(), 6); // last 7 days including today

    return (await prisma.$queryRawUnsafe(
        `
  SELECT 
    TO_CHAR("createdAt", 'YYYY-MM-DD') AS date,
    SUM("totalAmount") AS total
  FROM "Sale"
  WHERE "createdAt" >= $1 AND "ownerId" = $2
  GROUP BY date
  ORDER BY date ASC
  `,
        startDate,
        ownerId,
    )) as { day: string; total: number }[];
};

export const getMonthlySalesStats = async (year: number, ownerId: string) => {
    return (await prisma.$queryRawUnsafe(
        `
      SELECT 
        TO_CHAR("createdAt", 'YYYY-MM') AS month,
        SUM("totalAmount") AS total
      FROM "Sale"
      WHERE EXTRACT(YEAR FROM "createdAt") = $1
        AND "ownerId" = $2
      GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
      ORDER BY month;
    `,
        year,
        ownerId,
    )) as { month: string; total: number }[];
};

export interface SalesQuery {
    ownerId: string;
    customerId?: string;
    paymentMethod?: string;
    channel?: string;
    status?: string;
    search?: string;
    sort?: string; // e.g., 'createdAt:desc'
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
}

export const getSales = async (query: SalesQuery) => {
    const {
        ownerId,
        customerId,
        paymentMethod,
        channel,
        status,
        search,
        sort = "createdAt:desc",
        page = 1,
        limit = 20,
        startDate,
        endDate,
    } = query;

    const where: any = { ownerId };
    if (customerId) where.customerId = customerId;
    if (paymentMethod) where.paymentMethod = paymentMethod;
    if (channel) where.channel = channel;
    if (status) where.status = status;
    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
    }
    if (search) {
        where.OR = [
            { notes: { contains: search, mode: "insensitive" } },
            { customer: { name: { contains: search, mode: "insensitive" } } },
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
    const [sales, total] = await Promise.all([
        prisma.sale.findMany({
            where,
            orderBy,
            skip,
            take,
            include: {
                customer: true,
                saleItems: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                price: true,
                            },
                        },
                    },
                },
            },
        }),
        prisma.sale.count({ where }),
    ]);

    return {
        data: sales,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
};

export const deleteSale = async (saleId: string, ownerId: string) => {
    const sale = await prisma.sale.findUnique({ where: { id: saleId } });

    if (!sale || sale.ownerId !== ownerId) {
        throw new AppError(BAD_REQUEST, "Sale not found or access denied");
    }

    // Restore stock for each product in the sale
    const saleItems = await prisma.saleItem.findMany({ where: { saleId } });
    for (const item of saleItems as Record<string, any>[]) {
        await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
        });
    }

    return await prisma.sale.delete({ where: { id: saleId } });
};


export const getTodaySales = async (ownerId: string) => {
    //count the total amount of sales for today
    let totalSales = 0;
    totalSales = await prisma.sale.count({
        where: {
            createdAt: {
                gte: startOfToday(),
            },
            ownerId: ownerId,
        },
    });

    //calculate percentage difference from yesterday
    const yesterdaySales = await prisma.sale.count({
        where: {
            createdAt: {
                gte: subDays(startOfToday(), 1),
                lte: startOfToday(),
            },  
            ownerId: ownerId,
        },
    });

    // Handle division by zero when yesterdaySales is 0
    if (yesterdaySales === 0) {
        if (totalSales === 0) {
            return { totalSales, percentageDifference: "0%" };
        } else {
            return { totalSales, percentageDifference: "+∞%" };
        }
    }

    const percentageDifference = ((totalSales - yesterdaySales) / yesterdaySales) * 100;
    if (isNaN(percentageDifference)) {
        return { totalSales, percentageDifference: "0%" };
    }
    const percentageDifferenceFormatted = percentageDifference.toFixed(2);
    const percentageDifferenceSign = percentageDifference > 0 ? "+" : "-";

    return { totalSales, percentageDifference: `${percentageDifferenceSign}${percentageDifferenceFormatted}%` };
};