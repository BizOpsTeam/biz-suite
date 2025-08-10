import puppeteer from "puppeteer";
import { readFile } from "fs/promises";
import path from "path";
import { ProfitLossStatement, CashFlowStatement, BalanceSheet } from "./financialStatements.service";

export type FinancialStatementType = 'PROFIT_LOSS' | 'CASH_FLOW' | 'BALANCE_SHEET' | 'BUSINESS_REPORT';

/**
 * Generate PDF for financial statements
 */
export async function generateFinancialStatementPdf(
    data: ProfitLossStatement | CashFlowStatement | BalanceSheet,
    statementType: FinancialStatementType
): Promise<Buffer> {
    let templatePath: string;
    let htmlContent: string;

    switch (statementType) {
        case 'PROFIT_LOSS':
            templatePath = path.join(__dirname, "../templates/profitLoss.template.html");
            htmlContent = await fillProfitLossTemplate(templatePath, data as ProfitLossStatement);
            break;
        case 'CASH_FLOW':
            templatePath = path.join(__dirname, "../templates/cashFlow.template.html");
            htmlContent = await fillCashFlowTemplate(templatePath, data as CashFlowStatement);
            break;
        case 'BALANCE_SHEET':
            templatePath = path.join(__dirname, "../templates/balanceSheet.template.html");
            htmlContent = await fillBalanceSheetTemplate(templatePath, data as BalanceSheet);
            break;
        default:
            throw new Error(`Unsupported statement type: ${statementType}`);
    }

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        const pdfBuffer = await page.pdf({
            format: 'A4',
            margin: {
                top: '20mm',
                right: '15mm',
                bottom: '20mm',
                left: '15mm'
            },
            printBackground: true,
        });

        return Buffer.from(pdfBuffer);
    } finally {
        await browser.close();
    }
}

/**
 * Fill Profit & Loss template with data
 */
async function fillProfitLossTemplate(templatePath: string, data: ProfitLossStatement): Promise<string> {
    let template = await readFile(templatePath, 'utf-8');
    
    // Replace company information
    template = template.replace(/{{companyName}}/g, data.companyInfo.name);
    template = template.replace(/{{companyAddress}}/g, data.companyInfo.address);
    template = template.replace(/{{companyPhone}}/g, data.companyInfo.phone);
    template = template.replace(/{{companyEmail}}/g, data.companyInfo.email);
    template = template.replace(/{{currency}}/g, data.companyInfo.currency);
    template = template.replace(/{{currencySymbol}}/g, data.companyInfo.currencySymbol);
    
    // Replace period information
    template = template.replace(/{{periodName}}/g, data.period.periodName);
    template = template.replace(/{{startDate}}/g, data.period.startDate.toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
    }));
    template = template.replace(/{{endDate}}/g, data.period.endDate.toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
    }));
    
    // Replace financial data
    template = template.replace(/{{totalSales}}/g, formatCurrency(data.revenue.totalSales, data.companyInfo.currencySymbol));
    template = template.replace(/{{salesTax}}/g, formatCurrency(data.revenue.salesTax, data.companyInfo.currencySymbol));
    template = template.replace(/{{discounts}}/g, formatCurrency(data.revenue.discounts, data.companyInfo.currencySymbol));
    template = template.replace(/{{netRevenue}}/g, formatCurrency(data.revenue.netRevenue, data.companyInfo.currencySymbol));
    template = template.replace(/{{salesCount}}/g, data.revenue.salesCount.toString());
    
    template = template.replace(/{{totalCOGS}}/g, formatCurrency(data.costOfGoodsSold.totalCOGS, data.companyInfo.currencySymbol));
    template = template.replace(/{{grossProfit}}/g, formatCurrency(data.grossProfit, data.companyInfo.currencySymbol));
    
    template = template.replace(/{{totalExpenses}}/g, formatCurrency(data.operatingExpenses.totalExpenses, data.companyInfo.currencySymbol));
    template = template.replace(/{{operatingIncome}}/g, formatCurrency(data.operatingIncome, data.companyInfo.currencySymbol));
    template = template.replace(/{{netIncome}}/g, formatCurrency(data.netIncome, data.companyInfo.currencySymbol));
    
    // Replace ratios
    template = template.replace(/{{grossMargin}}/g, formatPercentage(data.ratios.grossMargin));
    template = template.replace(/{{operatingMargin}}/g, formatPercentage(data.ratios.operatingMargin));
    template = template.replace(/{{netMargin}}/g, formatPercentage(data.ratios.netMargin));
    
    // Replace revenue breakdown
    const revenueBreakdownRows = data.revenue.breakdown.map(item => `
        <tr>
            <td class="breakdown-category">${item.category}</td>
            <td class="breakdown-amount">${formatCurrency(item.amount, data.companyInfo.currencySymbol)}</td>
            <td class="breakdown-percentage">${formatPercentage(item.percentage)}</td>
            <td class="breakdown-count">${item.itemCount}</td>
        </tr>
    `).join('');
    template = template.replace(/{{revenueBreakdownRows}}/g, revenueBreakdownRows);
    
    // Replace expense breakdown
    const expenseBreakdownRows = data.operatingExpenses.breakdown.map(item => `
        <tr>
            <td class="breakdown-category">${item.category}</td>
            <td class="breakdown-amount">${formatCurrency(item.amount, data.companyInfo.currencySymbol)}</td>
            <td class="breakdown-percentage">${formatPercentage(item.percentage)}</td>
            <td class="breakdown-count">${item.itemCount}</td>
        </tr>
    `).join('');
    template = template.replace(/{{expenseBreakdownRows}}/g, expenseBreakdownRows);
    
    // Replace growth information
    if (data.comparison.previousPeriod) {
        template = template.replace(/{{revenueGrowth}}/g, formatPercentage(data.comparison.growth.revenueGrowth));
        template = template.replace(/{{grossProfitGrowth}}/g, formatPercentage(data.comparison.growth.grossProfitGrowth));
        template = template.replace(/{{netIncomeGrowth}}/g, formatPercentage(data.comparison.growth.netIncomeGrowth));
    } else {
        template = template.replace(/{{revenueGrowth}}/g, 'N/A');
        template = template.replace(/{{grossProfitGrowth}}/g, 'N/A');
        template = template.replace(/{{netIncomeGrowth}}/g, 'N/A');
    }
    
    // Add generation date
    template = template.replace(/{{generationDate}}/g, new Date().toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
    }));
    
    return template;
}

/**
 * Fill Cash Flow template with data
 */
async function fillCashFlowTemplate(templatePath: string, data: CashFlowStatement): Promise<string> {
    let template = await readFile(templatePath, 'utf-8');
    
    // Replace company information
    template = template.replace(/{{companyName}}/g, data.companyInfo.name);
    template = template.replace(/{{companyAddress}}/g, data.companyInfo.address);
    template = template.replace(/{{companyPhone}}/g, data.companyInfo.phone);
    template = template.replace(/{{companyEmail}}/g, data.companyInfo.email);
    template = template.replace(/{{currency}}/g, data.companyInfo.currency);
    template = template.replace(/{{currencySymbol}}/g, data.companyInfo.currencySymbol);
    
    // Replace period information
    template = template.replace(/{{periodName}}/g, data.period.periodName);
    template = template.replace(/{{startDate}}/g, data.period.startDate.toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
    }));
    template = template.replace(/{{endDate}}/g, data.period.endDate.toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
    }));
    
    // Replace operating activities
    template = template.replace(/{{cashFromSales}}/g, formatCurrency(data.operatingActivities.cashFromSales, data.companyInfo.currencySymbol));
    template = template.replace(/{{cashFromCustomers}}/g, formatCurrency(data.operatingActivities.cashFromCustomers, data.companyInfo.currencySymbol));
    template = template.replace(/{{cashToSuppliers}}/g, formatCurrency(data.operatingActivities.cashToSuppliers, data.companyInfo.currencySymbol));
    template = template.replace(/{{cashForExpenses}}/g, formatCurrency(data.operatingActivities.cashForExpenses, data.companyInfo.currencySymbol));
    template = template.replace(/{{netOperatingCash}}/g, formatCurrency(data.operatingActivities.netOperatingCash, data.companyInfo.currencySymbol));
    
    // Replace investing activities
    template = template.replace(/{{equipmentPurchases}}/g, formatCurrency(data.investingActivities.equipmentPurchases, data.companyInfo.currencySymbol));
    template = template.replace(/{{assetSales}}/g, formatCurrency(data.investingActivities.assetSales, data.companyInfo.currencySymbol));
    template = template.replace(/{{netInvestingCash}}/g, formatCurrency(data.investingActivities.netInvestingCash, data.companyInfo.currencySymbol));
    
    // Replace financing activities
    template = template.replace(/{{ownerInvestments}}/g, formatCurrency(data.financingActivities.ownerInvestments, data.companyInfo.currencySymbol));
    template = template.replace(/{{loanPayments}}/g, formatCurrency(data.financingActivities.loanPayments, data.companyInfo.currencySymbol));
    template = template.replace(/{{netFinancingCash}}/g, formatCurrency(data.financingActivities.netFinancingCash, data.companyInfo.currencySymbol));
    
    // Replace totals
    template = template.replace(/{{netCashFlow}}/g, formatCurrency(data.netCashFlow, data.companyInfo.currencySymbol));
    template = template.replace(/{{beginningCash}}/g, formatCurrency(data.beginningCash, data.companyInfo.currencySymbol));
    template = template.replace(/{{endingCash}}/g, formatCurrency(data.endingCash, data.companyInfo.currencySymbol));
    
    // Add generation date
    template = template.replace(/{{generationDate}}/g, new Date().toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
    }));
    
    return template;
}

/**
 * Fill Balance Sheet template with data
 */
async function fillBalanceSheetTemplate(templatePath: string, data: BalanceSheet): Promise<string> {
    let template = await readFile(templatePath, 'utf-8');
    
    // Replace company information
    template = template.replace(/{{companyName}}/g, data.companyInfo.name);
    template = template.replace(/{{companyAddress}}/g, data.companyInfo.address);
    template = template.replace(/{{companyPhone}}/g, data.companyInfo.phone);
    template = template.replace(/{{companyEmail}}/g, data.companyInfo.email);
    template = template.replace(/{{currency}}/g, data.companyInfo.currency);
    template = template.replace(/{{currencySymbol}}/g, data.companyInfo.currencySymbol);
    
    // Replace date
    template = template.replace(/{{asOfDate}}/g, data.asOfDate.toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
    }));
    
    // Replace current assets
    template = template.replace(/{{cash}}/g, formatCurrency(data.assets.currentAssets.cash, data.companyInfo.currencySymbol));
    template = template.replace(/{{accountsReceivable}}/g, formatCurrency(data.assets.currentAssets.accountsReceivable, data.companyInfo.currencySymbol));
    template = template.replace(/{{inventory}}/g, formatCurrency(data.assets.currentAssets.inventory, data.companyInfo.currencySymbol));
    template = template.replace(/{{otherCurrentAssets}}/g, formatCurrency(data.assets.currentAssets.otherCurrentAssets, data.companyInfo.currencySymbol));
    template = template.replace(/{{totalCurrentAssets}}/g, formatCurrency(data.assets.currentAssets.totalCurrentAssets, data.companyInfo.currencySymbol));
    
    // Replace fixed assets
    template = template.replace(/{{equipment}}/g, formatCurrency(data.assets.fixedAssets.equipment, data.companyInfo.currencySymbol));
    template = template.replace(/{{accumulatedDepreciation}}/g, formatCurrency(data.assets.fixedAssets.accumulatedDepreciation, data.companyInfo.currencySymbol));
    template = template.replace(/{{netFixedAssets}}/g, formatCurrency(data.assets.fixedAssets.netFixedAssets, data.companyInfo.currencySymbol));
    template = template.replace(/{{totalAssets}}/g, formatCurrency(data.assets.totalAssets, data.companyInfo.currencySymbol));
    
    // Replace current liabilities
    template = template.replace(/{{accountsPayable}}/g, formatCurrency(data.liabilities.currentLiabilities.accountsPayable, data.companyInfo.currencySymbol));
    template = template.replace(/{{accrualExpenses}}/g, formatCurrency(data.liabilities.currentLiabilities.accrualExpenses, data.companyInfo.currencySymbol));
    template = template.replace(/{{otherCurrentLiabilities}}/g, formatCurrency(data.liabilities.currentLiabilities.otherCurrentLiabilities, data.companyInfo.currencySymbol));
    template = template.replace(/{{totalCurrentLiabilities}}/g, formatCurrency(data.liabilities.currentLiabilities.totalCurrentLiabilities, data.companyInfo.currencySymbol));
    
    // Replace long-term liabilities
    template = template.replace(/{{loans}}/g, formatCurrency(data.liabilities.longTermLiabilities.loans, data.companyInfo.currencySymbol));
    template = template.replace(/{{otherLongTerm}}/g, formatCurrency(data.liabilities.longTermLiabilities.otherLongTerm, data.companyInfo.currencySymbol));
    template = template.replace(/{{totalLongTermLiabilities}}/g, formatCurrency(data.liabilities.longTermLiabilities.totalLongTermLiabilities, data.companyInfo.currencySymbol));
    template = template.replace(/{{totalLiabilities}}/g, formatCurrency(data.liabilities.totalLiabilities, data.companyInfo.currencySymbol));
    
    // Replace equity
    template = template.replace(/{{ownerEquity}}/g, formatCurrency(data.equity.ownerEquity, data.companyInfo.currencySymbol));
    template = template.replace(/{{retainedEarnings}}/g, formatCurrency(data.equity.retainedEarnings, data.companyInfo.currencySymbol));
    template = template.replace(/{{totalEquity}}/g, formatCurrency(data.equity.totalEquity, data.companyInfo.currencySymbol));
    template = template.replace(/{{totalLiabilitiesAndEquity}}/g, formatCurrency(data.totalLiabilitiesAndEquity, data.companyInfo.currencySymbol));
    
    // Add generation date
    template = template.replace(/{{generationDate}}/g, new Date().toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
    }));
    
    return template;
}

/**
 * Helper function to format currency
 */
function formatCurrency(amount: number, currencySymbol: string): string {
    return `${currencySymbol}${amount.toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    })}`;
}

/**
 * Helper function to format percentage
 */
function formatPercentage(percentage: number): string {
    return `${percentage.toFixed(1)}%`;
}
