import { Request, Response } from "express";
import catchErrors from "../utils/catchErrors";
import { stockAdjustmentSchema } from "../zodSchema/stockAdjustment.zodSchema";
import {
    createStockAdjustment,
    getStockAdjustments,
    getStockAdjustmentById,
    deleteStockAdjustment,
} from "../services/stockAdjustment.service";
import { CREATED, OK } from "../constants/http";
import appAssert from "../utils/appAssert";

export const addStockAdjustmentHandler = catchErrors(
    async (req: Request, res: Response) => {
        const userId = req.user?.id;
        appAssert(userId, 401, "Unauthorized");
        const data = stockAdjustmentSchema.parse(req.body);
        const adj = await createStockAdjustment(data, userId);
        res.status(CREATED).json({
            data: adj,
            message: "Stock adjustment created",
        });
    },
);

export const getStockAdjustmentsHandler = catchErrors(
    async (req: Request, res: Response) => {
        const filters = {
            productId: req.query.productId as string | undefined,
            userId: req.query.userId as string | undefined,
            startDate: req.query.startDate
                ? new Date(req.query.startDate as string)
                : undefined,
            endDate: req.query.endDate
                ? new Date(req.query.endDate as string)
                : undefined,
        };
        const adjs = await getStockAdjustments(filters);
        res.status(OK).json({
            data: adjs,
            message: "Stock adjustments fetched",
        });
    },
);

export const getStockAdjustmentHandler = catchErrors(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const adj = await getStockAdjustmentById(id);
        res.status(OK).json({ data: adj, message: "Stock adjustment fetched" });
    },
);

export const deleteStockAdjustmentHandler = catchErrors(
    async (req: Request, res: Response) => {
        const user = req.user as { id: string; role?: string } | undefined;
        const isAdmin = user?.role === "admin";
        const { id } = req.params;
        await deleteStockAdjustment(id, isAdmin);
        res.status(OK).json({ message: "Stock adjustment deleted" });
    },
);
