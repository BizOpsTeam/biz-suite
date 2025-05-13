import { subDays, subMonths, subWeeks, subYears } from "date-fns";
import prisma from "../config/db";
import { BAD_REQUEST } from "../constants/http";
import { TSaleData } from "../constants/types";
import AppError from "../errors/AppError";
import { generateInvoiceNumber } from "../utils/prismaHelpers";

export const createSale = async (saleData: TSaleData, ownerId: string) => {

    const sale = await prisma.$transaction(async (tx) => {

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
        }

        const newSale = await tx.sale.create({
            data: {
                channel: saleData.channel,
                customerName: saleData.customerName,
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

        //reduce stock
        for (const item of saleData.items) {
            await tx.product.update({
                where: { id: item.productId },
                data: {
                    stock: {
                        decrement: item.quantity,
                    },
                },
            });
        }

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
            dateTruncUnit = "week"
            break
        case "week":
            startDate = subWeeks(new Date(), 4);
            dateTruncUnit = "week";
            break;
        case "month":
            startDate = subMonths(new Date(), 6);
            dateTruncUnit = "month";
            break;
        case "year":
            startDate = subYears(new Date(), 3);
            dateTruncUnit = "year";
            break;
        default:
            throw new AppError(BAD_REQUEST, "Invalid Period Value")
    }


    const startDateISO = startDate.toISOString();

    const results = await prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        DATE_TRUNC('${dateTruncUnit}', "createdAt") AS period,
        SUM("totalAmount") AS total
      FROM "Sale"
      WHERE "createdAt" >= '${startDateISO}' AND "ownerId" = '${ownerId}'
      GROUP BY period
      ORDER BY period ASC
    `);

    return results
}