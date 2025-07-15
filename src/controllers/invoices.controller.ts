import prisma from "../config/db";
import { OK, UNAUTHORIZED } from "../constants/http";
import { getInvoices, searchProducts, updateInvoicePayment } from "../services/invoices.service";
import appAssert from "../utils/appAssert";
import catchErrors from "../utils/catchErrors";
import { updateInvoicePaymentSchema } from "../zodSchema/invoice.zodSchema";
import { Request, Response, NextFunction } from "express";

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

export async function updateInvoicePaymentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const validated = updateInvoicePaymentSchema.parse(req.body);
    const invoice = await updateInvoicePayment(id, validated);
    res.json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
}