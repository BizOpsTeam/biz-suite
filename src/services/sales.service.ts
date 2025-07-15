import { startOfToday, subDays, subMonths, subWeeks, subYears } from "date-fns";
import prisma from "../config/db";
import { BAD_REQUEST } from "../constants/http";
import { TSaleData } from "../constants/types";
import AppError from "../errors/AppError";
import { generateInvoiceNumber } from "../utils/prismaHelpers";
import { Prisma } from '@prisma/client';

export const createSale = async (saleData: TSaleData, ownerId: string) => {

    const sale = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {

        //make sure there are enough products in inventory to 
        for (const item of saleData.items) {
            const product = await tx.product.findUnique({ where: { id: item.productId } });

            if (!product || product.stock < item.quantity) {
                throw new AppError(BAD_REQUEST, `INSUFFICIENT_STOCK for product ${product?.id}`);
            }

            await tx.product.update({
                where: { id: item.productId },
                data: { stock: { decrement: item.quantity } },
            });

            // Low stock alert (threshold: 5)
            const updatedProduct = await tx.product.findUnique({ where: { id: item.productId } });
            if (updatedProduct && updatedProduct.stock < 5) {
                console.warn(`LOW STOCK ALERT: Product ${updatedProduct.id} has only ${updatedProduct.stock} left.`);
                // Optionally, trigger notification/email here
            }
        }

        const newSale = await tx.sale.create({
            data: {
                channel: saleData.channel,
                customerId: saleData.customerId,
                discount: saleData.totalDiscount,
                paymentMethod: saleData.paymentMethod,
                taxAmount: saleData.totalAmount,
                totalAmount: saleData.totalAmount,
                status: saleData.paymentMethod === "CREDIT" ? "pending" : "completed",
                notes: saleData.notes,
                ownerId: ownerId
            }
        })

        const saleItemsData = saleData.items.map((item) => ({
            saleId: newSale.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            discount: item.discount,
            tax: item.tax
        }))

        await tx.saleItem.createMany({ data: saleItemsData })

        // Removed duplicate stock decrement here

        //create an invoice if sale status is credit
        if (newSale.status === "pending") {
            const invoceNumber = await generateInvoiceNumber()
            const newInvoice = await tx.invoice.create({
                data: {
                    saleId: newSale.id,
                    invoiceNumber: invoceNumber,
                    amountDue: newSale.totalAmount,
                    ownerId: ownerId,
                    dueDate: new Date() //::Todo: will be updatad later
                }
            })
            return { newSale, newInvoice }
        }

        return newSale
    })

    return sale
}


export const getSalesStats = async (period: string, ownerId: string) => {

    let startDate: Date
    let dateTruncUnit: string
    switch (period) {
        case "day":
            startDate = subDays(new Date(), 0)
            return getTodaysSales()
            break
        case "week":
            startDate = subWeeks(new Date(), 4);
            dateTruncUnit = "week";
            return await getWeeklySalesStats(ownerId)
            break;
        case "month":
            const currentYear = new Date().getFullYear()
            return await getMonthlySalesStats(currentYear, ownerId) 
            break;
        case "year":
            startDate = subYears(new Date(), 3);
            dateTruncUnit = "year";
            break;
        default:
            throw new AppError(BAD_REQUEST, "Invalid Period Value")
    }


    const startDateISO = startDate.toISOString();

    const results = await prisma.$queryRawUnsafe(
      `
      SELECT 
        DATE_TRUNC('${dateTruncUnit}', "createdAt") AS period,
        SUM("totalAmount") AS total
      FROM "Sale"
      WHERE "createdAt" >= '${startDateISO}' AND "ownerId" = '${ownerId}'
      GROUP BY period
      ORDER BY period ASC
    `) as any[];

    return results
}

export const getTodaysSales = async () => {
    return await prisma.sale.findMany({
        where: {
            createdAt: {
                gte: startOfToday()
            }
        }
    })
}

export const getWeeklySalesStats = async (ownerId: string) => {
    const startDate = subDays(new Date(), 6); // last 7 days including today

    return await prisma.$queryRawUnsafe(
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
        ownerId
    ) as { day: string; total: number }[];
}

export const getMonthlySalesStats = async (year: number, ownerId: string) => {
    return await prisma.$queryRawUnsafe(
      `
      SELECT 
        TO_CHAR("createdAt", 'YYYY-MM') AS month,
        SUM("totalAmount") AS total
      FROM "Sale"
      WHERE EXTRACT(YEAR FROM "createdAt") = $1
        AND "ownerId" = $2
      GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
      ORDER BY month;
    `, year, ownerId) as { month: string; total: number }[];
}

export const getSales = async (ownerId: string) => {
    return await prisma.sale.findMany({
        where: {
            ownerId: ownerId
        }
    })
}

export const deleteSale = async(saleId: string, ownerId: string) => {
    const sale = await prisma.sale.findUnique({ where : { id : saleId }})

    if(!sale || sale.ownerId !== ownerId){
        throw new AppError(BAD_REQUEST, "Sale not found or access denied")
    }

    // Restore stock for each product in the sale
    const saleItems = await prisma.saleItem.findMany({ where: { saleId } });
    for (const item of saleItems) {
        await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
        });
    }

    return await prisma.sale.delete({ where: { id: saleId }})
}