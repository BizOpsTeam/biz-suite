export const stockAdjustmentDocs = `
/**
 * @swagger
 * /stock-adjustments:
 *   get:
 *     summary: List all stock adjustments (with filters)
 *     tags: [StockAdjustment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: productId
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by product
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by user
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Filter by end date
 *     responses:
 *       200:
 *         description: List of stock adjustments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/StockAdjustment'
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *
 *   post:
 *     summary: Create a new stock adjustment
 *     tags: [StockAdjustment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StockAdjustmentInput'
 *     responses:
 *       201:
 *         description: Stock adjustment created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/StockAdjustment'
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *
 * /stock-adjustments/{id}:
 *   get:
 *     summary: Get a single stock adjustment by ID
 *     tags: [StockAdjustment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Stock adjustment ID
 *     responses:
 *       200:
 *         description: Stock adjustment fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/StockAdjustment'
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 *
 *   delete:
 *     summary: Delete a stock adjustment (admin only)
 *     tags: [StockAdjustment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Stock adjustment ID
 *     responses:
 *       200:
 *         description: Stock adjustment deleted
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
 *         description: Not found
 */
`;
