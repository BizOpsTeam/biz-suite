import { Router } from "express";
import {
    getInvoicesHandler,
    updateInvoicePaymentHandler,
    downloadInvoicePdfHandler,
    emailInvoicePdfHandler,
    getInvoiceAuditTrailHandler,
} from "../controllers/invoices.controller";

const invoicesRoutes = Router();

invoicesRoutes.get("/", getInvoicesHandler);
invoicesRoutes.patch("/:id/payment", updateInvoicePaymentHandler);
invoicesRoutes.get("/:id/pdf", downloadInvoicePdfHandler);
invoicesRoutes.post("/:id/email-pdf", emailInvoicePdfHandler);
invoicesRoutes.get("/:id/audit-trail", getInvoiceAuditTrailHandler);

export default invoicesRoutes;
