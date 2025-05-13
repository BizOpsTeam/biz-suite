import { Router } from "express";

const salesRoutes = Router()
import { addSaleHandler, getSalesStatsHandler } from "../controllers/sales.controller";

// prefix -> sales
salesRoutes.post("/add", addSaleHandler)
salesRoutes.get("/stats", getSalesStatsHandler)

export default salesRoutes;