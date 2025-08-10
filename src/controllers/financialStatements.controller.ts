import { Request, Response } from "express";
import { financialStatementsService, FinancialStatementsService } from "../services/financialStatements.service";
import catchErrors from "../utils/catchErrors";
import appAssert from "../utils/appAssert";
import { UNAUTHORIZED, BAD_REQUEST } from "../constants/http";
import { generateFinancialStatementPdf } from "../services/financialPdf.service";

export const generateProfitLossHandler = catchErrors(async (req: Request, res: Response) => {
    const ownerId = req.user?.id;
    appAssert(ownerId, UNAUTHORIZED, "Unauthorized");

    const { startDate, endDate, periodType = 'MONTHLY' } = req.query;
    
    appAssert(startDate && endDate, BAD_REQUEST, "Start date and end date are required");

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    
    appAssert(!isNaN(start.getTime()) && !isNaN(end.getTime()), BAD_REQUEST, "Invalid date format");
    appAssert(start <= end, BAD_REQUEST, "Start date must be before or equal to end date");

    const period = FinancialStatementsService.createPeriod(
        start, 
        end, 
        periodType as 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM'
    );

    const profitLoss = await financialStatementsService.generateProfitLoss(ownerId, period);

    res.json({
        success: true,
        data: profitLoss,
        message: "Profit & Loss statement generated successfully"
    });
});

export const generateCashFlowHandler = catchErrors(async (req: Request, res: Response) => {
    const ownerId = req.user?.id;
    appAssert(ownerId, UNAUTHORIZED, "Unauthorized");

    const { startDate, endDate, periodType = 'MONTHLY' } = req.query;
    
    appAssert(startDate && endDate, BAD_REQUEST, "Start date and end date are required");

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    
    appAssert(!isNaN(start.getTime()) && !isNaN(end.getTime()), BAD_REQUEST, "Invalid date format");
    appAssert(start <= end, BAD_REQUEST, "Start date must be before or equal to end date");

    const period = FinancialStatementsService.createPeriod(
        start, 
        end, 
        periodType as 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM'
    );

    const cashFlow = await financialStatementsService.generateCashFlow(ownerId, period);

    res.json({
        success: true,
        data: cashFlow,
        message: "Cash Flow statement generated successfully"
    });
});

export const generateBalanceSheetHandler = catchErrors(async (req: Request, res: Response) => {
    const ownerId = req.user?.id;
    appAssert(ownerId, UNAUTHORIZED, "Unauthorized");

    const { asOfDate } = req.query;
    
    appAssert(asOfDate, BAD_REQUEST, "As of date is required");

    const date = new Date(asOfDate as string);
    
    appAssert(!isNaN(date.getTime()), BAD_REQUEST, "Invalid date format");

    const balanceSheet = await financialStatementsService.generateBalanceSheet(ownerId, date);

    res.json({
        success: true,
        data: balanceSheet,
        message: "Balance Sheet generated successfully"
    });
});

export const downloadProfitLossPdfHandler = catchErrors(async (req: Request, res: Response) => {
    const ownerId = req.user?.id;
    appAssert(ownerId, UNAUTHORIZED, "Unauthorized");

    const { startDate, endDate, periodType = 'MONTHLY' } = req.query;
    
    appAssert(startDate && endDate, BAD_REQUEST, "Start date and end date are required");

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    
    appAssert(!isNaN(start.getTime()) && !isNaN(end.getTime()), BAD_REQUEST, "Invalid date format");
    appAssert(start <= end, BAD_REQUEST, "Start date must be before or equal to end date");

    const period = FinancialStatementsService.createPeriod(
        start, 
        end, 
        periodType as 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM'
    );

    const profitLoss = await financialStatementsService.generateProfitLoss(ownerId, period);
    const pdfBuffer = await generateFinancialStatementPdf(profitLoss, 'PROFIT_LOSS');

    res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=profit-loss-${period.periodName.replace(/\s+/g, '-').toLowerCase()}.pdf`,
        'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
});

export const downloadCashFlowPdfHandler = catchErrors(async (req: Request, res: Response) => {
    const ownerId = req.user?.id;
    appAssert(ownerId, UNAUTHORIZED, "Unauthorized");

    const { startDate, endDate, periodType = 'MONTHLY' } = req.query;
    
    appAssert(startDate && endDate, BAD_REQUEST, "Start date and end date are required");

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    
    appAssert(!isNaN(start.getTime()) && !isNaN(end.getTime()), BAD_REQUEST, "Invalid date format");
    appAssert(start <= end, BAD_REQUEST, "Start date must be before or equal to end date");

    const period = FinancialStatementsService.createPeriod(
        start, 
        end, 
        periodType as 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM'
    );

    const cashFlow = await financialStatementsService.generateCashFlow(ownerId, period);
    const pdfBuffer = await generateFinancialStatementPdf(cashFlow, 'CASH_FLOW');

    res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=cash-flow-${period.periodName.replace(/\s+/g, '-').toLowerCase()}.pdf`,
        'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
});

export const downloadBalanceSheetPdfHandler = catchErrors(async (req: Request, res: Response) => {
    const ownerId = req.user?.id;
    appAssert(ownerId, UNAUTHORIZED, "Unauthorized");

    const { asOfDate } = req.query;
    
    appAssert(asOfDate, BAD_REQUEST, "As of date is required");

    const date = new Date(asOfDate as string);
    
    appAssert(!isNaN(date.getTime()), BAD_REQUEST, "Invalid date format");

    const balanceSheet = await financialStatementsService.generateBalanceSheet(ownerId, date);
    const pdfBuffer = await generateFinancialStatementPdf(balanceSheet, 'BALANCE_SHEET');

    const dateString = date.toISOString().split('T')[0];
    res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=balance-sheet-${dateString}.pdf`,
        'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
});

export const generateLoanApplicationPackageHandler = catchErrors(async (req: Request, res: Response) => {
    const ownerId = req.user?.id;
    appAssert(ownerId, UNAUTHORIZED, "Unauthorized");

    const { periods } = req.body;
    appAssert(periods && Array.isArray(periods), BAD_REQUEST, "Periods array is required");

    // Generate all required financial statements
    const statements: any = {
        profitLossStatements: [],
        cashFlowStatements: [],
        balanceSheets: [],
    };

    // Generate P&L and Cash Flow for each period
    for (const periodData of periods) {
        const period = FinancialStatementsService.createPeriod(
            new Date(periodData.startDate),
            new Date(periodData.endDate),
            periodData.periodType || 'YEARLY'
        );

        const profitLoss = await financialStatementsService.generateProfitLoss(ownerId, period);
        const cashFlow = await financialStatementsService.generateCashFlow(ownerId, period);

        statements.profitLossStatements.push(profitLoss);
        statements.cashFlowStatements.push(cashFlow);
    }

    // Generate balance sheet for the most recent date
    const mostRecentDate = new Date(Math.max(...periods.map((p: any) => new Date(p.endDate).getTime())));
    const balanceSheet = await financialStatementsService.generateBalanceSheet(ownerId, mostRecentDate);
    statements.balanceSheets.push(balanceSheet);

    // For now, return the data. Later we'll implement PDF packaging
    res.json({
        success: true,
        data: statements,
        message: "Loan application package generated successfully"
    });
});

export const getFinancialSummaryHandler = catchErrors(async (req: Request, res: Response) => {
    const ownerId = req.user?.id;
    appAssert(ownerId, UNAUTHORIZED, "Unauthorized");

    // Generate summary data for the current year
    const currentYear = new Date().getFullYear();
    const yearPeriod = FinancialStatementsService.createYearlyPeriod(currentYear);
    const currentDate = new Date();

    // Generate statements
    const profitLoss = await financialStatementsService.generateProfitLoss(ownerId, yearPeriod);
    const cashFlow = await financialStatementsService.generateCashFlow(ownerId, yearPeriod);
    const balanceSheet = await financialStatementsService.generateBalanceSheet(ownerId, currentDate);

    // Create summary
    const summary = {
        currentYear: currentYear,
        profitLoss: {
            revenue: profitLoss.revenue.netRevenue,
            grossProfit: profitLoss.grossProfit,
            operatingIncome: profitLoss.operatingIncome,
            netIncome: profitLoss.netIncome,
            grossMargin: profitLoss.ratios.grossMargin,
            netMargin: profitLoss.ratios.netMargin,
        },
        cashFlow: {
            operatingCash: cashFlow.operatingActivities.netOperatingCash,
            investingCash: cashFlow.investingActivities.netInvestingCash,
            financingCash: cashFlow.financingActivities.netFinancingCash,
            netCashFlow: cashFlow.netCashFlow,
        },
        balanceSheet: {
            totalAssets: balanceSheet.assets.totalAssets,
            totalLiabilities: balanceSheet.liabilities.totalLiabilities,
            totalEquity: balanceSheet.equity.totalEquity,
            currentRatio: balanceSheet.liabilities.currentLiabilities.totalCurrentLiabilities > 0 
                ? balanceSheet.assets.currentAssets.totalCurrentAssets / balanceSheet.liabilities.currentLiabilities.totalCurrentLiabilities 
                : 0,
        },
        growth: profitLoss.comparison.growth,
    };

    res.json({
        success: true,
        data: summary,
        message: "Financial summary generated successfully"
    });
});

