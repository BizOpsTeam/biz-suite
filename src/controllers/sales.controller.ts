import appAssert from "../utils/appAssert";
import { Response, Request } from "express";
import catchErrors from "../utils/catchErrors";
import { BAD_REQUEST, CREATED } from "../constants/http";
import { createSale } from "../services/sales.service";

export const addSaleHandler = catchErrors(async (req: Request, res: Response) => {
    const { body } = req;
    const { price, discount, quantity } = body;

    // Validate input
    appAssert(price, BAD_REQUEST, "User ID is required");
    appAssert(discount, BAD_REQUEST, "Product ID is required");
    appAssert(quantity > 0, BAD_REQUEST, "Quantity must be greater than 0");

    // Create sale
    const sale = await createSale({ price, discount, quantity })

    res.status(CREATED).json({ data: sale, message: "Sale added successfully" });
})