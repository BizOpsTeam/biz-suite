
import { Response, Request } from "express";
import catchErrors from "../utils/catchErrors";
import { CREATED } from "../constants/http";
import { createSale } from "../services/sales.service";
import { saleSchema } from "../zodSchema/sale.zondSchema";

export const addSaleHandler = catchErrors(async (req: Request, res: Response) => {
    const { body } = req;
    const { customerName, items, paymentMethod, channel, notes } = saleSchema.parse(body);

    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const totalTax = items.reduce((sum, item) => sum + item.tax * item.quantity, 0)
    const totalDiscount = items.reduce((sum, item) => sum + item.discount, 0)

    // Create sale
    const sale = await createSale({customerName, items, channel, notes, paymentMethod, totalAmount, totalDiscount, totalTax})

    res.status(CREATED).json({ data: sale, message: "Sale added successfully" });
})