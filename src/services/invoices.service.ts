import prisma from "../config/db"

export const getInvoices = async(userId: string) => {
    return await prisma.invoice.findMany({
        where: {
            ownerId: userId 
        }
    })
}

