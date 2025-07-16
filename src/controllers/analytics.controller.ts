import { Request, Response, NextFunction } from "express";
import {
    getTopProducts,
    getSalesOverTime,
    getSalesByChannel,
    getSalesByPaymentMethod,
    getTopCustomers,
    getAverageOrderValue,
    getDiscountImpact,
    getStockouts,
    getSlowMovingInventory,
    getSalesForecast,
    getProductSalesForecast,
    getStockoutForecast,
    getSeasonality,
} from "../services/analytics.service";
import catchErrors from "../utils/catchErrors";

export const getTopProductsHandler = catchErrors(
    async (req: Request, res: Response) => {
        const limit = req.query.limit
            ? parseInt(req.query.limit as string, 10)
            : 10;
        const period = (req.query.period as string) || "month";
        const startDate = req.query.startDate
            ? new Date(req.query.startDate as string)
            : undefined;
        const endDate = req.query.endDate
            ? new Date(req.query.endDate as string)
            : undefined;

        if (
            period === "custom" &&
            (!startDate ||
                !endDate ||
                isNaN(startDate.getTime()) ||
                isNaN(endDate.getTime()))
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "For custom period, valid startDate and endDate are required.",
            });
        }

        const products = await getTopProducts({
            limit,
            period,
            startDate,
            endDate,
        });
        res.json({ success: true, data: products });
    },
);

export const getSalesOverTimeHandler = catchErrors(
    async (req: Request, res: Response) => {
        const period = (req.query.period as string) || "month";
        const startDate = req.query.startDate
            ? new Date(req.query.startDate as string)
            : undefined;
        const endDate = req.query.endDate
            ? new Date(req.query.endDate as string)
            : undefined;
        const data = await getSalesOverTime({ period, startDate, endDate });
        res.json({ success: true, data });
    },
);

export const getSalesByChannelHandler = catchErrors(
    async (req: Request, res: Response) => {
        const period = (req.query.period as string) || "month";
        const startDate = req.query.startDate
            ? new Date(req.query.startDate as string)
            : undefined;
        const endDate = req.query.endDate
            ? new Date(req.query.endDate as string)
            : undefined;
        const data = await getSalesByChannel({ period, startDate, endDate });
        res.json({ success: true, data });
    },
);

export const getSalesByPaymentMethodHandler = catchErrors(
    async (req: Request, res: Response) => {
        const period = (req.query.period as string) || "month";
        const startDate = req.query.startDate
            ? new Date(req.query.startDate as string)
            : undefined;
        const endDate = req.query.endDate
            ? new Date(req.query.endDate as string)
            : undefined;
        const data = await getSalesByPaymentMethod({
            period,
            startDate,
            endDate,
        });
        res.json({ success: true, data });
    },
);

export const getTopCustomersHandler = catchErrors(
    async (req: Request, res: Response) => {
        const limit = req.query.limit
            ? parseInt(req.query.limit as string, 10)
            : 10;
        const period = (req.query.period as string) || "month";
        const startDate = req.query.startDate
            ? new Date(req.query.startDate as string)
            : undefined;
        const endDate = req.query.endDate
            ? new Date(req.query.endDate as string)
            : undefined;
        const data = await getTopCustomers({
            limit,
            period,
            startDate,
            endDate,
        });
        res.json({ success: true, data });
    },
);

export const getAverageOrderValueHandler = catchErrors(
    async (req: Request, res: Response) => {
        const period = (req.query.period as string) || "month";
        const startDate = req.query.startDate
            ? new Date(req.query.startDate as string)
            : undefined;
        const endDate = req.query.endDate
            ? new Date(req.query.endDate as string)
            : undefined;
        const data = await getAverageOrderValue({ period, startDate, endDate });
        res.json({ success: true, data });
    },
);

export const getDiscountImpactHandler = catchErrors(
    async (req: Request, res: Response) => {
        const period = (req.query.period as string) || "month";
        const startDate = req.query.startDate
            ? new Date(req.query.startDate as string)
            : undefined;
        const endDate = req.query.endDate
            ? new Date(req.query.endDate as string)
            : undefined;
        const data = await getDiscountImpact({ period, startDate, endDate });
        res.json({ success: true, data });
    },
);

export const getStockoutsHandler = catchErrors(
    async (req: Request, res: Response) => {
        const period = (req.query.period as string) || "month";
        const startDate = req.query.startDate
            ? new Date(req.query.startDate as string)
            : undefined;
        const endDate = req.query.endDate
            ? new Date(req.query.endDate as string)
            : undefined;
        const data = await getStockouts({ period, startDate, endDate });
        res.json({ success: true, data });
    },
);

export const getSlowMovingInventoryHandler = catchErrors(
    async (req: Request, res: Response) => {
        const period = (req.query.period as string) || "month";
        const startDate = req.query.startDate
            ? new Date(req.query.startDate as string)
            : undefined;
        const endDate = req.query.endDate
            ? new Date(req.query.endDate as string)
            : undefined;
        const threshold = req.query.threshold
            ? parseInt(req.query.threshold as string, 10)
            : 5;
        const data = await getSlowMovingInventory({
            period,
            startDate,
            endDate,
            threshold,
        });
        res.json({ success: true, data });
    },
);

export const getSalesForecastHandler = catchErrors(
    async (req: Request, res: Response) => {
        const period = (req.query.period as string) || "month";
        const horizon = req.query.horizon
            ? parseInt(req.query.horizon as string, 10)
            : 3;
        const method = (req.query.method as string) || "auto"; // 'moving-average', 'linear', or 'auto'
        const data = await getSalesForecast({ period, horizon, method });
        res.json({ success: true, data });
    },
);

export const getProductSalesForecastHandler = catchErrors(
    async (req: Request, res: Response) => {
        const period = (req.query.period as string) || "month";
        const horizon = req.query.horizon
            ? parseInt(req.query.horizon as string, 10)
            : 3;
        const method = (req.query.method as string) || "auto";
        const productId = req.query.productId as string | undefined;
        const data = await getProductSalesForecast({
            period,
            horizon,
            method,
            productId,
        });
        res.json({ success: true, data });
    },
);

export const getStockoutForecastHandler = catchErrors(
    async (req: Request, res: Response) => {
        const period = (req.query.period as string) || "month";
        const horizon = req.query.horizon
            ? parseInt(req.query.horizon as string, 10)
            : 3;
        const method = (req.query.method as string) || "auto";
        const data = await getStockoutForecast({ period, horizon, method });
        res.json({ success: true, data });
    },
);

export const getSeasonalityHandler = catchErrors(
    async (req: Request, res: Response) => {
        const period = (req.query.period as string) || "month";
        const productId = req.query.productId as string | undefined;
        const data = await getSeasonality({ period, productId });
        res.json({ success: true, data });
    },
);
