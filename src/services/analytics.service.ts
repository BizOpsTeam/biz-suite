import prisma from "../config/db";
import { subWeeks, subMonths, subYears, startOfDay, endOfDay } from "date-fns";

interface AnalyticsOptions {
    limit?: number;
    period?: string;
    startDate?: Date;
    endDate?: Date;
    ownerId?: string;
}

function getDateRange(period: string, startDate?: Date, endDate?: Date) {
    let rangeStart: Date | undefined = undefined;
    let rangeEnd: Date | undefined = undefined;
    const now = new Date();
    switch (period) {
        case "day":
            rangeStart = startOfDay(now);
            rangeEnd = endOfDay(now);
            break;
        case "week":
            rangeStart = subWeeks(now, 1);
            rangeEnd = now;
            break;
        case "month":
            rangeStart = subMonths(now, 1);
            rangeEnd = now;
            break;
        case "year":
            rangeStart = subYears(now, 1);
            rangeEnd = now;
            break;
        case "custom":
            rangeStart = startDate;
            rangeEnd = endDate;
            break;
        default:
            rangeStart = subMonths(now, 1);
            rangeEnd = now;
    }
    return { rangeStart, rangeEnd };
}

function linearRegression(data: number[]): {
    slope: number;
    intercept: number;
} {
    const n = data.length;
    if (n === 0) return { slope: 0, intercept: 0 };
    const sumX = (n * (n - 1)) / 2;
    const sumY = data.reduce((a, b) => a + b, 0);
    const sumXY = data.reduce((sum, y, x) => sum + x * y, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    return { slope, intercept };
}

function forecastNext(
    data: number[],
    horizon: number,
    method: string,
): number[] {
    if (data.length === 0) return Array(horizon).fill(0);
    if (method === "moving-average") {
        const avg =
            data.slice(-horizon).reduce((a, b) => a + b, 0) /
            Math.min(horizon, data.length);
        return Array(horizon).fill(avg);
    } else if (method === "linear") {
        const { slope, intercept } = linearRegression(data);
        return Array.from(
            { length: horizon },
            (_, i) => slope * (data.length + i) + intercept,
        );
    } else {
        // auto: use linear if trend, else moving average
        const { slope } = linearRegression(data);
        if (Math.abs(slope) > 0.01) {
            return forecastNext(data, horizon, "linear");
        } else {
            return forecastNext(data, horizon, "moving-average");
        }
    }
}

export async function getTopProducts(options: AnalyticsOptions = {}) {
    const { limit = 10, period = "month", startDate, endDate, ownerId } = options;
    const { rangeStart, rangeEnd } = getDateRange(period, startDate, endDate);
    const sales = await prisma.sale.findMany({
        where: {
            ...(ownerId && { ownerId }),
            createdAt: {
                ...(rangeStart && { gte: rangeStart }),
                ...(rangeEnd && { lte: rangeEnd }),
            },
        },
        include: {
            saleItems: {
                include: {
                    product: true,
                },
            },
        },
    });
    const productMap: Record<
        string,
        {
            product: any;
            totalSold: number;
            totalRevenue: number;
            timesSold: number;
        }
    > = {};
    for (const sale of sales) {
        for (const item of sale.saleItems) {
            if (!productMap[item.productId]) {
                productMap[item.productId] = {
                    product: item.product,
                    totalSold: 0,
                    totalRevenue: 0,
                    timesSold: 0,
                };
            }
            productMap[item.productId].totalSold += item.quantity;
            productMap[item.productId].totalRevenue += item.price * item.quantity;
            productMap[item.productId].timesSold += 1;
        }
    }
    const products = Object.values(productMap)
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, limit)
        .map(({ product, totalSold, totalRevenue, timesSold }) => ({
            productId: product.id,
            name: product.name,
            totalSold,
            totalRevenue,
            timesSold,
            product,
        }));
    return products;
}

export async function getSalesOverTime(options: AnalyticsOptions = {}) {
    const { period = "month", startDate, endDate, ownerId } = options;
    const { rangeStart, rangeEnd } = getDateRange(period, startDate, endDate);
    const sales = await prisma.sale.findMany({
        where: {
            ...(ownerId && { ownerId }),
            createdAt: {
                ...(rangeStart && { gte: rangeStart }),
                ...(rangeEnd && { lte: rangeEnd }),
            },
        },
        orderBy: { createdAt: "asc" },
    });
    // Group by day/week/month/year
    const groupBy: Record<string, number> = {};
    for (const sale of sales) {
        let key = "";
        const date = sale.createdAt;
        if (period === "day") {
            key = date.toISOString().slice(0, 10);
        } else if (period === "week") {
            const week = new Date(date);
            week.setDate(date.getDate() - date.getDay());
            key = week.toISOString().slice(0, 10);
        } else if (period === "month") {
            key =
                date.getFullYear() +
                "-" +
                String(date.getMonth() + 1).padStart(2, "0");
        } else if (period === "year") {
            key = String(date.getFullYear());
        } else {
            key = date.toISOString().slice(0, 10);
        }
        groupBy[key] = (groupBy[key] || 0) + sale.totalAmount;
    }
    return Object.entries(groupBy).map(([period, totalAmount]) => ({
        period,
        totalAmount,
    }));
}

export async function getSalesByChannel(options: AnalyticsOptions = {}) {
    const { period = "month", startDate, endDate, ownerId } = options;
    const { rangeStart, rangeEnd } = getDateRange(period, startDate, endDate);
    const sales = await prisma.sale.findMany({
        where: {
            ...(ownerId && { ownerId }),
            createdAt: {
                ...(rangeStart && { gte: rangeStart }),
                ...(rangeEnd && { lte: rangeEnd }),
            },
        },
    });
    const channelMap: Record<string, number> = {};
    for (const sale of sales) {
        channelMap[sale.channel] =
            (channelMap[sale.channel] || 0) + sale.totalAmount;
    }
    return Object.entries(channelMap).map(([channel, totalAmount]) => ({
        channel,
        totalAmount,
    }));
}

export async function getSalesByPaymentMethod(options: AnalyticsOptions = {}) {
    const { period = "month", startDate, endDate, ownerId } = options;
    const { rangeStart, rangeEnd } = getDateRange(period, startDate, endDate);
    const sales = await prisma.sale.findMany({
        where: {
            ...(ownerId && { ownerId }),
            createdAt: {
                ...(rangeStart && { gte: rangeStart }),
                ...(rangeEnd && { lte: rangeEnd }),
            },
        },
    });
    const methodMap: Record<string, number> = {};
    for (const sale of sales) {
        methodMap[sale.paymentMethod] =
            (methodMap[sale.paymentMethod] || 0) + sale.totalAmount;
    }
    return Object.entries(methodMap).map(([paymentMethod, totalAmount]) => ({
        paymentMethod,
        totalAmount,
    }));
}

export async function getTopCustomers(options: AnalyticsOptions = {}) {
    const { limit = 10, period = "month", startDate, endDate, ownerId } = options;
    const { rangeStart, rangeEnd } = getDateRange(period, startDate, endDate);
    const sales = await prisma.sale.findMany({
        where: {
            ...(ownerId && { ownerId }),
            createdAt: {
                ...(rangeStart && { gte: rangeStart }),
                ...(rangeEnd && { lte: rangeEnd }),
            },
        },
        include: { customer: true },
    });
    const customerMap: Record<
        string,
        { customer: any; totalSpent: number; salesCount: number }
    > = {};
    for (const sale of sales) {
        if (!sale.customerId) continue;
        if (!customerMap[sale.customerId]) {
            customerMap[sale.customerId] = {
                customer: sale.customer,
                totalSpent: 0,
                salesCount: 0,
            };
        }
        customerMap[sale.customerId].totalSpent += sale.totalAmount;
        customerMap[sale.customerId].salesCount += 1;
    }
    const customers = Object.values(customerMap)
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, limit)
        .map(({ customer, totalSpent, salesCount }) => ({
            customerId: customer.id,
            name: customer.name,
            email: customer.email,
            totalSpent,
            salesCount,
            customer,
        }));
    return customers;
}

export async function getAverageOrderValue(options: AnalyticsOptions = {}) {
    const { period = "month", startDate, endDate, ownerId } = options;
    const { rangeStart, rangeEnd } = getDateRange(period, startDate, endDate);
    const sales = await prisma.sale.findMany({
        where: {
            ...(ownerId && { ownerId }),
            createdAt: {
                ...(rangeStart && { gte: rangeStart }),
                ...(rangeEnd && { lte: rangeEnd }),
            },
        },
    });
    const totalAmount = sales.reduce(
        (sum: number, sale: any) => sum + sale.totalAmount,
        0,
    );
    const count = sales.length;
    return {
        averageOrderValue: count ? totalAmount / count : 0,
        totalOrders: count,
        totalAmount,
    };
}

export async function getDiscountImpact(options: AnalyticsOptions = {}) {
    const { period = "month", startDate, endDate, ownerId } = options;
    const { rangeStart, rangeEnd } = getDateRange(period, startDate, endDate);
    const sales = await prisma.sale.findMany({
        where: {
            ...(ownerId && { ownerId }),
            createdAt: {
                ...(rangeStart && { gte: rangeStart }),
                ...(rangeEnd && { lte: rangeEnd }),
            },
        },
    });
    const totalDiscount = sales.reduce(
        (sum: number, sale: any) => sum + sale.discount,
        0,
    );
    const totalAmount = sales.reduce(
        (sum: number, sale: any) => sum + sale.totalAmount,
        0,
    );
    const count = sales.length;
    return {
        totalDiscount,
        averageDiscount: count ? totalDiscount / count : 0,
        discountRate: totalAmount ? totalDiscount / totalAmount : 0,
        totalAmount,
        totalOrders: count,
    };
}

export async function getStockouts(options: AnalyticsOptions = {}) {
    const { period = "month", startDate, endDate, ownerId } = options;
    const { rangeStart, rangeEnd } = getDateRange(period, startDate, endDate);
    // Find products that have hit stock=0 at any point in the period
    // This requires a StockoutLog table for full accuracy, but as a proxy, we can return products with stock=0 now and last sale in period
    const products = await prisma.product.findMany({
        where: {
            ...(ownerId && { ownerId }),
            stock: 0,
            saleItems: {
                some: {
                    sale: {
                        createdAt: {
                            ...(rangeStart && { gte: rangeStart }),
                            ...(rangeEnd && { lte: rangeEnd }),
                        },
                    },
                },
            },
        },
        include: {
            saleItems: {
                where: {
                    sale: {
                        createdAt: {
                            ...(rangeStart && { gte: rangeStart }),
                            ...(rangeEnd && { lte: rangeEnd }),
                        },
                    },
                },
            },
        },
    });
    // Estimate lost sales as average sales per period for this product
    const stockouts = products.map((product) => {
        const totalSold = product.saleItems.reduce(
            (sum: number, si: any) => sum + si.quantity,
            0,
        );
        return {
            productId: product.id,
            name: product.name,
            stock: product.stock,
            lastSold: product.saleItems.length
                ? product.saleItems[product.saleItems.length - 1].createdAt
                : null,
            totalSold,
            estimatedLostSales:
                product.stock === 0 ? Math.round(totalSold * 0.1) : 0, // crude estimate
            product,
        };
    });
    return stockouts;
}

export async function getSlowMovingInventory(
    options: AnalyticsOptions & { threshold?: number } = {},
) {
    const { period = "month", startDate, endDate, threshold = 5, ownerId } = options;
    const { rangeStart, rangeEnd } = getDateRange(period, startDate, endDate);
    // Find all products
    const products = await prisma.product.findMany({
        where: {
            ...(ownerId && { ownerId }),
        },
        include: {
            saleItems: {
                where: {
                    sale: {
                        createdAt: {
                            ...(rangeStart && { gte: rangeStart }),
                            ...(rangeEnd && { lte: rangeEnd }),
                        },
                    },
                },
            },
        },
    });
    // Filter products with sales below threshold
    const slowMoving = products
        .map((product) => {
            const totalSold = product.saleItems.reduce(
                (sum: number, si: any) => sum + si.quantity,
                0,
            );
            return {
                productId: product.id,
                name: product.name,
                stock: product.stock,
                totalSold,
                product,
            };
        })
        .filter((p) => p.totalSold < threshold);
    return slowMoving;
}

export async function getSalesForecast({
    period = "month",
    horizon = 3,
    method = "auto",
    ownerId,
}: {
    period?: string;
    horizon?: number;
    method?: string;
    ownerId?: string;
}) {
    // Aggregate sales by period
    const sales = await getSalesOverTime({ period, ownerId });
    const history = sales.map((s) => s.totalAmount);
    const forecast = forecastNext(history, horizon, method);
    const lastPeriod =
        sales.length > 0 ? sales[sales.length - 1].period : undefined;
    return forecast.map((value, i) => ({
        period: lastPeriod ? `${lastPeriod}+${i + 1}` : `future+${i + 1}`,
        forecast: value,
    }));
}

export async function getProductSalesForecast({
    period = "month",
    horizon = 3,
    method = "auto",
    productId,
    ownerId,
}: {
    period?: string;
    horizon?: number;
    method?: string;
    productId?: string;
    ownerId?: string;
}) {
    // Aggregate sales by period for each product
    let products: any[] = [];
    if (productId) {
        products = [
            await prisma.product.findUnique({ where: { id: productId } }),
        ].filter(Boolean);
    } else {
        products = await prisma.product.findMany({
            where: {
                ...(ownerId && { ownerId }),
            },
        });
    }
    const results = await Promise.all(
        products.map(async (product) => {
            const saleItems = await prisma.saleItem.findMany({
                where: { productId: product.id },
                include: { sale: true },
            });
            // Group by period
            const periodMap: Record<string, number> = {};
            for (const item of saleItems) {
                let key = "";
                const date = item.sale.createdAt;
                if (period === "day") {
                    key = date.toISOString().slice(0, 10);
                } else if (period === "week") {
                    const week = new Date(date);
                    week.setDate(date.getDate() - date.getDay());
                    key = week.toISOString().slice(0, 10);
                } else if (period === "month") {
                    key =
                        date.getFullYear() +
                        "-" +
                        String(date.getMonth() + 1).padStart(2, "0");
                } else if (period === "year") {
                    key = String(date.getFullYear());
                } else {
                    key = date.toISOString().slice(0, 10);
                }
                periodMap[key] = (periodMap[key] || 0) + item.quantity;
            }
            const history = Object.values(periodMap);
            const forecast = forecastNext(history, horizon, method);
            return {
                productId: product.id,
                name: product.name,
                forecast: forecast.map((value, i) => ({
                    period: `future+${i + 1}`,
                    forecast: value,
                })),
                history: Object.entries(periodMap).map(([period, value]) => ({
                    period,
                    value,
                })),
                product,
            };
        }),
    );
    return results;
}

export async function getStockoutForecast({
    period = "month",
    horizon = 3,
    method = "auto",
    ownerId,
}: {
    period?: string;
    horizon?: number;
    method?: string;
    ownerId?: string;
}) {
    // For each product, forecast sales and compare to current stock
    const products = await prisma.product.findMany({
        where: {
            ...(ownerId && { ownerId }),
        },
    });
    const results = await Promise.all(
        products.map(async (product) => {
            const saleItems = await prisma.saleItem.findMany({
                where: { productId: product.id },
                include: { sale: true },
            });
            // Group by period
            const periodMap: Record<string, number> = {};
            for (const item of saleItems) {
                let key = "";
                const date = item.sale.createdAt;
                if (period === "day") {
                    key = date.toISOString().slice(0, 10);
                } else if (period === "week") {
                    const week = new Date(date);
                    week.setDate(date.getDate() - date.getDay());
                    key = week.toISOString().slice(0, 10);
                } else if (period === "month") {
                    key =
                        date.getFullYear() +
                        "-" +
                        String(date.getMonth() + 1).padStart(2, "0");
                } else if (period === "year") {
                    key = String(date.getFullYear());
                } else {
                    key = date.toISOString().slice(0, 10);
                }
                periodMap[key] = (periodMap[key] || 0) + item.quantity;
            }
            const history = Object.values(periodMap);
            const forecast = forecastNext(history, horizon, method);
            const totalForecast = forecast.reduce((a, b) => a + b, 0);
            const atRisk = product.stock < totalForecast;
            return {
                productId: product.id,
                name: product.name,
                stock: product.stock,
                forecast,
                totalForecast,
                atRisk,
                product,
            };
        }),
    );
    return results.filter((r) => r.atRisk);
}

export async function getSeasonality({
    period = "month",
    productId,
    ownerId,
}: {
    period?: string;
    productId?: string;
    ownerId?: string;
}) {
    // Get sales or saleItems for the product or all products
    let sales: any[] = [];
    if (productId) {
        const saleItems = await prisma.saleItem.findMany({
            where: { productId },
            include: { sale: true },
        });
        sales = saleItems.map((si) => ({
            createdAt: si.sale.createdAt,
            amount: si.price * si.quantity,
        }));
    } else {
        sales = await prisma.sale.findMany({
            where: {
                ...(ownerId && { ownerId }),
            },
        });
    }

    // Group by sub-period
    const groupMap: Record<string, { total: number; count: number }> = {};
    for (const sale of sales) {
        let key = "";
        const date = sale.createdAt;
        if (period === "week") {
            key = String(date.getDay()); // 0=Sunday, 6=Saturday
        } else if (period === "month") {
            key = String(date.getDate()); // 1-31
        } else if (period === "year") {
            key = String(date.getMonth() + 1); // 1-12
        } else {
            key = date.toISOString().slice(0, 10);
        }
        if (!groupMap[key]) groupMap[key] = { total: 0, count: 0 };
        groupMap[key].total += sale.amount;
        groupMap[key].count += 1;
    }
    // Calculate average per sub-period
    const seasonality = Object.entries(groupMap)
        .map(([subPeriod, { total, count }]) => ({
            subPeriod,
            average: count ? total / count : 0,
            total,
            count,
        }))
        .sort((a, b) => Number(a.subPeriod) - Number(b.subPeriod));
    return seasonality;
}

export async function getProfitAndLoss({
    startDate,
    endDate,
    ownerId,
}: {
    startDate?: Date;
    endDate?: Date;
    ownerId?: string;
}) {
    // Build saleWhere object
    const saleWhere: any = {};
    if (startDate && endDate) {
        saleWhere.createdAt = { gte: startDate, lte: endDate };
    } else if (startDate) {
        saleWhere.createdAt = { gte: startDate };
    } else if (endDate) {
        saleWhere.createdAt = { lte: endDate };
    }
    if (ownerId) saleWhere.ownerId = ownerId;

    const sales = await prisma.sale.findMany({
        where: saleWhere,
        select: { id: true, totalAmount: true },
    });
    const saleIds = sales.map((s) => s.id);
    const revenue = sales.reduce(
        (sum: number, s: any) => sum + s.totalAmount,
        0,
    );

    // Get all sale items for those sales
    const saleItems =
        saleIds.length > 0
            ? await prisma.saleItem.findMany({
                  where: { saleId: { in: saleIds } },
                  select: { quantity: true, cost: true },
              })
            : [];
    const cogs = saleItems.reduce(
        (sum: number, item: any) => sum + (item.cost || 0) * item.quantity,
        0,
    );
    const grossProfit = revenue - cogs;

    // Build expenseWhere object
    const expenseWhere: any = {};
    if (startDate && endDate) {
        expenseWhere.date = { gte: startDate, lte: endDate };
    } else if (startDate) {
        expenseWhere.date = { gte: startDate };
    } else if (endDate) {
        expenseWhere.date = { lte: endDate };
    }
    if (ownerId) expenseWhere.ownerId = ownerId;
    // Only include APPROVED expenses for financial calculations
    expenseWhere.status = 'APPROVED';

    const expenses = await prisma.expense.findMany({
        where: expenseWhere,
        select: { amount: true },
    });
    const totalExpenses = expenses.reduce(
        (sum: number, e: any) => sum + e.amount,
        0,
    );
    const netProfit = grossProfit - totalExpenses;

            return {
            revenue,
            cogs,
            grossProfit,
            expenses: totalExpenses,
            netProfit,
            breakdown: {
                salesCount: sales.length,
                saleItemsCount: saleItems.length,
                expenseCount: expenses.length,
                approvedExpenseCount: expenses.length, // Only approved expenses are included
            },
        };
}

export async function getRevenueForecast({
    period = "month",
    horizon = 3,
    startDate,
    endDate,
    method = "auto",
    ownerId,
}: {
    period?: string;
    horizon?: number;
    startDate?: Date;
    endDate?: Date;
    method?: string;
    ownerId?: string;
}) {
    // Aggregate sales by period
    const { rangeStart, rangeEnd } = getDateRange(period, startDate, endDate);
    const sales = await prisma.sale.findMany({
        where: {
            ...(ownerId && { ownerId }),
            createdAt: {
                ...(rangeStart && { gte: rangeStart }),
                ...(rangeEnd && { lte: rangeEnd }),
            },
        },
        orderBy: { createdAt: "asc" },
    });
    // Group by period
    const groupBy: Record<string, number> = {};
    for (const sale of sales) {
        let key = "";
        const date = sale.createdAt;
        if (period === "day") {
            key = date.toISOString().slice(0, 10);
        } else if (period === "week") {
            const week = new Date(date);
            week.setDate(date.getDate() - date.getDay());
            key = week.toISOString().slice(0, 10);
        } else if (period === "month") {
            key =
                date.getFullYear() +
                "-" +
                String(date.getMonth() + 1).padStart(2, "0");
        } else if (period === "year") {
            key = String(date.getFullYear());
        } else {
            key = date.toISOString().slice(0, 10);
        }
        groupBy[key] = (groupBy[key] || 0) + sale.totalAmount;
    }
    const history = Object.entries(groupBy)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([period, revenue]) => ({ period, revenue }));
    const revenueSeries = history.map((h) => h.revenue);
    // Forecast future revenue
    const forecastValues = forecastNext(revenueSeries, horizon, method);
    // Generate future period labels
    const lastPeriod =
        history.length > 0 ? history[history.length - 1].period : undefined;
    const futurePeriods: string[] = [];
    if (lastPeriod) {
        let [year, month] = lastPeriod.split("-").map(Number);
        for (let i = 1; i <= horizon; i++) {
            if (period === "month") {
                month++;
                if (month > 12) {
                    month = 1;
                    year++;
                }
                futurePeriods.push(`${year}-${String(month).padStart(2, "0")}`);
            } else if (period === "year") {
                futurePeriods.push(String(year + i));
            } else {
                futurePeriods.push(`future+${i}`);
            }
        }
    } else {
        for (let i = 1; i <= horizon; i++) futurePeriods.push(`future+${i}`);
    }
    const forecast = futurePeriods.map((period, i) => ({
        period,
        predictedRevenue: forecastValues[i] || 0,
    }));
    return { history, forecast };
}
