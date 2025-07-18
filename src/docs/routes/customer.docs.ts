export const customerDocs = `
/**
 * @swagger
 * /customers/{id}/statement:
 *   get:
 *     summary: Get a customer statement (sales, payments, balance)
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Customer ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Filter statement from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Filter statement up to this date
 *     responses:
 *       200:
 *         description: Customer statement
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     customer:
 *                       type: object
 *                       properties:
 *                         id: { type: string }
 *                         name: { type: string }
 *                         email: { type: string }
 *                     statement:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date: { type: string, format: date-time }
 *                           type: { type: string, enum: [sale, payment] }
 *                           amount: { type: number }
 *                           description: { type: string }
 *                     totalSales: { type: number }
 *                     totalPayments: { type: number }
 *                     outstandingBalance: { type: number }
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
`;
