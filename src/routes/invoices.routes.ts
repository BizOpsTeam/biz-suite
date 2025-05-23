import { Router } from "express";
import { getInvoicesHandler } from "../controllers/invoices.controller";

const invoicesRoutes = Router()

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
 *     summary: Get all invoices for the authenticated user
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of invoices
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Invoice'
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */

//prefix --> invoices
invoicesRoutes.get('/', getInvoicesHandler)

export default invoicesRoutes