import { Router } from "express";
import {
    addExpenseHandler,
    getExpensesHandler,
    getExpenseHandler,
    updateExpenseHandler,
    deleteExpenseHandler,
    approveExpenseHandler,
    rejectExpenseHandler,
    getExpenseAnalyticsHandler,
} from "../controllers/expense.controller";

const router = Router();

router.get("/", getExpensesHandler);
router.post("/", addExpenseHandler);
router.get("/analytics", getExpenseAnalyticsHandler);
router.get("/:id", getExpenseHandler);
router.patch("/:id", updateExpenseHandler);
router.delete("/:id", deleteExpenseHandler);
router.patch("/:id/approve", approveExpenseHandler);
router.patch("/:id/reject", rejectExpenseHandler);

export default router;
