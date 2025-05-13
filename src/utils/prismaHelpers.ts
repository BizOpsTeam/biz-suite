import { format } from "date-fns"
import prisma from "../config/db"

export const generateInvoiceNumber = async() => {
    const today = format(new Date(), "yyyyMMdd")

    const todayCount = await prisma.invoice.count({
        where: {
            createdAt: {
                gte: new Date(`${today.slice(0,4)}-${today.slice(4,6)}-${today.slice(6,8)}T00:00:00z`)
            }
        }
    })

    const padded = String(todayCount + 1).padStart(3,"0")
    return `INV-${today}-${padded}`
}