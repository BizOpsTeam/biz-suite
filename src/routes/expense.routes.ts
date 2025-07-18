import { Router } from "express";
import {
    addExpenseHandler,
    getExpensesHandler,
    getExpenseHandler,
    updateExpenseHandler,
    deleteExpenseHandler,
} from "../controllers/expense.controller";

const router = Router();

router.get("/", getExpensesHandler);
router.post("/", addExpenseHandler);
router.get("/:id", getExpenseHandler);
router.patch("/:id", updateExpenseHandler);
router.delete("/:id", deleteExpenseHandler);

export default router;
