import { Router } from "express";
import {
    getInvoicesHandler,
    updateInvoicePaymentHandler,
    downloadInvoicePdfHandler,
    emailInvoicePdfHandler,
    getInvoiceAuditTrailHandler,
    deleteInvoiceHandler,
} from "../controllers/invoices.controller";
import { authenticateUser } from "../middlewares/authenticateUser";

const invoicesRoutes = Router();

invoicesRoutes.get("/", getInvoicesHandler);
invoicesRoutes.patch("/:id/payment", updateInvoicePaymentHandler);
invoicesRoutes.get("/:id/pdf", downloadInvoicePdfHandler);
invoicesRoutes.post("/:id/email-pdf", emailInvoicePdfHandler);
invoicesRoutes.get("/:id/audit-trail", getInvoiceAuditTrailHandler);
invoicesRoutes.delete("/:id", authenticateUser, deleteInvoiceHandler);

export default invoicesRoutes;
