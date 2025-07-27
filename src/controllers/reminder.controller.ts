import { ReminderService } from "../services/reminder.service";
import { TReminderStatus, TReminderType } from "../constants/types";
import catchErrors from "../utils/catchErrors";
import { OK, CREATED, NO_CONTENT } from "../constants/http";

export const createReminder = catchErrors(async (req, res) => {
    const { customerId, due, amount, message, type } = req.body;
    const creatorId = req.user?.id;
    if (!creatorId) return res.status(401).json({ message: "Unauthorized" });
    if (!customerId || !due)
        return res
            .status(400)
            .json({ message: "customerId and due are required" });
    const reminder = await ReminderService.createReminder({
        customerId,
        creatorId,
        due: new Date(due),
        amount,
        message,
        type,
    });
    return res
        .status(CREATED)
        .json({ data: reminder, message: "Reminder created successfully" });
});

export const getReminders = catchErrors(async (req, res) => {
    const { customerId, status, type, creatorId } = req.query;
    const reminders = await ReminderService.getReminders({
        customerId: customerId as string | undefined,
        status: status as TReminderStatus | undefined,
        type: type as TReminderType | undefined,
        creatorId: creatorId as string | undefined,
    });
    return res
        .status(OK)
        .json({ data: reminders, message: "Reminders fetched successfully" });
});

export const updateReminder = catchErrors(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const reminder = await ReminderService.updateReminder(id, updateData);
    return res
        .status(OK)
        .json({ data: reminder, message: "Reminder updated successfully" });
});

export const deleteReminder = catchErrors(async (req, res) => {
    const { id } = req.params;
    await ReminderService.deleteReminder(id);
    return res
        .status(NO_CONTENT)
        .json({ message: "Reminder deleted successfully" });
});

export const markReminderAsSent = catchErrors(async (req, res) => {
    const { id } = req.params;
    const reminder = await ReminderService.markAsSent(id);
    return res.status(OK).json({
        data: reminder,
        message: "Reminder marked as sent successfully",
    });
});
