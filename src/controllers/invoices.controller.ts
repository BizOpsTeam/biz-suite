import prisma from "../config/db";
import { OK, UNAUTHORIZED } from "../constants/http";
import { getInvoices, searchProducts } from "../services/invoices.service";
import appAssert from "../utils/appAssert";
import catchErrors from "../utils/catchErrors";

export const getInvoicesHandler = catchErrors(async (req, res) => {
    const ownerId = req.user?.id
    appAssert(ownerId, UNAUTHORIZED, "Unauthorized, login to fetch invoices")

    const invoices = await getInvoices(ownerId)
    return res.status(OK).json({ data: invoices, message: "invoices returned successfully" })
})

export const productSearchHandler = catchErrors(async (req, res) => {
    const ownerId = req.user?.id
    appAssert(ownerId, UNAUTHORIZED, "Login in to perform this action")

    const { query, categoryId, inStock } = req.query
    console.log("Querry: ", query)
    console.log("CategoryId: ", categoryId)
    console.log("inStock: ", inStock)

    const searchResults = await searchProducts(ownerId, String(query), String(categoryId), String(inStock))

    return res.status(OK).json({ data: searchResults, message: "search results returned sucessfully" })
})