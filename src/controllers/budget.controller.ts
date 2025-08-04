import { Request, Response } from "express";
import catchErrors from "../utils/catchErrors";
import { budgetSchema, budgetUpdateSchema } from "../zodSchema/budget.zodSchema";
import {
    createBudget,
    getBudgets,
    getBudgetById,
    updateBudget,
    deleteBudget,
    getBudgetAnalytics,
    createBudgetPeriod,
} from "../services/budget.service";
import { CREATED, OK } from "../constants/http";
import appAssert from "../utils/appAssert";

export const addBudgetHandler = catchErrors(
    async (req: Request, res: Response) => {
        const ownerId = req.user?.id;
        appAssert(ownerId, 401, "Unauthorized");
        const data = budgetSchema.parse(req.body);
        const budget = await createBudget(data, ownerId);
        res.status(CREATED).json({ data: budget, message: "Budget created" });
    },
);

export const getBudgetsHandler = catchErrors(
    async (req: Request, res: Response) => {
        const ownerId = req.user?.id;
        appAssert(ownerId, 401, "Unauthorized");
        const filters = {
            isActive: req.query.isActive !== undefined ? req.query.isActive === "true" : undefined,
            categoryId: req.query.categoryId as string | undefined,
            period: req.query.period as string | undefined,
        };
        const budgets = await getBudgets(ownerId, filters);
        res.status(OK).json({ data: budgets, message: "Budgets fetched" });
    },
);

export const getBudgetHandler = catchErrors(
    async (req: Request, res: Response) => {
        const ownerId = req.user?.id;
        appAssert(ownerId, 401, "Unauthorized");
        const { id } = req.params;
        const budget = await getBudgetById(id, ownerId);
        res.status(OK).json({ data: budget, message: "Budget fetched" });
    },
);

export const updateBudgetHandler = catchErrors(
    async (req: Request, res: Response) => {
        const ownerId = req.user?.id;
        appAssert(ownerId, 401, "Unauthorized");
        const { id } = req.params;
        const data = budgetUpdateSchema.parse(req.body);
        const budget = await updateBudget(id, ownerId, data);
        res.status(OK).json({ data: budget, message: "Budget updated" });
    },
);

export const deleteBudgetHandler = catchErrors(
    async (req: Request, res: Response) => {
        const ownerId = req.user?.id;
        appAssert(ownerId, 401, "Unauthorized");
        const { id } = req.params;
        await deleteBudget(id, ownerId);
        res.status(OK).json({ message: "Budget deleted" });
    },
);

export const getBudgetAnalyticsHandler = catchErrors(
    async (req: Request, res: Response) => {
        const ownerId = req.user?.id;
        appAssert(ownerId, 401, "Unauthorized");
        const analytics = await getBudgetAnalytics(ownerId);
        res.status(OK).json({ data: analytics, message: "Budget analytics fetched" });
    },
);

export const createBudgetPeriodHandler = catchErrors(
    async (req: Request, res: Response) => {
        const ownerId = req.user?.id;
        appAssert(ownerId, 401, "Unauthorized");
        const { categoryId, allocated, period } = req.body;
        appAssert(categoryId, 400, "Category ID is required");
        appAssert(allocated, 400, "Allocated amount is required");
        appAssert(period, 400, "Period is required");
        
        const budget = await createBudgetPeriod(categoryId, allocated, period, ownerId);
        res.status(CREATED).json({ data: budget, message: "Budget period created" });
    },
); 