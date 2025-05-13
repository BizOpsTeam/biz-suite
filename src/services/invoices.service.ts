import prisma from "../config/db"

export const getInvoices = async(userId: string) => {
    return await prisma.invoice.findMany({
        where: {
            ownerId: userId 
        }
    })
}


export const searchProducts = async(ownerId: string, query?:string, categoryId?: string, inStock?: string ) => {
    return await prisma.product.findMany({
        where: {
            ownerId: ownerId, 
            ...(query && {
                name: {
                    contains: query,
                    mode: "insensitive"
                }
            }),
            // ...(categoryId && {
            //     categoryId: categoryId
            // }),
            // ...(inStock !== undefined && {
            //     stock: inStock === "true" ? {gt: 0} : 0
            // })
        },
        orderBy: {
            createdAt: "desc"
        } 
    })
}
