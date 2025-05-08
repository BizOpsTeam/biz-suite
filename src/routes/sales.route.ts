import { Router } from "express";

const salesRoutes = Router()
import { addSaleHandler } from "../controllers/sales.controller";

salesRoutes.post("/add", addSaleHandler)

export default salesRoutes;