// Invoices route Swagger documentation

export const invoicesDocs = `
/**
 * @swagger
 * tags:
 *   name: Invoices
 *   description: Invoice management
 */

/**
 * @swagger
 * /invoices:
 *   get:
 *     summary: Get all invoices for the authenticated user (with filtering, search, sort, and pagination)
 *     tags: [Invoices]
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
 *           enum: [UNPAID, PARTIAL, PAID]
 *         required: false
 *         description: Filter by invoice status
 *       - in: query
 *         name: currencyCode
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by currency code (e.g., USD, EUR, NGN)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Search by invoice number, customer name, or notes (case-insensitive, partial match)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           example: createdAt:desc
 *         required: false
 *         description: Sort by field and direction (e.g., createdAt:desc, amountDue:asc)
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
 *         description: Filter invoices created after this date (inclusive)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Filter invoices created before this date (inclusive)
 *     responses:
 *       200:
 *         description: Paginated invoices fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Invoice'
 *                 total:
 *                   type: integer
 *                   description: Total number of invoices matching the query
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
 * /invoices:
 *   post:
 *     summary: Create a new invoice
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               saleId:
 *                 type: string
 *                 example: "sale_123"
 *               amountDue:
 *                 type: number
 *                 example: 1000
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-07-16T23:59:59.000Z"
 *               currencyCode:
 *                 type: string
 *                 example: "USD"
 *                 description: ISO currency code (e.g., USD, EUR, NGN)
 *               currencySymbol:
 *                 type: string
 *                 example: "$"
 *                 description: Currency symbol (e.g., $, ₦)
 *               taxRate:
 *                 type: number
 *                 example: 0.075
 *                 description: Tax rate as a decimal (e.g., 0.075 for 7.5%)
 *               taxAmount:
 *                 type: number
 *                 example: 75
 *                 description: Total tax amount for the invoice
 *     responses:
 *       201:
 *         description: Invoice created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Invoice'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /invoices/{id}/payment:
 *   patch:
 *     summary: Update invoice payment status
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The invoice ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [UNPAID, PARTIAL, PAID]
 *                 example: PAID
 *               paidAmount:
 *                 type: number
 *                 example: 1000
 *               paidAt:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-06-12T12:00:00.000Z
 *     responses:
 *       200:
 *         description: Invoice payment updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Invoice'
 *       400:
 *         description: Invalid input or business rule violation
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Invoice not found
 */

/**
 * @swagger
 * /invoices/{id}/pdf:
 *   get:
 *     summary: Download invoice as PDF
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The invoice ID
 *     responses:
 *       200:
 *         description: PDF file of the invoice
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Invoice not found
 */

/**
 * @swagger
 * /invoices/{id}/email-pdf:
 *   post:
 *     summary: Email invoice PDF to the customer
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The invoice ID
 *     responses:
 *       200:
 *         description: Invoice PDF emailed to customer
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
 *         description: Invoice not found
 */

/**
 * @swagger
 * /invoices/{id}/audit-trail:
 *   get:
 *     summary: Get audit trail for an invoice
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The invoice ID
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
 *                       invoiceId:
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
 *         description: Invoice not found
 */

/**
 * @swagger
 * /invoices/search:
 *   get:
 *     summary: Search invoices with advanced filtering, sorting, and pagination
 *     tags: [Invoices]
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
 *           enum: [UNPAID, PARTIAL, PAID]
 *         required: false
 *         description: Filter by invoice status
 *       - in: query
 *         name: currencyCode
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by currency code (e.g., USD, EUR, NGN)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Search by invoice number, customer name, or notes (case-insensitive, partial match)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           example: createdAt:desc
 *         required: false
 *         description: Sort by field and direction (e.g., createdAt:desc, amountDue:asc)
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
 *         description: Filter invoices created after this date (inclusive)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Filter invoices created before this date (inclusive)
 *     responses:
 *       200:
 *         description: Paginated invoices fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Invoice'
 *                 total:
 *                   type: integer
 *                   description: Total number of invoices matching the query
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
 * /invoices/{id}:
 *   delete:
 *     summary: Delete an invoice by ID (must be owned by the authenticated user)
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Invoice ID
 *     responses:
 *       200:
 *         description: Invoice deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invoice ID is required
 *       401:
 *         description: Unauthorized or not owner
 *       404:
 *         description: Invoice not found
 */
`;
