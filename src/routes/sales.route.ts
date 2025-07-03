import { Router } from "express";
import { addSaleHandler, deleteSaleHandler, getAllSalesHandler, getSalesStatsHandler } from "../controllers/sales.controller";

const salesRoutes = Router()

salesRoutes.post("/add", addSaleHandler)
salesRoutes.get("/stats", getSalesStatsHandler)
salesRoutes.get("/", getAllSalesHandler)
salesRoutes.delete("/:saleId", deleteSaleHandler)

export default salesRoutes;