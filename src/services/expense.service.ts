import prisma from "../config/db";
import AppError from "../errors/AppError";
import { UNAUTHORIZED, NOT_FOUND } from "../constants/http";
import { add, isEqual, startOfDay, isAfter, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from "date-fns";

export const createExpense = async (data: any, ownerId: string) => {
    return prisma.expense.create({
        data: { ...data, ownerId },
        include: { category: true },
    });
};

export const getExpenses = async (ownerId: string, filters: any = {}) => {
    const where: any = { ownerId };
    
    // Date filtering
    if (filters.startDate && filters.endDate) {
        where.date = { gte: filters.startDate, lte: filters.endDate };
    } else if (filters.startDate) {
        where.date = { gte: filters.startDate };
    } else if (filters.endDate) {
        where.date = { lte: filters.endDate };
    }
    
    // Category filtering
    if (filters.categoryId) where.categoryId = filters.categoryId;
    
    // Status filtering
    if (filters.status) where.status = filters.status;
    
    // Payment method filtering
    if (filters.paymentMethod) where.paymentMethod = filters.paymentMethod;
    
    // Vendor filtering
    if (filters.vendor) {
        where.vendor = { contains: filters.vendor, mode: "insensitive" };
    }
    
    // Recurring expenses filtering
    if (filters.isRecurring !== undefined) {
        where.isRecurring = filters.isRecurring;
    }
    if (filters.recurrenceType) where.recurrenceType = filters.recurrenceType;
    
    // Search functionality
    if (filters.search) {
        where.OR = [
            { description: { contains: filters.search, mode: "insensitive" } },
            { vendor: { contains: filters.search, mode: "insensitive" } },
            { notes: { contains: filters.search, mode: "insensitive" } },
        ];
    }
    
    // Tags filtering
    if (filters.tags && filters.tags.length > 0) {
        where.tags = { hasSome: filters.tags };
    }
    
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
    return prisma.expense.update({ 
        where: { id }, 
        data,
        include: { category: true },
    });
};

export const deleteExpense = async (id: string, ownerId: string) => {
    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense || expense.ownerId !== ownerId)
        throw new AppError(UNAUTHORIZED, "Unauthorized");
    return prisma.expense.delete({ where: { id } });
};

export const approveExpense = async (id: string, ownerId: string, approvedBy: string, notes?: string) => {
    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense || expense.ownerId !== ownerId)
        throw new AppError(UNAUTHORIZED, "Unauthorized");
    
    return prisma.expense.update({
        where: { id },
        data: {
            status: "APPROVED",
            approvedBy,
            approvedAt: new Date(),
            notes: notes ? `${expense.notes || ""}\n\nApproval Notes: ${notes}`.trim() : expense.notes,
        },
        include: { category: true },
    });
};

export const rejectExpense = async (id: string, ownerId: string, notes?: string) => {
    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense || expense.ownerId !== ownerId)
        throw new AppError(UNAUTHORIZED, "Unauthorized");
    
    return prisma.expense.update({
        where: { id },
        data: {
            status: "REJECTED",
            notes: notes ? `${expense.notes || ""}\n\nRejection Notes: ${notes}`.trim() : expense.notes,
        },
        include: { category: true },
    });
};

// Analytics functions
export const getExpenseAnalytics = async (ownerId: string, period: string = "month") => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    
    switch (period) {
        case "week":
            startDate = startOfDay(add(now, { days: -7 }));
            endDate = now;
            break;
        case "month":
            startDate = startOfMonth(now);
            endDate = endOfMonth(now);
            break;
        case "quarter":
            startDate = startOfQuarter(now);
            endDate = endOfQuarter(now);
            break;
        case "year":
            startDate = startOfYear(now);
            endDate = endOfYear(now);
            break;
        default:
            startDate = startOfMonth(now);
            endDate = endOfMonth(now);
    }
    
    const expenses = await prisma.expense.findMany({
        where: {
            ownerId,
            date: { gte: startDate, lte: endDate },
        },
        include: { category: true },
    });
    
    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalCount = expenses.length;
    const pendingCount = expenses.filter(exp => exp.status === "PENDING").length;
    const approvedCount = expenses.filter(exp => exp.status === "APPROVED").length;
    
    // Category breakdown
    const categoryBreakdown = await prisma.expense.groupBy({
        by: ['categoryId'],
        where: {
            ownerId,
            date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
        _count: true,
    });
    
    // Payment method breakdown
    const paymentMethodBreakdown = await prisma.expense.groupBy({
        by: ['paymentMethod'],
        where: {
            ownerId,
            date: { gte: startDate, lte: endDate },
            paymentMethod: { not: null },
        },
        _sum: { amount: true },
        _count: true,
    });
    
    // Vendor breakdown
    const vendorBreakdown = await prisma.expense.groupBy({
        by: ['vendor'],
        where: {
            ownerId,
            date: { gte: startDate, lte: endDate },
            vendor: { not: null },
        },
        _sum: { amount: true },
        _count: true,
        orderBy: { _sum: { amount: 'desc' } },
        take: 10,
    });
    
    return {
        totalAmount,
        totalCount,
        pendingCount,
        approvedCount,
        categoryBreakdown,
        paymentMethodBreakdown,
        vendorBreakdown,
        period: { startDate, endDate },
    };
};

// Budget functions
export const createBudget = async (data: any, ownerId: string) => {
    return prisma.budget.create({
        data: { ...data, ownerId },
        include: { category: true },
    });
};

export const getBudgets = async (ownerId: string, filters: any = {}) => {
    const where: any = { ownerId };
    
    if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
    }
    
    if (filters.categoryId) {
        where.categoryId = filters.categoryId;
    }
    
    if (filters.period) {
        where.period = filters.period;
    }
    
    return prisma.budget.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: "desc" },
    });
};

export const getBudgetAnalytics = async (ownerId: string) => {
    const budgets = await prisma.budget.findMany({
        where: { ownerId, isActive: true },
        include: { category: true },
    });
    
    const budgetAnalytics = await Promise.all(
        budgets.map(async (budget) => {
            const expenses = await prisma.expense.findMany({
                where: {
                    ownerId,
                    categoryId: budget.categoryId,
                    date: { gte: budget.startDate, lte: budget.endDate },
                    status: "APPROVED",
                },
            });
            
            const spent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
            const utilization = (spent / budget.allocated) * 100;
            
            let status: "on-track" | "warning" | "exceeded";
            if (utilization >= 100) {
                status = "exceeded";
            } else if (utilization >= 80) {
                status = "warning";
            } else {
                status = "on-track";
            }
            
            return {
                ...budget,
                spent,
                utilization,
                status,
                remaining: budget.allocated - spent,
            };
        })
    );
    
    return budgetAnalytics;
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
                vendor: exp.vendor,
                paymentMethod: exp.paymentMethod,
                status: "PENDING",
                date: exp.nextDueDate as Date, // safe, since we checked above
                isRecurring: false, // The generated instance is not itself recurring
                recurrenceType: null,
                nextDueDate: null,
                tags: exp.tags,
                notes: exp.notes,
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
