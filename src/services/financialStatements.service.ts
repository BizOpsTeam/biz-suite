import prisma from "../config/db";
import { startOfYear, endOfYear, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, format } from "date-fns";

// Types and Interfaces
export interface FinancialPeriod {
    startDate: Date;
    endDate: Date;
    periodName: string;
    periodType: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM';
}

export interface RevenueBreakdown {
    category: string;
    amount: number;
    percentage: number;
    itemCount: number;
}

export interface COGSBreakdown {
    category: string;
    amount: number;
    percentage: number;
    quantity: number;
}

export interface ExpenseBreakdown {
    category: string;
    amount: number;
    percentage: number;
    itemCount: number;
}

export interface FinancialRatios {
    grossMargin: number;
    operatingMargin: number;
    netMargin: number;
    returnOnSales: number;
    expenseRatio: number;
}

export interface ProfitLossStatement {
    companyInfo: {
        name: string;
        address: string;
        phone: string;
        email: string;
        currency: string;
        currencySymbol: string;
    };
    period: FinancialPeriod;
    revenue: {
        totalSales: number;
        salesTax: number;
        discounts: number;
        netRevenue: number;
        breakdown: RevenueBreakdown[];
        salesCount: number;
    };
    costOfGoodsSold: {
        totalCOGS: number;
        breakdown: COGSBreakdown[];
        averageCostPerSale: number;
    };
    grossProfit: number;
    operatingExpenses: {
        totalExpenses: number;
        breakdown: ExpenseBreakdown[];
        averageExpensePerMonth: number;
    };
    operatingIncome: number;
    otherIncome: number;
    otherExpenses: number;
    netIncome: number;
    ratios: FinancialRatios;
    comparison: {
        previousPeriod?: {
            netRevenue: number;
            grossProfit: number;
            operatingIncome: number;
            netIncome: number;
        };
        growth: {
            revenueGrowth: number;
            grossProfitGrowth: number;
            netIncomeGrowth: number;
        };
    };
}

export interface CashFlowStatement {
    companyInfo: {
        name: string;
        address: string;
        phone: string;
        email: string;
        currency: string;
        currencySymbol: string;
    };
    period: FinancialPeriod;
    operatingActivities: {
        cashFromSales: number;
        cashFromCustomers: number;
        cashToSuppliers: number;
        cashForExpenses: number;
        netOperatingCash: number;
    };
    investingActivities: {
        equipmentPurchases: number;
        assetSales: number;
        netInvestingCash: number;
    };
    financingActivities: {
        ownerInvestments: number;
        loanPayments: number;
        netFinancingCash: number;
    };
    netCashFlow: number;
    beginningCash: number;
    endingCash: number;
}

export interface BalanceSheet {
    companyInfo: {
        name: string;
        address: string;
        phone: string;
        email: string;
        currency: string;
        currencySymbol: string;
    };
    asOfDate: Date;
    assets: {
        currentAssets: {
            cash: number;
            accountsReceivable: number;
            inventory: number;
            otherCurrentAssets: number;
            totalCurrentAssets: number;
        };
        fixedAssets: {
            equipment: number;
            accumulatedDepreciation: number;
            netFixedAssets: number;
        };
        totalAssets: number;
    };
    liabilities: {
        currentLiabilities: {
            accountsPayable: number;
            accrualExpenses: number;
            otherCurrentLiabilities: number;
            totalCurrentLiabilities: number;
        };
        longTermLiabilities: {
            loans: number;
            otherLongTerm: number;
            totalLongTermLiabilities: number;
        };
        totalLiabilities: number;
    };
    equity: {
        ownerEquity: number;
        retainedEarnings: number;
        totalEquity: number;
    };
    totalLiabilitiesAndEquity: number;
}

export interface BusinessReport {
    companyInfo: {
        name: string;
        address: string;
        phone: string;
        email: string;
        currency: string;
        currencySymbol: string;
    };
    period: FinancialPeriod;
    executiveSummary: {
        totalRevenue: number;
        netIncome: number;
        customerCount: number;
        averageOrderValue: number;
        topSellingProducts: Array<{
            name: string;
            unitsSold: number;
            revenue: number;
        }>;
    };
    salesAnalysis: {
        monthlySales: Array<{
            month: string;
            revenue: number;
            orders: number;
        }>;
        paymentMethodBreakdown: Array<{
            method: string;
            amount: number;
            percentage: number;
        }>;
        channelBreakdown: Array<{
            channel: string;
            amount: number;
            percentage: number;
        }>;
    };
    customerAnalysis: {
        newCustomers: number;
        repeatCustomers: number;
        customerRetention: number;
        averageCustomerValue: number;
    };
    inventoryAnalysis: {
        totalProducts: number;
        totalInventoryValue: number;
        topProducts: Array<{
            name: string;
            stock: number;
            value: number;
        }>;
        lowStockAlerts: Array<{
            name: string;
            currentStock: number;
            suggestedReorder: number;
        }>;
    };
    trends: {
        revenueGrowth: number;
        customerGrowth: number;
        averageOrderGrowth: number;
        seasonalTrends: Array<{
            period: string;
            trend: string;
            impact: number;
        }>;
    };
}

export class FinancialStatementsService {
    /**
     * Generate comprehensive Profit & Loss Statement
     */
    async generateProfitLoss(userId: string, period: FinancialPeriod): Promise<ProfitLossStatement> {
        // Get company information
        const user = await prisma.userModel.findUnique({
            where: { id: userId },
            select: {
                name: true,
                email: true,
                companyAddress: true,
                companyPhone: true,
                defaultCurrencyCode: true,
                defaultCurrencySymbol: true,
            }
        });

        if (!user) {
            throw new Error("User not found");
        }

        // Get sales data for the period
        const sales = await prisma.sale.findMany({
            where: {
                ownerId: userId,
                createdAt: {
                    gte: period.startDate,
                    lte: period.endDate,
                },
            },
            include: {
                saleItems: {
                    include: {
                        product: {
                            select: {
                                name: true,
                                category: true,
                                cost: true,
                            }
                        }
                    }
                },
                customer: true,
            }
        });

        // Calculate revenue metrics
        const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const salesTax = sales.reduce((sum, sale) => sum + sale.taxAmount, 0);
        const discounts = sales.reduce((sum, sale) => sum + sale.discount, 0);
        const netRevenue = totalSales - discounts;
        const salesCount = sales.length;

        // Revenue breakdown by category
        const categoryRevenue: Record<string, { amount: number; count: number }> = {};
        sales.forEach(sale => {
            sale.saleItems.forEach(item => {
                const categoryName = item.product.category?.name || 'Uncategorized';
                if (!categoryRevenue[categoryName]) {
                    categoryRevenue[categoryName] = { amount: 0, count: 0 };
                }
                categoryRevenue[categoryName].amount += item.price * item.quantity;
                categoryRevenue[categoryName].count += item.quantity;
            });
        });

        const revenueBreakdown: RevenueBreakdown[] = Object.entries(categoryRevenue).map(([category, data]) => ({
            category,
            amount: data.amount,
            percentage: netRevenue > 0 ? (data.amount / netRevenue) * 100 : 0,
            itemCount: data.count,
        }));

        // Calculate COGS
        let totalCOGS = 0;
        const cogsByCategory: Record<string, { amount: number; quantity: number }> = {};

        sales.forEach(sale => {
            sale.saleItems.forEach(item => {
                const cost = item.cost || item.product.cost || 0;
                const itemCOGS = cost * item.quantity;
                totalCOGS += itemCOGS;

                const categoryName = item.product.category?.name || 'Uncategorized';
                if (!cogsByCategory[categoryName]) {
                    cogsByCategory[categoryName] = { amount: 0, quantity: 0 };
                }
                cogsByCategory[categoryName].amount += itemCOGS;
                cogsByCategory[categoryName].quantity += item.quantity;
            });
        });

        const cogsBreakdown: COGSBreakdown[] = Object.entries(cogsByCategory).map(([category, data]) => ({
            category,
            amount: data.amount,
            percentage: totalCOGS > 0 ? (data.amount / totalCOGS) * 100 : 0,
            quantity: data.quantity,
        }));

        // Calculate gross profit
        const grossProfit = netRevenue - totalCOGS;

        // Get expenses for the period
        const expenses = await prisma.expense.findMany({
            where: {
                ownerId: userId,
                date: {
                    gte: period.startDate,
                    lte: period.endDate,
                },
                status: 'APPROVED',
            },
            include: {
                category: true,
            }
        });

        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

        // Expense breakdown by category
        const expenseByCategory: Record<string, { amount: number; count: number }> = {};
        expenses.forEach(expense => {
            const categoryName = expense.category?.name || 'Uncategorized';
            if (!expenseByCategory[categoryName]) {
                expenseByCategory[categoryName] = { amount: 0, count: 0 };
            }
            expenseByCategory[categoryName].amount += expense.amount;
            expenseByCategory[categoryName].count += 1;
        });

        const expenseBreakdown: ExpenseBreakdown[] = Object.entries(expenseByCategory).map(([category, data]) => ({
            category,
            amount: data.amount,
            percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
            itemCount: data.count,
        }));

        // Calculate operating income and net income
        const operatingIncome = grossProfit - totalExpenses;
        const otherIncome = 0; // For future implementation
        const otherExpenses = 0; // For future implementation
        const netIncome = operatingIncome + otherIncome - otherExpenses;

        // Calculate financial ratios
        const ratios: FinancialRatios = {
            grossMargin: netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0,
            operatingMargin: netRevenue > 0 ? (operatingIncome / netRevenue) * 100 : 0,
            netMargin: netRevenue > 0 ? (netIncome / netRevenue) * 100 : 0,
            returnOnSales: netRevenue > 0 ? (netIncome / netRevenue) * 100 : 0,
            expenseRatio: netRevenue > 0 ? (totalExpenses / netRevenue) * 100 : 0,
        };

        // Get previous period data for comparison
        const previousPeriod = this.getPreviousPeriod(period);
        const previousData = await this.getPreviousPeriodData(userId, previousPeriod);

        const comparison = {
            previousPeriod: previousData || undefined,
            growth: {
                revenueGrowth: previousData && previousData.netRevenue > 0 
                    ? ((netRevenue - previousData.netRevenue) / previousData.netRevenue) * 100 
                    : 0,
                grossProfitGrowth: previousData && previousData.grossProfit > 0 
                    ? ((grossProfit - previousData.grossProfit) / previousData.grossProfit) * 100 
                    : 0,
                netIncomeGrowth: previousData && previousData.netIncome > 0 
                    ? ((netIncome - previousData.netIncome) / previousData.netIncome) * 100 
                    : 0,
            }
        };

        // Get period length in months for averages
        const periodLengthInMonths = this.getPeriodLengthInMonths(period);

        return {
            companyInfo: {
                name: user.name,
                address: user.companyAddress || '',
                phone: user.companyPhone || '',
                email: user.email,
                currency: user.defaultCurrencyCode || 'GHS',
                currencySymbol: user.defaultCurrencySymbol || 'GH₵',
            },
            period,
            revenue: {
                totalSales,
                salesTax,
                discounts,
                netRevenue,
                breakdown: revenueBreakdown,
                salesCount,
            },
            costOfGoodsSold: {
                totalCOGS,
                breakdown: cogsBreakdown,
                averageCostPerSale: salesCount > 0 ? totalCOGS / salesCount : 0,
            },
            grossProfit,
            operatingExpenses: {
                totalExpenses,
                breakdown: expenseBreakdown,
                averageExpensePerMonth: periodLengthInMonths > 0 ? totalExpenses / periodLengthInMonths : 0,
            },
            operatingIncome,
            otherIncome,
            otherExpenses,
            netIncome,
            ratios,
            comparison,
        };
    }

    /**
     * Generate Cash Flow Statement
     */
    async generateCashFlow(userId: string, period: FinancialPeriod): Promise<CashFlowStatement> {
        // Get company information
        const user = await prisma.userModel.findUnique({
            where: { id: userId },
            select: {
                name: true,
                email: true,
                companyAddress: true,
                companyPhone: true,
                defaultCurrencyCode: true,
                defaultCurrencySymbol: true,
            }
        });

        if (!user) {
            throw new Error("User not found");
        }

        // Operating Activities - Cash from sales and to expenses
        const sales = await prisma.sale.findMany({
            where: {
                ownerId: userId,
                createdAt: {
                    gte: period.startDate,
                    lte: period.endDate,
                },
            },
        });

        const cashFromSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);

        // Cash from customers (paid invoices)
        const paidInvoices = await prisma.invoice.findMany({
            where: {
                ownerId: userId,
                paidAt: {
                    gte: period.startDate,
                    lte: period.endDate,
                },
            },
        });

        const cashFromCustomers = paidInvoices.reduce((sum, invoice) => sum + invoice.paidAmount, 0);

        // Cash for expenses
        const expenses = await prisma.expense.findMany({
            where: {
                ownerId: userId,
                date: {
                    gte: period.startDate,
                    lte: period.endDate,
                },
                status: 'APPROVED',
            },
            include: {
                category: true,
            },
        });

        const cashForExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

        // For now, we'll estimate cash to suppliers as a portion of COGS
        const profitLoss = await this.generateProfitLoss(userId, period);
        const estimatedCashToSuppliers = profitLoss.costOfGoodsSold.totalCOGS * 0.8; // Estimate 80% paid in cash

        const netOperatingCash = cashFromSales + cashFromCustomers - estimatedCashToSuppliers - cashForExpenses;

        // Investing Activities - Equipment and asset purchases
        const equipmentExpenses = expenses.filter(expense => 
            expense.category?.name?.toLowerCase().includes('equipment') ||
            expense.category?.name?.toLowerCase().includes('asset') ||
            expense.category?.name?.toLowerCase().includes('technology')
        );

        const equipmentPurchases = equipmentExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const assetSales = 0; // For future implementation
        const netInvestingCash = assetSales - equipmentPurchases;

        // Financing Activities - Owner investments and loans
        const ownerInvestments = 0; // For future implementation with capital tracking
        const loanPayments = expenses.filter(expense => 
            expense.category?.name?.toLowerCase().includes('loan') ||
            expense.category?.name?.toLowerCase().includes('debt') ||
            expense.category?.name?.toLowerCase().includes('interest')
        ).reduce((sum, expense) => sum + expense.amount, 0);

        const netFinancingCash = ownerInvestments - loanPayments;

        // Net cash flow
        const netCashFlow = netOperatingCash + netInvestingCash + netFinancingCash;

        // For beginning and ending cash, we'll need to implement cash tracking
        // For now, we'll estimate based on available data
        const beginningCash = 0; // To be implemented with proper cash tracking
        const endingCash = beginningCash + netCashFlow;

        return {
            companyInfo: {
                name: user.name,
                address: user.companyAddress || '',
                phone: user.companyPhone || '',
                email: user.email,
                currency: user.defaultCurrencyCode || 'GHS',
                currencySymbol: user.defaultCurrencySymbol || 'GH₵',
            },
            period,
            operatingActivities: {
                cashFromSales,
                cashFromCustomers,
                cashToSuppliers: estimatedCashToSuppliers,
                cashForExpenses,
                netOperatingCash,
            },
            investingActivities: {
                equipmentPurchases,
                assetSales,
                netInvestingCash,
            },
            financingActivities: {
                ownerInvestments,
                loanPayments,
                netFinancingCash,
            },
            netCashFlow,
            beginningCash,
            endingCash,
        };
    }

    /**
     * Generate Balance Sheet
     */
    async generateBalanceSheet(userId: string, asOfDate: Date): Promise<BalanceSheet> {
        // Get company information
        const user = await prisma.userModel.findUnique({
            where: { id: userId },
            select: {
                name: true,
                email: true,
                companyAddress: true,
                companyPhone: true,
                defaultCurrencyCode: true,
                defaultCurrencySymbol: true,
            }
        });

        if (!user) {
            throw new Error("User not found");
        }

        // Current Assets
        // Cash - for now estimated, to be implemented with proper cash tracking
        const cash = 0;

        // Accounts Receivable - unpaid invoices
        const unpaidInvoices = await prisma.invoice.findMany({
            where: {
                ownerId: userId,
                status: { in: ['UNPAID', 'PARTIAL'] },
                createdAt: { lte: asOfDate },
            },
        });

        const accountsReceivable = unpaidInvoices.reduce((sum, invoice) => 
            sum + (invoice.amountDue - invoice.paidAmount), 0
        );

        // Inventory - current stock value
        const inventory = await prisma.product.findMany({
            where: { ownerId: userId },
            select: { stock: true, cost: true },
        });

        const inventoryValue = inventory.reduce((sum, product) => 
            sum + (product.stock * (product.cost || 0)), 0
        );

        const otherCurrentAssets = 0; // For future implementation
        const totalCurrentAssets = cash + accountsReceivable + inventoryValue + otherCurrentAssets;

        // Fixed Assets - estimated from equipment expenses
        const equipmentExpenses = await prisma.expense.findMany({
            where: {
                ownerId: userId,
                date: { lte: asOfDate },
                status: 'APPROVED',
                category: {
                    name: {
                        contains: 'equipment',
                        mode: 'insensitive',
                    },
                },
            },
        });

        const equipment = equipmentExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const accumulatedDepreciation = equipment * 0.2; // Estimate 20% depreciation
        const netFixedAssets = equipment - accumulatedDepreciation;

        const totalAssets = totalCurrentAssets + netFixedAssets;

        // Current Liabilities
        // Accounts Payable - pending expenses
        const pendingExpenses = await prisma.expense.findMany({
            where: {
                ownerId: userId,
                status: 'PENDING',
                date: { lte: asOfDate },
            },
        });

        const accountsPayable = pendingExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const accrualExpenses = 0; // For future implementation
        const otherCurrentLiabilities = 0; // For future implementation
        const totalCurrentLiabilities = accountsPayable + accrualExpenses + otherCurrentLiabilities;

        // Long-term Liabilities
        const loans = 0; // For future implementation with loan tracking
        const otherLongTerm = 0; // For future implementation
        const totalLongTermLiabilities = loans + otherLongTerm;

        const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;

        // Equity
        const ownerEquity = 0; // For future implementation with capital tracking
        const retainedEarnings = totalAssets - totalLiabilities - ownerEquity;
        const totalEquity = ownerEquity + retainedEarnings;

        return {
            companyInfo: {
                name: user.name,
                address: user.companyAddress || '',
                phone: user.companyPhone || '',
                email: user.email,
                currency: user.defaultCurrencyCode || 'GHS',
                currencySymbol: user.defaultCurrencySymbol || 'GH₵',
            },
            asOfDate,
            assets: {
                currentAssets: {
                    cash,
                    accountsReceivable,
                    inventory: inventoryValue,
                    otherCurrentAssets,
                    totalCurrentAssets,
                },
                fixedAssets: {
                    equipment,
                    accumulatedDepreciation,
                    netFixedAssets,
                },
                totalAssets,
            },
            liabilities: {
                currentLiabilities: {
                    accountsPayable,
                    accrualExpenses,
                    otherCurrentLiabilities,
                    totalCurrentLiabilities,
                },
                longTermLiabilities: {
                    loans,
                    otherLongTerm,
                    totalLongTermLiabilities,
                },
                totalLiabilities,
            },
            equity: {
                ownerEquity,
                retainedEarnings,
                totalEquity,
            },
            totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
        };
    }

    /**
     * Helper method to get previous period
     */
    private getPreviousPeriod(period: FinancialPeriod): FinancialPeriod {
        const timeDiff = period.endDate.getTime() - period.startDate.getTime();
        const previousEndDate = new Date(period.startDate.getTime() - 1);
        const previousStartDate = new Date(previousEndDate.getTime() - timeDiff);

        return {
            startDate: previousStartDate,
            endDate: previousEndDate,
            periodName: `Previous ${period.periodType}`,
            periodType: period.periodType,
        };
    }

    /**
     * Helper method to get previous period financial data
     */
    private async getPreviousPeriodData(userId: string, period: FinancialPeriod) {
        try {
            const profitLoss = await this.generateProfitLoss(userId, period);
            return {
                netRevenue: profitLoss.revenue.netRevenue,
                grossProfit: profitLoss.grossProfit,
                operatingIncome: profitLoss.operatingIncome,
                netIncome: profitLoss.netIncome,
            };
        } catch (error) {
            return null;
        }
    }

    /**
     * Helper method to calculate period length in months
     */
    private getPeriodLengthInMonths(period: FinancialPeriod): number {
        const months = (period.endDate.getFullYear() - period.startDate.getFullYear()) * 12 +
                      (period.endDate.getMonth() - period.startDate.getMonth()) + 1;
        return Math.max(1, months);
    }

    /**
     * Create financial period helpers
     */
    static createPeriod(startDate: Date, endDate: Date, periodType: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM'): FinancialPeriod {
        let periodName: string;
        
        switch (periodType) {
            case 'MONTHLY':
                periodName = format(startDate, 'MMMM yyyy');
                break;
            case 'QUARTERLY':
                const quarter = Math.floor(startDate.getMonth() / 3) + 1;
                periodName = `Q${quarter} ${startDate.getFullYear()}`;
                break;
            case 'YEARLY':
                periodName = `FY ${startDate.getFullYear()}`;
                break;
            default:
                periodName = `${format(startDate, 'MMM dd')} - ${format(endDate, 'MMM dd, yyyy')}`;
        }

        return {
            startDate,
            endDate,
            periodName,
            periodType,
        };
    }

    static createMonthlyPeriod(year: number, month: number): FinancialPeriod {
        const startDate = startOfMonth(new Date(year, month - 1));
        const endDate = endOfMonth(startDate);
        return this.createPeriod(startDate, endDate, 'MONTHLY');
    }

    static createQuarterlyPeriod(year: number, quarter: number): FinancialPeriod {
        const startDate = startOfQuarter(new Date(year, (quarter - 1) * 3));
        const endDate = endOfQuarter(startDate);
        return this.createPeriod(startDate, endDate, 'QUARTERLY');
    }

    static createYearlyPeriod(year: number): FinancialPeriod {
        const startDate = startOfYear(new Date(year, 0));
        const endDate = endOfYear(startDate);
        return this.createPeriod(startDate, endDate, 'YEARLY');
    }
}

export const financialStatementsService = new FinancialStatementsService();
