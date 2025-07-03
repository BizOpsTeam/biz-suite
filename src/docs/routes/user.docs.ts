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
`; 