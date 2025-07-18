import prisma from "../config/db";
import AppError from "../errors/AppError";
import { UNAUTHORIZED, NOT_FOUND } from "../constants/http";
import { add, isEqual, startOfDay, isAfter } from "date-fns";

export const createExpense = async (data: any, ownerId: string) => {
    return prisma.expense.create({
        data: { ...data, ownerId },
    });
};

export const getExpenses = async (ownerId: string, filters: any = {}) => {
    const where: any = { ownerId };
    if (filters.startDate && filters.endDate) {
        where.date = { gte: filters.startDate, lte: filters.endDate };
    } else if (filters.startDate) {
        where.date = { gte: filters.startDate };
    } else if (filters.endDate) {
        where.date = { lte: filters.endDate };
    }
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.isRecurring !== undefined)
        where.isRecurring = filters.isRecurring;
    if (filters.recurrenceType) where.recurrenceType = filters.recurrenceType;
    if (filters.search)
        where.description = { contains: filters.search, mode: "insensitive" };
    return prisma.expense.findMany({
        where,
        orderBy: { date: "desc" },
        include: { category: true },
    });
};

export const getExpenseById = async (id: string, ownerId: string) => {
    const expense = await prisma.expense.findUnique({
        where: { id },
        include: { category: true },
    });
    if (!expense || expense.ownerId !== ownerId)
        throw new AppError(NOT_FOUND, "Expense not found");
    return expense;
};

export const updateExpense = async (id: string, ownerId: string, data: any) => {
    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense || expense.ownerId !== ownerId)
        throw new AppError(UNAUTHORIZED, "Unauthorized");
    return prisma.expense.update({ where: { id }, data });
};

export const deleteExpense = async (id: string, ownerId: string) => {
    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense || expense.ownerId !== ownerId)
        throw new AppError(UNAUTHORIZED, "Unauthorized");
    return prisma.expense.delete({ where: { id } });
};

export const processRecurringExpenses = async () => {
    const today = startOfDay(new Date());
    // Find all recurring expenses due today or earlier
    const dueExpenses = await prisma.expense.findMany({
        where: {
            isRecurring: true,
            nextDueDate: { lte: today },
        },
    });
    for (const exp of dueExpenses) {
        if (!exp.nextDueDate) continue; // skip if nextDueDate is null
        // Create a new expense record (copy, but with new date)
        await prisma.expense.create({
            data: {
                ownerId: exp.ownerId,
                amount: exp.amount,
                categoryId: exp.categoryId,
                description: exp.description,
                date: exp.nextDueDate as Date, // safe, since we checked above
                isRecurring: false, // The generated instance is not itself recurring
                recurrenceType: null,
                nextDueDate: null,
            },
        });
        // Calculate next due date
        let nextDue: Date | undefined = undefined;
        if (exp.recurrenceType === "DAILY")
            nextDue = add(exp.nextDueDate, { days: 1 });
        if (exp.recurrenceType === "WEEKLY")
            nextDue = add(exp.nextDueDate, { weeks: 1 });
        if (exp.recurrenceType === "MONTHLY")
            nextDue = add(exp.nextDueDate, { months: 1 });
        if (exp.recurrenceType === "YEARLY")
            nextDue = add(exp.nextDueDate, { years: 1 });
        // Only update if nextDue is a valid Date in the future
        if (nextDue) {
            if (isAfter(nextDue, today) || isEqual(nextDue, today)) {
                await prisma.expense.update({
                    where: { id: exp.id },
                    data: { nextDueDate: nextDue },
                });
            }
        }
    }
};
