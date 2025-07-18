import prisma from "../config/db";
import AppError from "../errors/AppError";
import { BAD_REQUEST, NOT_FOUND, UNAUTHORIZED } from "../constants/http";

export const createStockAdjustment = async (
    data: {
        productId: string;
        quantityChange: number;
        reason: string;
        note?: string;
    },
    userId: string,
) => {
    // Validate product exists
    const product = await prisma.product.findUnique({
        where: { id: data.productId },
    });
    if (!product) throw new AppError(NOT_FOUND, "Product not found");
    // Validate stock will not go negative
    const newStock = product.stock + data.quantityChange;
    if (newStock < 0)
        throw new AppError(BAD_REQUEST, "Stock cannot go negative");
    // Update product stock and log adjustment in a transaction
    return await prisma.$transaction(async (tx) => {
        await tx.product.update({
            where: { id: data.productId },
            data: { stock: newStock },
        });
        return tx.stockAdjustment.create({
            data: {
                ...data,
                userId,
            },
        });
    });
};

export const getStockAdjustments = async (filters: any = {}) => {
    const where: any = {};
    if (filters.productId) where.productId = filters.productId;
    if (filters.userId) where.userId = filters.userId;
    if (filters.startDate && filters.endDate) {
        where.createdAt = { gte: filters.startDate, lte: filters.endDate };
    } else if (filters.startDate) {
        where.createdAt = { gte: filters.startDate };
    } else if (filters.endDate) {
        where.createdAt = { lte: filters.endDate };
    }
    return prisma.stockAdjustment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: { product: true, user: true },
    });
};

export const getStockAdjustmentById = async (id: string) => {
    const adj = await prisma.stockAdjustment.findUnique({
        where: { id },
        include: { product: true, user: true },
    });
    if (!adj) throw new AppError(NOT_FOUND, "Stock adjustment not found");
    return adj;
};

export const deleteStockAdjustment = async (id: string, isAdmin: boolean) => {
    if (!isAdmin)
        throw new AppError(UNAUTHORIZED, "Only admin can delete adjustments");
    // Optionally: reverse the stock change (not implemented here)
    return prisma.stockAdjustment.delete({ where: { id } });
};
