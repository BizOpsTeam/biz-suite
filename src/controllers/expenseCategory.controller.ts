import { Request, Response } from "express";
import catchErrors from "../utils/catchErrors";
import { expenseCategorySchema } from "../zodSchema/expenseCategory.zodSchema";
import {
    createExpenseCategory,
    getExpenseCategories,
    getExpenseCategoryById,
    updateExpenseCategory,
    deleteExpenseCategory,
} from "../services/expenseCategory.service";
import { CREATED, OK } from "../constants/http";
import appAssert from "../utils/appAssert";

export const addExpenseCategoryHandler = catchErrors(async (req: Request, res: Response) => {
    const ownerId = req.user?.id;
    appAssert(ownerId, 401, "Unauthorized");
    const data = expenseCategorySchema.parse(req.body);
    const category = await createExpenseCategory(data, ownerId);
    res.status(CREATED).json({ data: category, message: "Category created" });
});

export const getExpenseCategoriesHandler = catchErrors(async (req: Request, res: Response) => {
    const ownerId = req.user?.id;
    appAssert(ownerId, 401, "Unauthorized");
    const categories = await getExpenseCategories(ownerId);
    res.status(OK).json({ data: categories, message: "Categories fetched" });
});

export const getExpenseCategoryHandler = catchErrors(async (req: Request, res: Response) => {
    const ownerId = req.user?.id;
    appAssert(ownerId, 401, "Unauthorized");
    const { id } = req.params;
    const category = await getExpenseCategoryById(id, ownerId);
    res.status(OK).json({ data: category, message: "Category fetched" });
});

export const updateExpenseCategoryHandler = catchErrors(async (req: Request, res: Response) => {
    const ownerId = req.user?.id;
    appAssert(ownerId, 401, "Unauthorized");
    const { id } = req.params;
    const data = expenseCategorySchema.partial().parse(req.body);
    const category = await updateExpenseCategory(id, ownerId, data);
    res.status(OK).json({ data: category, message: "Category updated" });
});

export const deleteExpenseCategoryHandler = catchErrors(async (req: Request, res: Response) => {
    const ownerId = req.user?.id;
    appAssert(ownerId, 401, "Unauthorized");
    const { id } = req.params;
    await deleteExpenseCategory(id, ownerId);
    res.status(OK).json({ message: "Category deleted" });
}); 