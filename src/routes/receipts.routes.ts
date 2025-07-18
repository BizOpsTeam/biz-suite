import { Router } from "express";
import catchErrors from "../utils/catchErrors";
import {
    downloadReceiptHandler,
    emailReceiptHandler,
    getReceiptAuditTrailHandler,
    getReceiptsHandler,
} from "../controllers/receipts.controller";

const receiptsRoutes = Router();

// Download receipt PDF
receiptsRoutes.get("/:invoiceId", catchErrors(downloadReceiptHandler));

// Email receipt PDF
receiptsRoutes.post("/:invoiceId/email", catchErrors(emailReceiptHandler));

// Audit trail for receipt
receiptsRoutes.get(
    "/:invoiceId/audit-trail",
    catchErrors(getReceiptAuditTrailHandler),
);

// List receipts
receiptsRoutes.get("/", catchErrors(getReceiptsHandler));

export default receiptsRoutes;
