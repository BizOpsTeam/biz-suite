import { Router } from "express";
import {
    addSaleHandler,
    deleteSaleHandler,
    getAllSalesHandler,
    getSalesStatsHandler,
    getTodaySalesCountHandler,
} from "../controllers/sales.controller";

const salesRoutes = Router();

salesRoutes.post("/", addSaleHandler);
salesRoutes.get("/stats", getSalesStatsHandler);
salesRoutes.get("/", getAllSalesHandler);
salesRoutes.delete("/:saleId", deleteSaleHandler);
salesRoutes.get("/today-sales", getTodaySalesCountHandler);

export default salesRoutes;
