import { Router } from "express";

const salesRoutes = Router()
import { addSaleHandler, getAllSalesHandler, getSalesStatsHandler } from "../controllers/sales.controller";

// prefix -> sales
salesRoutes.post("/add", addSaleHandler)
salesRoutes.get("/stats", getSalesStatsHandler)
salesRoutes.get("/", getAllSalesHandler)

export default salesRoutes;