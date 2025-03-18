import { Router } from "express";
import { loginHandler, logoutHandler, refreshTokenHandler, registerHandler, verifyEmailHandler } from "../controllers/auth.controller";

const authRoutes = Router()

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     description: Creates a new user account and returns an access token.
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
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongP@ssw0rd
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "12345"
 *                 email:
 *                   type: string
 *                   example: johndoe@example.com
 *                 accessToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR..."
 *       400:
 *         description: Invalid input data
 *       409:
 *         description: User already exists
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     description: Authenticates a user and returns an access token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongP@ssw0rd
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR..."
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     description: Logs out a user by invalidating the refresh token.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *       401:
 *         description: Unauthorized
 */
//prefix is auth
authRoutes.post('/register', registerHandler)
authRoutes.post('/login', loginHandler)
authRoutes.post('/logout', logoutHandler)
authRoutes.post('/refresh', refreshTokenHandler)
authRoutes.post('/verify-email', verifyEmailHandler)

export default authRoutes