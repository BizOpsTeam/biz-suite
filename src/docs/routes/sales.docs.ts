// Sales route Swagger documentation

export const salesDocs = `
/**
 * @swagger
 * tags:
 *   name: Sales
 *   description: Sales management and reporting
 */

/**
 * @swagger
 * /sales/add:
 *   post:
 *     summary: Add a new sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SaleInput'
 *     responses:
 *       201:
 *         description: Sale added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Sale'
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /sales/stats:
 *   get:
 *     summary: Get sales statistics
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *         required: false
 *         description: "Period for statistics (default: day)"
 *     responses:
 *       200:
 *         description: Stats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SalesStats'
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /sales:
 *   get:
 *     summary: Get all sales for the authenticated user (with filtering, search, sort, and pagination)
 *     tags: [Sales]
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
 *         name: paymentMethod
 *         schema:
 *           type: string
 *           enum: [CASH, CREDIT_CARD, CREDIT, MOBILE_MONEY]
 *         required: false
 *         description: Filter by payment method
 *       - in: query
 *         name: channel
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by sales channel (e.g., in-store, online)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by sale status (e.g., completed, pending)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Search by customer name or sale notes (case-insensitive, partial match)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           example: createdAt:desc
 *         required: false
 *         description: Sort by field and direction (e.g., createdAt:desc, totalAmount:asc)
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
 *         description: Filter sales created after this date (inclusive)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Filter sales created before this date (inclusive)
 *     responses:
 *       200:
 *         description: Paginated sales fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Sale'
 *                 total:
 *                   type: integer
 *                   description: Total number of sales matching the query
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
 * /sales/{saleId}:
 *   delete:
 *     summary: Delete a sale by ID
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: saleId
 *         schema:
 *           type: string
 *         required: true
 *         description: Sale ID
 *     responses:
 *       200:
 *         description: Sale deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Sale not found
 */
`;
