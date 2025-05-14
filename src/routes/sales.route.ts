import { Router } from "express";

const salesRoutes = Router()
import { addSaleHandler, deleteSaleHandler, getAllSalesHandler, getSalesStatsHandler } from "../controllers/sales.controller";

// prefix -> sales
salesRoutes.post("/add", addSaleHandler)
salesRoutes.get("/stats", getSalesStatsHandler)
salesRoutes.get("/", getAllSalesHandler)
salesRoutes.delete("/:saleId", deleteSaleHandler)

export default salesRoutes;