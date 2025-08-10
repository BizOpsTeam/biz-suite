import { Router } from "express";
import {
    generateProfitLossHandler,
    generateCashFlowHandler,
    generateBalanceSheetHandler,
    downloadProfitLossPdfHandler,
    downloadCashFlowPdfHandler,
    downloadBalanceSheetPdfHandler,
    generateLoanApplicationPackageHandler,
    getFinancialSummaryHandler,
} from "../controllers/financialStatements.controller";

const router = Router();

// Financial Statement Generation Routes
router.get("/profit-loss", generateProfitLossHandler);
router.get("/cash-flow", generateCashFlowHandler);
router.get("/balance-sheet", generateBalanceSheetHandler);
router.get("/summary", getFinancialSummaryHandler);

// PDF Download Routes
router.get("/profit-loss/download", downloadProfitLossPdfHandler);
router.get("/cash-flow/download", downloadCashFlowPdfHandler);
router.get("/balance-sheet/download", downloadBalanceSheetPdfHandler);

// Loan Application Package
router.post("/loan-application-package", generateLoanApplicationPackageHandler);

export default router;

