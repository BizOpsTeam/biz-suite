import prisma from "../config/db";
import AppError from "../errors/AppError";
import { UNAUTHORIZED, NOT_FOUND } from "../constants/http";
import { startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from "date-fns";
import { BudgetPeriod } from "@prisma/client";

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

export const getBudgetById = async (id: string, ownerId: string) => {
    const budget = await prisma.budget.findUnique({
        where: { id },
        include: { category: true },
    });
    if (!budget || budget.ownerId !== ownerId)
        throw new AppError(NOT_FOUND, "Budget not found");
    return budget;
};

export const updateBudget = async (id: string, ownerId: string, data: any) => {
    const budget = await prisma.budget.findUnique({ where: { id } });
    if (!budget || budget.ownerId !== ownerId)
        throw new AppError(UNAUTHORIZED, "Unauthorized");
    
    return prisma.budget.update({
        where: { id },
        data,
        include: { category: true },
    });
};

export const deleteBudget = async (id: string, ownerId: string) => {
    const budget = await prisma.budget.findUnique({ where: { id } });
    if (!budget || budget.ownerId !== ownerId)
        throw new AppError(UNAUTHORIZED, "Unauthorized");
    
    return prisma.budget.delete({ where: { id } });
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

export const createBudgetPeriod = async (categoryId: string, allocated: number, period: string, ownerId: string) => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    
    switch (period) {
        case "MONTHLY":
            startDate = startOfMonth(now);
            endDate = endOfMonth(now);
            break;
        case "QUARTERLY":
            startDate = startOfQuarter(now);
            endDate = endOfQuarter(now);
            break;
        case "YEARLY":
            startDate = startOfYear(now);
            endDate = endOfYear(now);
            break;
        default:
            startDate = startOfMonth(now);
            endDate = endOfMonth(now);
    }
    
    return prisma.budget.create({
        data: {
            categoryId,
            allocated,
            period: period as BudgetPeriod,
            startDate,
            endDate,
            ownerId,
        },
        include: { category: true },
    });
}; 