import { Router } from "express";
import {
    addBudgetHandler,
    getBudgetsHandler,
    getBudgetHandler,
    updateBudgetHandler,
    deleteBudgetHandler,
    getBudgetAnalyticsHandler,
    createBudgetPeriodHandler,
} from "../controllers/budget.controller";

const router = Router();

router.get("/", getBudgetsHandler);
router.post("/", addBudgetHandler);
router.get("/analytics", getBudgetAnalyticsHandler);
router.post("/period", createBudgetPeriodHandler);
router.get("/:id", getBudgetHandler);
router.patch("/:id", updateBudgetHandler);
router.delete("/:id", deleteBudgetHandler);

export default router; 