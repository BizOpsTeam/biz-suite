export const productCategoryDocs = `
/**
 * @swagger
 * tags:
 *   name: ProductCategory
 *   description: Product category management
 */

/**
 * @swagger
 * /product-categories:
 *   get:
 *     summary: Get all product categories
 *     tags: [ProductCategory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of product categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProductCategory'
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * /product-categories/{id}:
 *   get:
 *     summary: Get a product category by ID
 *     tags: [ProductCategory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Product category fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/ProductCategory'
 *                 message:
 *                   type: string
 *       400:
 *         description: Product category ID is required
 */

/**
 * @swagger
 * /product-categories/{id}:
 *   patch:
 *     summary: Update a product category by ID
 *     tags: [ProductCategory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductCategoryInput'
 *     responses:
 *       204:
 *         description: Category updated successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /product-categories:
 *   post:
 *     summary: Add a new product category
 *     tags: [ProductCategory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductCategoryInput'
 *     responses:
 *       201:
 *         description: Product category added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/ProductCategory'
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /product-categories/{id}:
 *   delete:
 *     summary: Delete a product category by ID
 *     tags: [ProductCategory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
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
 *         description: Category not found or not owned by user
 */
`;
