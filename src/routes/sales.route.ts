import { Router } from "express";

const salesRoutes = Router()
import { addSaleHandler } from "../controllers/sales.controller";

// prefix -> sales
salesRoutes.post("/add", addSaleHandler)

export default salesRoutes;