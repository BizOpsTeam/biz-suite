import prisma from "../config/db";
import { TSaleData } from "../constants/types";
import { generateInvoiceNumber } from "../utils/prismaHelpers";

export const createSale = async (saleData: TSaleData) => {

    const sale = await prisma.$transaction(async (tx) => {
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
        if(newSale.status === "pending"){
            const invoceNumber = await generateInvoiceNumber()
            const newInvoice = await tx.invoice.create({
                data: {
                    saleId: newSale.id,
                    invoiceNumber: invoceNumber,
                    amountDue: newSale.totalAmount,
                    dueDate: new Date() //::Todo: will be updatad later
                }
            })
            return { newSale, newInvoice }
        }
        
        return newSale
    })

    return sale
}