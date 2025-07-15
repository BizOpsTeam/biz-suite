import { Router } from "express";
import { getInvoicesHandler, updateInvoicePaymentHandler } from "../controllers/invoices.controller";

const invoicesRoutes = Router()

invoicesRoutes.get('/', getInvoicesHandler)
invoicesRoutes.patch('/:id/payment', updateInvoicePaymentHandler);

export default invoicesRoutes