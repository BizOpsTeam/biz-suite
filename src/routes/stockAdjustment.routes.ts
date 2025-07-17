import { Router } from "express";
import {
    addStockAdjustmentHandler,
    getStockAdjustmentsHandler,
    getStockAdjustmentHandler,
    deleteStockAdjustmentHandler,
} from "../controllers/stockAdjustment.controller";

const router = Router();

router.get("/", getStockAdjustmentsHandler);
router.post("/", addStockAdjustmentHandler);
router.get("/:id", getStockAdjustmentHandler);
router.delete("/:id", deleteStockAdjustmentHandler);

export default router; 