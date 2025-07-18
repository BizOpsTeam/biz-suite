// Receipts route Swagger documentation

export const receiptsDocs = `
/**
 * @swagger
 * tags:
 *   name: Receipts
 *   description: Receipt management and PDF/email export
 */

/**
 * @swagger
 * /receipts/{invoiceId}:
 *   get:
 *     summary: Download receipt as PDF
 *     tags: [Receipts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         schema:
 *           type: string
 *         required: true
 *         description: The invoice ID for which to download the receipt
 *     responses:
 *       200:
 *         description: PDF file of the receipt
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Receipt not found
 */

/**
 * @swagger
 * /receipts/{invoiceId}/email:
 *   post:
 *     summary: Email receipt PDF to the customer
 *     tags: [Receipts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         schema:
 *           type: string
 *         required: true
 *         description: The invoice ID for which to email the receipt
 *     responses:
 *       200:
 *         description: Receipt PDF emailed to customer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Customer email not found or other error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Receipt not found
 */

/**
 * @swagger
 * /receipts/{invoiceId}/audit-trail:
 *   get:
 *     summary: Get audit trail for a receipt
 *     tags: [Receipts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         schema:
 *           type: string
 *         required: true
 *         description: The invoice ID for which to fetch the receipt audit trail
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         required: false
 *         description: Max number of logs to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         required: false
 *         description: Number of logs to skip (for pagination)
 *       - in: query
 *         name: eventType
 *         schema:
 *           type: string
 *           enum: [VIEWED, DOWNLOADED, EMAILED]
 *         required: false
 *         description: Filter by event type
 *     responses:
 *       200:
 *         description: List of audit logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       receiptId:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       eventType:
 *                         type: string
 *                         enum: [VIEWED, DOWNLOADED, EMAILED]
 *                       eventDetails:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Receipt not found
 */

/**
 * @swagger
 * /receipts:
 *   get:
 *     summary: Get all receipts for the authenticated user (with filtering, search, sort, and pagination)
 *     tags: [Receipts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by customer ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by receipt status
 *       - in: query
 *         name: issuedById
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by user who issued the receipt
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Search by receipt number or customer name (case-insensitive, partial match)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           example: issuedAt:desc
 *         required: false
 *         description: Sort by field and direction (e.g., issuedAt:desc, total:asc)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         required: false
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         required: false
 *         description: Number of results per page
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Filter receipts issued after this date (inclusive)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Filter receipts issued before this date (inclusive)
 *     responses:
 *       200:
 *         description: Paginated receipts fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Receipt'
 *                 total:
 *                   type: integer
 *                   description: Total number of receipts matching the query
 *                 page:
 *                   type: integer
 *                   description: Current page number
 *                 limit:
 *                   type: integer
 *                   description: Number of results per page
 *                 totalPages:
 *                   type: integer
 *                   description: Total number of pages
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Receipt:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         invoiceId:
 *           type: string
 *         amount:
 *           type: number
 *         currencyCode:
 *           type: string
 *         currencySymbol:
 *           type: string
 *         issuedAt:
 *           type: string
 *           format: date-time
 *         customerName:
 *           type: string
 *         customerEmail:
 *           type: string
 *         status:
 *           type: string
 *           enum: [ISSUED, EMAILED]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
`;
