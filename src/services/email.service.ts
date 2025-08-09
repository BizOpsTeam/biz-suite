import crypto from "crypto";
import { Resend } from "resend";
import prisma from "../config/db";
import { configDotenv } from "dotenv";
import { oneHourFromNow } from "../utils/dates";
import {
    emailVerificationTemplate,
    resetPasswordTemplate,
} from "../templates/emails.template";
import appAssert from "../utils/appAssert";
import { NOT_FOUND } from "../constants/http";
import { InvoicePdfData } from "./pdf.service";

configDotenv();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (
    userId: string,
    email: string = "delivered@resend.dev",
) => {
    const token = crypto.randomBytes(32).toString("hex");
    const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;
    const expiresIn = oneHourFromNow();

    await prisma.userModel.update({
        where: { id: userId },
        data: {
            emailVerificationToken: token,
            emailVerificationExpires: expiresIn,
        },
    });

    await resend.emails.send({
        from: "Acme <onboarding@resend.dev>",
        to: email,
        subject: "Verify your email address",
        html: emailVerificationTemplate(verificationUrl),
    });
};

export const verifyEmailToken = async (token: string) => {
    const user = await prisma.userModel.findUnique({
        where: {
            emailVerificationToken: token,
            emailVerificationExpires: { gt: new Date() },
        },
        select: { id: true },
    });

    appAssert(user, NOT_FOUND, `Invalid or expired email verification token`);
    return user;
};

export const sendResetPasswordEmail = async (
    resetPasswordUrl: string,
    email: string = "delivered@resend.dev",
) => {
    await resend.emails.send({
        from: "Acme <onboarding@resend.dev>",
        to: email,
        subject: "Reset your password",
        html: resetPasswordTemplate(resetPasswordUrl),
    });
};

export const updateEmailVerified = async (userId: string) => {
    await prisma.userModel.update({
        where: { id: userId },
        data: {
            isEmailVerified: true,
            emailVerificationToken: null,
            emailVerificationExpires: null,
        },
    });
};

export const verifyEmail = async (email: string) => {
    return await prisma.userModel.findUnique({
        where: { email },
    });
};

export async function sendInvoiceEmail(
    to: string,
    pdfBuffer: Buffer,
    pdfData: InvoicePdfData,
    customSubject?: string,
    customMessage?: string,
) {
    const subject = customSubject || `Invoice #${pdfData.invoiceNumber} from ${pdfData.companyName}`;
    
    const defaultMessage = customMessage || `Thank you for your business! Please find your invoice attached for your records.`;
    
    const htmlTemplate = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Invoice ${pdfData.invoiceNumber}</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f8f9fa;
                }
                .email-container {
                    background-color: #ffffff;
                    border-radius: 10px;
                    padding: 30px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                .header {
                    text-align: center;
                    border-bottom: 3px solid #3182ce;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .company-name {
                    font-size: 24px;
                    font-weight: bold;
                    color: #3182ce;
                    margin-bottom: 5px;
                }
                .invoice-title {
                    font-size: 20px;
                    color: #2d3748;
                    margin-bottom: 20px;
                }
                .invoice-details {
                    background-color: #f7fafc;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 20px 0;
                }
                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    padding: 5px 0;
                    border-bottom: 1px solid #e2e8f0;
                }
                .detail-label {
                    font-weight: 600;
                    color: #4a5568;
                }
                .detail-value {
                    color: #2d3748;
                    font-weight: 500;
                }
                .status-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                }
                .status-paid { background-color: #c6f6d5; color: #22543d; }
                .status-unpaid { background-color: #fed7d7; color: #742a2a; }
                .status-partial { background-color: #ffeaa7; color: #744210; }
                .message-section {
                    margin: 25px 0;
                    padding: 20px;
                    background-color: #edf2f7;
                    border-radius: 8px;
                    border-left: 4px solid #3182ce;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #e2e8f0;
                    color: #718096;
                    font-size: 14px;
                }
                .attachment-notice {
                    background-color: #e6fffa;
                    border: 1px solid #38b2ac;
                    border-radius: 6px;
                    padding: 15px;
                    margin: 20px 0;
                    text-align: center;
                }
                .cta-button {
                    display: inline-block;
                    background-color: #3182ce;
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 6px;
                    margin: 15px 0;
                    font-weight: 600;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <div class="company-name">${pdfData.companyName}</div>
                    <div class="invoice-title">Invoice #${pdfData.invoiceNumber}</div>
                </div>

                <p>Dear ${pdfData.customerName || "Valued Customer"},</p>
                
                <div class="message-section">
                    <p>${defaultMessage}</p>
                </div>

                <div class="invoice-details">
                    <div class="detail-row">
                        <span class="detail-label">Invoice Number:</span>
                        <span class="detail-value">#${pdfData.invoiceNumber}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Invoice Date:</span>
                        <span class="detail-value">${pdfData.invoiceDate}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Due Date:</span>
                        <span class="detail-value">${pdfData.dueDate}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Total Amount:</span>
                        <span class="detail-value">${pdfData.currencySymbol}${pdfData.total}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Amount Paid:</span>
                        <span class="detail-value">${pdfData.currencySymbol}${pdfData.amountPaid}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Balance Due:</span>
                        <span class="detail-value">${pdfData.currencySymbol}${pdfData.balanceDue}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Status:</span>
                        <span class="detail-value">
                            <span class="status-badge status-${pdfData.status}">${pdfData.status}</span>
                        </span>
                    </div>
                </div>

                <div class="attachment-notice">
                    📎 <strong>Your invoice is attached as a PDF file</strong><br>
                    You can download, print, or save it for your records.
                </div>

                <p>If you have any questions about this invoice or need assistance, please don't hesitate to contact us.</p>

                <div class="footer">
                    <p><strong>${pdfData.companyName}</strong></p>
                    ${pdfData.companyAddress ? `<p>${pdfData.companyAddress}</p>` : ''}
                    <p>Email: <a href="mailto:${pdfData.supportEmail}">${pdfData.supportEmail}</a></p>
                    ${pdfData.companyPhone ? `<p>Phone: ${pdfData.companyPhone}</p>` : ''}
                    <br>
                    <p style="font-size: 12px; color: #a0aec0;">
                        This is an automated email. Please do not reply to this email address.
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;

    await resend.emails.send({
        from: `${pdfData.companyName} <onboarding@resend.dev>`,
        to,
        subject,
        html: htmlTemplate,
        attachments: [
            {
                filename: `invoice-${pdfData.invoiceNumber}.pdf`,
                content: pdfBuffer,
            },
        ],
    });
}
