import { Response, Request } from "express";
import catchErrors from "../utils/catchErrors";
import { CREATED, NOT_FOUND, OK, UNAUTHORIZED } from "../constants/http";
import {
    createSale,
    deleteSale,
    getSales,
    getSalesStats,
} from "../services/sales.service";
import { saleSchema } from "../zodSchema/sale.zondSchema";
import appAssert from "../utils/appAssert";
import { getUserProfile } from "../services/user.service";
import { Prisma } from "@prisma/client";

export const addSaleHandler = catchErrors(
    async (req: Request, res: Response) => {
        const userId = req.user?.id;
        appAssert(userId, UNAUTHORIZED, "unauthorized, login to create a sale");

        const { body } = req;
        const {
            customerId,
            items,
            paymentMethod,
            channel,
            notes,
            currencyCode,
            currencySymbol,
            taxRate,
        } = saleSchema.parse(body);

        const totalAmount = items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0,
        );
        const totalTax = items.reduce(
            (sum, item) => sum + item.tax * item.quantity,
            0,
        );
        const totalDiscount = items.reduce(
            (sum, item) => sum + item.discount,
            0,
        );

        // Fetch user profile for defaults
        const userProfile = (await getUserProfile(userId)) as Prisma.UserModelGetPayload<{}>;
        const finalCurrencyCode =
            currencyCode || userProfile.defaultCurrencyCode || "USD";
        const finalCurrencySymbol =
            currencySymbol || userProfile.defaultCurrencySymbol || "$";
        const finalTaxRate =
            typeof taxRate === "number"
                ? taxRate
                : typeof userProfile.defaultTaxRate === "number"
                  ? userProfile.defaultTaxRate
                  : 0;

        // Validate currency/tax for credit sales (invoices)
        if (paymentMethod === "CREDIT") {
            appAssert(
                finalCurrencyCode,
                400,
                "currencyCode is required for invoices",
            );
            appAssert(
                finalCurrencySymbol,
                400,
                "currencySymbol is required for invoices",
            );
            appAssert(
                typeof finalTaxRate === "number",
                400,
                "taxRate is required for invoices",
            );
        }

        // Create sale
        const sale = await createSale(
            {
                customerId,
                items,
                channel,
                notes,
                paymentMethod,
                totalAmount,
                totalDiscount,
                totalTax,
                currencyCode: finalCurrencyCode,
                currencySymbol: finalCurrencySymbol,
                taxRate: finalTaxRate,
            },
            userId,
        );

        res.status(CREATED).json({
            data: sale,
            message: "Sale added successfully",
        });
    },
);

export const getSalesStatsHandler = catchErrors(async (req, res) => {
    const userId = req.user?.id;
    appAssert(
        userId,
        UNAUTHORIZED,
        "unathorized, login to get your sales stats",
    );

    const { period = "day" } = req.query;

    const stats = await getSalesStats(period as string, userId);
    res.status(OK).json({
        data: stats,
        message: "stats retrieved successfully",
    });
});

export const getAllSalesHandler = catchErrors(
    async (req: Request, res: Response) => {
        const userId = req.user?.id;
        appAssert(userId, UNAUTHORIZED, "Unathorized, login to get sales data");

        const {
            customerId,
            paymentMethod,
            channel,
            status,
            search,
            sort,
            page = "1",
            limit = "20",
            startDate,
            endDate,
        } = req.query;

        const result = await getSales({
            ownerId: userId,
            customerId: customerId as string | undefined,
            paymentMethod: paymentMethod as string | undefined,
            channel: channel as string | undefined,
            status: status as string | undefined,
            search: search as string | undefined,
            sort: sort as string | undefined,
            page: parseInt(page as string, 10) || 1,
            limit: parseInt(limit as string, 10) || 20,
            startDate: startDate as string | undefined,
            endDate: endDate as string | undefined,
        });
        res.status(OK).json({
            ...result,
            message: "Sales fetched successfully",
        });
    },
);

export const deleteSaleHandler = catchErrors(async (req, res) => {
    const userId = req.user?.id;
    const { saleId } = req.params;

    appAssert(
        userId,
        UNAUTHORIZED,
        "Unathorized, login to perform this action",
    );
    appAssert(saleId, NOT_FOUND, `Sale with id ${saleId} not found`);

    await deleteSale(String(saleId), userId);
    res.status(OK).json({ message: "Saled deleted successfully" });
});
