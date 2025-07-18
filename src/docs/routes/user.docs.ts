// User route Swagger documentation

export const userDocs = `
/**
 * @swagger
 * /users:
 *   post:
 *     summary: Register a new user (user role)
 *     tags: [Users]
 *     description: Registers a new user with the 'user' role. Only accessible by admins or workers.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jane Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: janedoe@example.com
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input data
 */

/**
 * @swagger
 * /users/customers:
 *   post:
 *     summary: Create a new customer (your business only)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     description: Creates a new customer tied to the authenticated user. You can only access customers you have created (your business only).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *               phone:
 *                 type: string
 *                 example: '+1234567890'
 *               address:
 *                 type: string
 *                 example: '123 Main St, City, Country'
 *     responses:
 *       201:
 *         description: Customer created successfully
 *       400:
 *         description: Invalid input data
 *       409:
 *         description: Customer with this email already exists
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /users/customers:
 *   get:
 *     summary: Get all customers (your business only)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     description: Returns all customers created by the authenticated user. You can only access customers you have created (your business only).
 *     responses:
 *       200:
 *         description: List of customers
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
 *                     $ref: '#/components/schemas/Customer'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /users/customers/{id}:
 *   get:
 *     summary: Get a customer by ID (your business only)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     description: Returns a customer by ID, but only if you created them. You can only access customers you have created (your business only).
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The customer ID
 *     responses:
 *       200:
 *         description: Customer found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Customer not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /users/customers/{id}:
 *   patch:
 *     summary: Update a customer (your business only)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     description: Updates a customer, but only if you created them. You can only update customers you have created (your business only).
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The customer ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *               phone:
 *                 type: string
 *                 example: '+1234567890'
 *               address:
 *                 type: string
 *                 example: '123 Main St, City, Country'
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Customer not found
 *       409:
 *         description: Customer with this email already exists
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /users/customers/{id}:
 *   delete:
 *     summary: Delete a customer (your business only)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     description: Deletes a customer, but only if you created them. You can only delete customers you have created (your business only).
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The customer ID
 *     responses:
 *       200:
 *         description: Customer deleted
 *       404:
 *         description: Customer not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /users/profile:
 *   patch:
 *     summary: Update the authenticated user's profile (branding fields)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Acme Corp
 *               logoUrl:
 *                 type: string
 *                 format: url
 *                 example: https://example.com/logo.png
 *               companyAddress:
 *                 type: string
 *                 example: 123 Main St, City, Country
 *               companyPhone:
 *                 type: string
 *                 example: '+1234567890'
 *               invoicePrefix:
 *                 type: string
 *                 example: "ACME-"
 *                 description: Prefix for invoice numbers (e.g., "INV-", "ACME-")
 *               invoiceSuffix:
 *                 type: string
 *                 example: "-2024"
 *                 description: Suffix for invoice numbers (e.g., "-A", "-2024")
 *               invoiceSequenceStart:
 *                 type: integer
 *                 example: 1000
 *                 description: Starting number for invoice sequence (first invoice will use this)
 *               invoiceSequenceNext:
 *                 type: integer
 *                 example: 1001
 *                 description: Next invoice sequence number (auto-incremented by system)
 *     responses:
 *       200:
 *         description: User profile updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserModel'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /users/profile/logo:
 *   post:
 *     summary: Upload a company logo (Cloudinary)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: Image file (jpg, png, gif, webp, max 2MB)
 *     responses:
 *       200:
 *         description: Logo uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 url:
 *                   type: string
 *                   format: url
 *       400:
 *         description: No file uploaded or upload failed
 *       401:
 *         description: Unauthorized
 */
`;
