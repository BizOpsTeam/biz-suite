import { Request, Response } from "express";
import catchErrors from "../utils/catchErrors";
import { expenseSchema } from "../zodSchema/expense.zodSchema";
import {
    createExpense,
    getExpenses,
    getExpenseById,
    updateExpense,
    deleteExpense,
} from "../services/expense.service";
import { CREATED, OK } from "../constants/http";
import appAssert from "../utils/appAssert";

export const addExpenseHandler = catchErrors(async (req: Request, res: Response) => {
    const ownerId = req.user?.id;
    appAssert(ownerId, 401, "Unauthorized");
    const data = expenseSchema.parse(req.body);
    const expense = await createExpense(data, ownerId);
    res.status(CREATED).json({ data: expense, message: "Expense created" });
});

export const getExpensesHandler = catchErrors(async (req: Request, res: Response) => {
    const ownerId = req.user?.id;
    appAssert(ownerId, 401, "Unauthorized");
    const filters = {
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        categoryId: req.query.categoryId as string | undefined,
        isRecurring: req.query.isRecurring !== undefined ? req.query.isRecurring === "true" : undefined,
        recurrenceType: req.query.recurrenceType as string | undefined,
        search: req.query.search as string | undefined,
    };
    const expenses = await getExpenses(ownerId, filters);
    res.status(OK).json({ data: expenses, message: "Expenses fetched" });
});

export const getExpenseHandler = catchErrors(async (req: Request, res: Response) => {
    const ownerId = req.user?.id;
    appAssert(ownerId, 401, "Unauthorized");
    const { id } = req.params;
    const expense = await getExpenseById(id, ownerId);
    res.status(OK).json({ data: expense, message: "Expense fetched" });
});

export const updateExpenseHandler = catchErrors(async (req: Request, res: Response) => {
    const ownerId = req.user?.id;
    appAssert(ownerId, 401, "Unauthorized");
    const { id } = req.params;
    const data = expenseSchema.partial().parse(req.body);
    const expense = await updateExpense(id, ownerId, data);
    res.status(OK).json({ data: expense, message: "Expense updated" });
});

export const deleteExpenseHandler = catchErrors(async (req: Request, res: Response) => {
    const ownerId = req.user?.id;
    appAssert(ownerId, 401, "Unauthorized");
    const { id } = req.params;
    await deleteExpense(id, ownerId);
    res.status(OK).json({ message: "Expense deleted" });
}); 