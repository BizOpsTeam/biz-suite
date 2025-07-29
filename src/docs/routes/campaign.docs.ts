/**
 * @openapi
 * /api/campaigns:
 *   post:
 *     summary: Create a new campaign
 *     tags:
 *       - Campaigns
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "July Promo"
 *               message:
 *                 type: string
 *                 example: "Get 20% off all items this July!"
 *               broadcastToAll:
 *                 type: boolean
 *                 example: false
 *               recipients:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 example: ["c1b2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e"]
 *               schedule:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-08-01T09:00:00.000Z"
 *     responses:
 *       201:
 *         description: Campaign created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Campaign'
 *                 message:
 *                   type: string
 *                   example: Campaign created successfully
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *
 * components:
 *   schemas:
 *     Campaign:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         message:
 *           type: string
 *         broadcastToAll:
 *           type: boolean
 *         schedule:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         recipients:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CampaignRecipient'
 *     CampaignRecipient:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         customerId:
 *           type: string
 *           format: uuid
 *
 * /api/campaigns:
 *   get:
 *     summary: Get all campaigns for an owner
 *     tags:
 *       - Campaigns
 *     parameters:
 *       - in: query
 *         name: ownerId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The ID of the campaign owner (User)
 *     responses:
 *       200:
 *         description: List of campaigns
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Campaign'
 *                 message:
 *                   type: string
 *                   example: Campaigns retrieved successfully
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *
 * components:
 *   schemas:
 *     Campaign:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         message:
 *           type: string
 *         broadcastToAll:
 *           type: boolean
 *         schedule:
 *           type: string
 *           format: date-time
 *         ownerId:
 *           type: string
 *           format: uuid
 *         owner:
 *           $ref: '#/components/schemas/UserModel'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         recipients:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CampaignRecipient'
 *     CampaignRecipient:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         customerId:
 *           type: string
 *           format: uuid
 *     UserModel:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         role:
 *           type: string
 *           example: admin
 */
