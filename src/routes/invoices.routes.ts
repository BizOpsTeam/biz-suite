import { Router } from "express";
import { getInvoicesHandler } from "../controllers/invoices.controller";

const invoicesRoutes = Router()

invoicesRoutes.get('/', getInvoicesHandler)

export default invoicesRoutes