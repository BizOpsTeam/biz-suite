/**
 * Reminder API Documentation
 *
 * This document describes the endpoints for managing reminders in the Biz Suite API.
 * All endpoints require authentication (JWT Bearer token).
 *
 * Reminder object fields:
 * - id: string
 * - customerId: string
 * - creatorId: string
 * - due: string (ISO date)
 * - amount: number | null
 * - message: string | null
 * - type: "PAYMENT" | "MEETING" | "FOLLOW_UP" | "CUSTOM"
 * - status: "PENDING" | "SENT" | "OVERDUE"
 * - sentAt: string | null (ISO date)
 * - createdAt: string (ISO date)
 * - updatedAt: string (ISO date)
 * - customer: Customer object
 * - creator: User object
 *
 * Endpoints:
 *
 * 1. Create Reminder
 *    POST /reminders
 *    Body:
 *      {
 *        customerId: string,
 *        due: string (ISO date),
 *        amount?: number,
 *        message?: string,
 *        type?: "PAYMENT" | "MEETING" | "FOLLOW_UP" | "CUSTOM"
 *      }
 *    Response: 201 CREATED
 *      {
 *        data: Reminder,
 *        message: "Reminder created successfully"
 *      }
 *    Errors:
 *      400 - Missing required fields
 *      401 - Unauthorized
 *
 * 2. Get Reminders
 *    GET /reminders?customerId=&status=&type=&creatorId=
 *    Query params are optional filters.
 *    Response: 200 OK
 *      {
 *        data: Reminder[],
 *        message: "Reminders fetched successfully"
 *      }
 *    Errors:
 *      401 - Unauthorized
 *
 * 3. Update Reminder
 *    PATCH /reminders/:id
 *    Body: Partial fields to update (due, amount, message, status, type, sentAt)
 *    Response: 200 OK
 *      {
 *        data: Reminder,
 *        message: "Reminder updated successfully"
 *      }
 *    Errors:
 *      400 - Invalid data
 *      401 - Unauthorized
 *      404 - Not found
 *
 * 4. Delete Reminder
 *    DELETE /reminders/:id
 *    Response: 204 NO_CONTENT
 *      {
 *        message: "Reminder deleted successfully"
 *      }
 *    Errors:
 *      401 - Unauthorized
 *      404 - Not found
 *
 * 5. Mark Reminder as Sent
 *    POST /reminders/:id/send
 *    Response: 200 OK
 *      {
 *        data: Reminder,
 *        message: "Reminder marked as sent successfully"
 *      }
 *    Errors:
 *      401 - Unauthorized
 *      404 - Not found
 *
 * Example Reminder object:
 * {
 *   id: "clwxyz123",
 *   customerId: "clwabc456",
 *   creatorId: "clwuser789",
 *   due: "2025-07-28T00:00:00.000Z",
 *   amount: 1000,
 *   message: "Payment due for July",
 *   type: "PAYMENT",
 *   status: "PENDING",
 *   sentAt: null,
 *   createdAt: "2025-07-27T16:00:00.000Z",
 *   updatedAt: "2025-07-27T16:00:00.000Z",
 *   customer: { ... },
 *   creator: { ... }
 * }
 *
 * Notes:
 * - All endpoints require authentication.
 * - Dates must be in ISO string format.
 * - Only the creator or admins can update/delete reminders.
 * - Business logic may restrict duplicate reminders or invalid dates.
 */
