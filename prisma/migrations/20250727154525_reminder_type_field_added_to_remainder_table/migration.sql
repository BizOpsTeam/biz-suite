-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('PAYMENT', 'MEETING', 'FOLLOW_UP', 'CUSTOM');

-- AlterTable
ALTER TABLE "Reminder" ADD COLUMN     "type" "ReminderType" NOT NULL DEFAULT 'CUSTOM';
