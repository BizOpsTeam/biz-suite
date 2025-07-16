import { Router } from 'express';
import { downloadReceiptHandler, emailReceiptHandler } from '../controllers/receipts.controller';

const receiptsRoutes = Router();

// Download receipt PDF
receiptsRoutes.get('/:invoiceId', downloadReceiptHandler);

// Email receipt PDF
receiptsRoutes.post('/:invoiceId/email', emailReceiptHandler);

export default receiptsRoutes; 