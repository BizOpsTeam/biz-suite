
import { Response, Request } from "express";
import catchErrors from "../utils/catchErrors";
import { CREATED, OK, UNAUTHORIZED } from "../constants/http";
import { createSale, getSales, getSalesStats } from "../services/sales.service";
import { saleSchema } from "../zodSchema/sale.zondSchema";
import appAssert from "../utils/appAssert";

export const addSaleHandler = catchErrors(async (req: Request, res: Response) => {
    const userId = req.user?.id
    appAssert(userId, UNAUTHORIZED, "unauthorized, login to create a sale")

    const { body } = req;
    const { customerName, items, paymentMethod, channel, notes } = saleSchema.parse(body);

    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const totalTax = items.reduce((sum, item) => sum + item.tax * item.quantity, 0)
    const totalDiscount = items.reduce((sum, item) => sum + item.discount, 0)

    // Create sale
    const sale = await createSale({customerName, items, channel, notes, paymentMethod, totalAmount, totalDiscount, totalTax}, userId)

    res.status(CREATED).json({ data: sale, message: "Sale added successfully" });
})


export const getSalesStatsHandler = catchErrors(async (req, res) => {
    const userId = req.user?.id
    appAssert(userId, UNAUTHORIZED, "unathorized, login to get your sales stats")

    const { period = "day"} = req.query 

    const stats = await getSalesStats(period as string, userId)
    res.status(OK).json({data: stats, message: "stats retrieved successfully"})
})


export const getAllSalesHandler = catchErrors(async(req, res) => {
    const userId = req.user?.id
    appAssert(userId, UNAUTHORIZED, "Unathorized, login to get sales data")

    const allSales = await getSales(userId)
    res.status(OK).json({ data: allSales, message: "Sales fetched successfully"})
})