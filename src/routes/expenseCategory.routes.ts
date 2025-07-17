import { Router } from "express";
import {
    addExpenseCategoryHandler,
    getExpenseCategoriesHandler,
    getExpenseCategoryHandler,
    updateExpenseCategoryHandler,
    deleteExpenseCategoryHandler,
} from "../controllers/expenseCategory.controller";

const router = Router();

router.get("/", getExpenseCategoriesHandler);
router.post("/", addExpenseCategoryHandler);
router.get("/:id", getExpenseCategoryHandler);
router.patch("/:id", updateExpenseCategoryHandler);
router.delete("/:id", deleteExpenseCategoryHandler);

export default router; 