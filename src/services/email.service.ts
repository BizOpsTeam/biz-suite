import crypto from 'crypto';
import { Resend } from 'resend';
import prisma from '../config/db';
import { configDotenv } from 'dotenv';
import { oneHourFromNow } from '../utils/dates';
import { emailVerificationTemplate, resetPasswordTemplate } from '../templates/emails.template';
import appAssert from '../utils/appAssert';
import { NOT_FOUND } from '../constants/http';

configDotenv()

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendVerificationEmail = async (userId: string, email: string = "delivered@resend.dev") => {
    const token = crypto.randomBytes(32).toString("hex")
    const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`
    const expiresIn = oneHourFromNow()

    await prisma.userModel.update({
        where: { id: userId },
        data: { emailVerificationToken: token, emailVerificationExpires: expiresIn }
    })

    await resend.emails.send({
        from: "Acme <onboarding@resend.dev>",
        to: email,
        subject: "Verify your email address",
        html: emailVerificationTemplate(verificationUrl)
    })
}


export const verifyEmailToken = async(token: string) => {
   const user = await prisma.userModel.findUnique({
       where: { emailVerificationToken: token , emailVerificationExpires: {gt: new Date()} },
       select: { id: true }
   })

   appAssert(user, NOT_FOUND, `Invalid or expired email verification token`)
   return user
}

export const sendResetPasswordEmail = async(resetPasswordUrl: string, email: string = "delivered@resend.dev") => {
    await resend.emails.send({
        from: "Acme <onboarding@resend.dev>",
        to: email,
        subject: "Reset your password",
        html: resetPasswordTemplate(resetPasswordUrl)
    })
}

export const updateEmailVerified = async(userId: string) => {
    await prisma.userModel.update({
        where: { id: userId },
        data: { isEmailVerified: true, emailVerificationToken: null, emailVerificationExpires: null }
    })
}

export const verifyEmail = async(email: string) => {
    return await prisma.userModel.findUnique({
        where: { email }
    })
}   