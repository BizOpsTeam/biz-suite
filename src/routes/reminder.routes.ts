import { Router } from "express";
import {
    createReminder,
    getReminders,
    updateReminder,
    deleteReminder,
    markReminderAsSent,
} from "../controllers/reminder.controller";

const router = Router();

router.post("/", createReminder);
router.get("/", getReminders);
router.patch("/:id", updateReminder);
router.delete("/:id", deleteReminder);
router.post("/:id/send", markReminderAsSent);

export default router;
