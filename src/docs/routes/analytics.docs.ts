export const analyticsDocs = `
/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Business analytics and insights
 */

/**
 * @swagger
 * /analytics/top-products:
 *   get:
 *     summary: Get top-selling products for a given period
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year, custom]
 *         required: false
 *         description: "Period to aggregate sales (default: month)"
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Start date (required if period=custom)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: End date (required if period=custom)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         required: false
 *         description: Number of top products to return
 *     responses:
 *       200:
 *         description: List of top-selling products
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
 *                       productId:
 *                         type: string
 *                       name:
 *                         type: string
 *                       totalSold:
 *                         type: integer
 *                       totalRevenue:
 *                         type: number
 *                       timesSold:
 *                         type: integer
 *                       product:
 *                         $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid input or missing required parameters
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /analytics/sales-over-time:
 *   get:
 *     summary: Get sales totals grouped by period (for graphing trends)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year, custom]
 *         required: false
 *         description: "Period to group sales (default: month)"
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Start date (required if period=custom)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: End date (required if period=custom)
 *     responses:
 *       200:
 *         description: Sales totals by period
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
 *                       period:
 *                         type: string
 *                       totalAmount:
 *                         type: number
 *       400:
 *         description: Invalid input or missing required parameters
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /analytics/sales-by-channel:
 *   get:
 *     summary: Get sales totals grouped by channel
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year, custom]
 *         required: false
 *         description: "Period to group sales (default: month)"
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Start date (required if period=custom)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: End date (required if period=custom)
 *     responses:
 *       200:
 *         description: Sales totals by channel
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
 *                       channel:
 *                         type: string
 *                       totalAmount:
 *                         type: number
 *       400:
 *         description: Invalid input or missing required parameters
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /analytics/sales-by-payment-method:
 *   get:
 *     summary: Get sales totals grouped by payment method
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year, custom]
 *         required: false
 *         description: "Period to group sales (default: month)"
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Start date (required if period=custom)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: End date (required if period=custom)
 *     responses:
 *       200:
 *         description: Sales totals by payment method
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
 *                       paymentMethod:
 *                         type: string
 *                       totalAmount:
 *                         type: number
 *       400:
 *         description: Invalid input or missing required parameters
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /analytics/top-customers:
 *   get:
 *     summary: Get top customers by spend or count
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year, custom]
 *         required: false
 *         description: "Period to aggregate sales (default: month)"
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Start date (required if period=custom)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: End date (required if period=custom)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         required: false
 *         description: Number of top customers to return
 *     responses:
 *       200:
 *         description: List of top customers
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
 *                       customerId:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       totalSpent:
 *                         type: number
 *                       salesCount:
 *                         type: integer
 *                       customer:
 *                         $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Invalid input or missing required parameters
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /analytics/average-order-value:
 *   get:
 *     summary: Get average order value for the period
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year, custom]
 *         required: false
 *         description: "Period to aggregate sales (default: month)"
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Start date (required if period=custom)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: End date (required if period=custom)
 *     responses:
 *       200:
 *         description: Average order value and related stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     averageOrderValue:
 *                       type: number
 *                     totalOrders:
 *                       type: integer
 *                     totalAmount:
 *                       type: number
 *       400:
 *         description: Invalid input or missing required parameters
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /analytics/discount-impact:
 *   get:
 *     summary: Get total and average discounts given, and their impact on revenue
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year, custom]
 *         required: false
 *         description: "Period to aggregate sales (default: month)"
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Start date (required if period=custom)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: End date (required if period=custom)
 *     responses:
 *       200:
 *         description: Discount analytics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalDiscount:
 *                       type: number
 *                     averageDiscount:
 *                       type: number
 *                     discountRate:
 *                       type: number
 *                     totalAmount:
 *                       type: number
 *                     totalOrders:
 *                       type: integer
 *       400:
 *         description: Invalid input or missing required parameters
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /analytics/stockouts:
 *   get:
 *     summary: Get products that have gone out of stock in a given period
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year, custom]
 *         required: false
 *         description: "Period to check for stockouts (default: month)"
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Start date (required if period=custom)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: End date (required if period=custom)
 *     responses:
 *       200:
 *         description: List of stockout products
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
 *                       productId:
 *                         type: string
 *                       name:
 *                         type: string
 *                       stock:
 *                         type: integer
 *                       lastSold:
 *                         type: string
 *                         format: date-time
 *                       totalSold:
 *                         type: integer
 *                       estimatedLostSales:
 *                         type: integer
 *                       product:
 *                         $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid input or missing required parameters
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /analytics/slow-moving-inventory:
 *   get:
 *     summary: Get products with low or zero sales in a given period
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year, custom]
 *         required: false
 *         description: "Period to check for slow-moving inventory (default: month)"
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Start date (required if period=custom)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: End date (required if period=custom)
 *       - in: query
 *         name: threshold
 *         schema:
 *           type: integer
 *           default: 5
 *         required: false
 *         description: "Sales threshold for slow-moving (default: 5)"
 *     responses:
 *       200:
 *         description: List of slow-moving products
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
 *                       productId:
 *                         type: string
 *                       name:
 *                         type: string
 *                       stock:
 *                         type: integer
 *                       totalSold:
 *                         type: integer
 *                       product:
 *                         $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid input or missing required parameters
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /analytics/forecast/sales:
 *   get:
 *     summary: Forecast total sales for the next N periods
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *         required: false
 *         description: "Period to forecast (default: month)"
 *       - in: query
 *         name: horizon
 *         schema:
 *           type: integer
 *           default: 3
 *         required: false
 *         description: Number of future periods to forecast
 *       - in: query
 *         name: method
 *         schema:
 *           type: string
 *           enum: [auto, moving-average, linear]
 *         required: false
 *         description: "Forecasting method (default: auto)"
 *     responses:
 *       200:
 *         description: Forecasted sales totals
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
 *                       period:
 *                         type: string
 *                       forecast:
 *                         type: number
 *       400:
 *         description: Invalid input or missing required parameters
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /analytics/forecast/product-sales:
 *   get:
 *     summary: Forecast sales for each product (or a specific product) for the next N periods
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *         required: false
 *         description: "Period to forecast (default: month)"
 *       - in: query
 *         name: horizon
 *         schema:
 *           type: integer
 *           default: 3
 *         required: false
 *         description: Number of future periods to forecast
 *       - in: query
 *         name: method
 *         schema:
 *           type: string
 *           enum: [auto, moving-average, linear]
 *         required: false
 *         description: "Forecasting method (default: auto)"
 *       - in: query
 *         name: productId
 *         schema:
 *           type: string
 *         required: false
 *         description: Product ID to forecast (if omitted, forecasts all products)
 *     responses:
 *       200:
 *         description: Forecasted sales for products
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
 *                       productId:
 *                         type: string
 *                       name:
 *                         type: string
 *                       forecast:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             period:
 *                               type: string
 *                             forecast:
 *                               type: number
 *                       history:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             period:
 *                               type: string
 *                             value:
 *                               type: number
 *                       product:
 *                         $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid input or missing required parameters
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /analytics/forecast/stockouts:
 *   get:
 *     summary: Predict products at risk of stockout in the next N periods
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *         required: false
 *         description: "Period to forecast (default: month)"
 *       - in: query
 *         name: horizon
 *         schema:
 *           type: integer
 *           default: 3
 *         required: false
 *         description: Number of future periods to forecast
 *       - in: query
 *         name: method
 *         schema:
 *           type: string
 *           enum: [auto, moving-average, linear]
 *         required: false
 *         description: "Forecasting method (default: auto)"
 *     responses:
 *       200:
 *         description: Products at risk of stockout
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
 *                       productId:
 *                         type: string
 *                       name:
 *                         type: string
 *                       stock:
 *                         type: integer
 *                       forecast:
 *                         type: array
 *                         items:
 *                           type: number
 *                       totalForecast:
 *                         type: number
 *                       atRisk:
 *                         type: boolean
 *                       product:
 *                         $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid input or missing required parameters
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /analytics/forecast/seasonality:
 *   get:
 *     summary: Detect and visualize seasonality patterns in sales (e.g., by day of week, day of month, or month)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, year]
 *         required: false
 *         description: "Period to analyze for seasonality (default: month)"
 *       - in: query
 *         name: productId
 *         schema:
 *           type: string
 *         required: false
 *         description: Product ID to analyze (if omitted, analyzes all sales)
 *     responses:
 *       200:
 *         description: Seasonality analysis results
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
 *                       subPeriod:
 *                         type: string
 *                         description: Sub-period (e.g., day of week, day of month, or month)
 *                       average:
 *                         type: number
 *                         description: Average sales in this sub-period
 *                       total:
 *                         type: number
 *                         description: Total sales in this sub-period
 *                       count:
 *                         type: integer
 *                         description: Number of sales in this sub-period
 *       400:
 *         description: Invalid input or missing required parameters
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /analytics/profit-loss:
 *   get:
 *     summary: Get profit and loss statement for a given period
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Start date (defaults to first day of current month)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: End date (defaults to last day of current month)
 *     responses:
 *       200:
 *         description: Profit and loss statement
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     revenue:
 *                       type: number
 *                       description: Total sales revenue
 *                     cogs:
 *                       type: number
 *                       description: Cost of goods sold
 *                     grossProfit:
 *                       type: number
 *                       description: Gross profit (revenue - cogs)
 *                     expenses:
 *                       type: number
 *                       description: Total expenses
 *                     netProfit:
 *                       type: number
 *                       description: Net profit (gross profit - expenses)
 *                     breakdown:
 *                       type: object
 *                       properties:
 *                         salesCount:
 *                           type: integer
 *                         saleItemsCount:
 *                           type: integer
 *                         expenseCount:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 */
`;
