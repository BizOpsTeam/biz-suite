import { Request, Response } from "express";
import prisma from "../config/db";
import { generateReceiptPDF } from "../services/receiptPdf.service";
import { ReceiptTemplateData } from "../templates/receipt.template";
import { Resend } from "resend";
import { logReceiptAuditEvent } from "../services/receipts.service";
import catchErrors from "../utils/catchErrors";
import appAssert from "../utils/appAssert";
import { UNAUTHORIZED } from "../constants/http";
import { getReceipts } from "../services/receipts.service";
import { SaleItem, Product } from "@prisma/client";
type SaleItemWithProduct = SaleItem & { product: Product };

const resend = new Resend(process.env.RESEND_API_KEY);

// Download receipt PDF
export const downloadReceiptHandler = async (req: Request, res: Response) => {
    const { invoiceId } = req.params;
    // Fetch receipt, invoice, sale, customer, and company info
    const receipt = await prisma.receipt.findUnique({
        where: { invoiceId },
        include: {
            invoice: {
                include: {
                    sale: {
                        include: { customer: true },
                    },
                    owner: true,
                },
            },
            issuedBy: true,
        },
    });
    if (!receipt) {
        return res
            .status(404)
            .json({ message: "Receipt not found for this invoice" });
    }
    const { invoice } = receipt;
    const { sale, owner } = invoice;
    const { customer } = sale;

    // Build template data
    const data: ReceiptTemplateData = {
        company: {
            logoUrl: owner.logoUrl || undefined,
            name: owner.name,
            address: owner.companyAddress || undefined,
            phone: owner.companyPhone || undefined,
            email: owner.email,
        },
        customer: {
            name: customer.name,
            email: customer.email || undefined,
            phone: customer.phone || undefined,
            address: customer.address || undefined,
        },
        receipt: {
            number: receipt.receiptNumber,
            issuedAt: receipt.issuedAt.toLocaleDateString(),
            invoiceNumber: invoice.invoiceNumber,
            paymentMethod: sale.paymentMethod,
        },
        items: await prisma.saleItem
            .findMany({
                where: { saleId: sale.id },
                include: { product: true },
            })
            .then((items: SaleItemWithProduct[]) =>
                items.map((item: SaleItemWithProduct) => ({
                    description: item.product.name,
                    quantity: item.quantity,
                    unitPrice: item.price,
                    total:
                        item.price * item.quantity - item.discount + item.tax,
                })),
            ),
        summary: {
            subtotal: sale.totalAmount - sale.taxAmount,
            tax: sale.taxAmount,
            total: sale.totalAmount,
            currencySymbol: invoice.currencySymbol,
        },
        paidAt: invoice.paidAt
            ? invoice.paidAt.toLocaleDateString()
            : invoice.createdAt.toLocaleDateString(),
    };

    // Generate PDF
    const pdfBuffer = await generateReceiptPDF(data);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        `attachment; filename=receipt-${receipt.receiptNumber}.pdf`,
    );
    return res.send(pdfBuffer);

    await logReceiptAuditEvent({
        receiptId: receipt!.id,
        eventType: "DOWNLOADED",
        userId: req.user?.id,
    });
};

// Email receipt PDF
export const emailReceiptHandler = async (req: Request, res: Response) => {
    const { invoiceId } = req.params;
    // Fetch receipt, invoice, sale, customer, and company info
    const receipt = await prisma.receipt.findUnique({
        where: { invoiceId },
        include: {
            invoice: {
                include: {
                    sale: {
                        include: { customer: true },
                    },
                    owner: true,
                },
            },
            issuedBy: true,
        },
    });
    if (!receipt) {
        return res
            .status(404)
            .json({ message: "Receipt not found for this invoice" });
    }
    const { invoice } = receipt;
    const { sale, owner } = invoice;
    const { customer } = sale;
    if (!customer.email) {
        return res
            .status(400)
            .json({ message: "Customer does not have an email address" });
    }

    // Build template data
    const data: ReceiptTemplateData = {
        company: {
            logoUrl: owner.logoUrl || undefined,
            name: owner.name,
            address: owner.companyAddress || undefined,
            phone: owner.companyPhone || undefined,
            email: owner.email,
        },
        customer: {
            name: customer.name,
            email: customer.email || undefined,
            phone: customer.phone || undefined,
            address: customer.address || undefined,
        },
        receipt: {
            number: receipt.receiptNumber,
            issuedAt: receipt.issuedAt.toLocaleDateString(),
            invoiceNumber: invoice.invoiceNumber,
            paymentMethod: sale.paymentMethod,
        },
        items: await prisma.saleItem
            .findMany({
                where: { saleId: sale.id },
                include: { product: true },
            })
            .then((items: SaleItemWithProduct[]) =>
                items.map((item: SaleItemWithProduct) => ({
                    description: item.product.name,
                    quantity: item.quantity,
                    unitPrice: item.price,
                    total:
                        item.price * item.quantity - item.discount + item.tax,
                })),
            ),
        summary: {
            subtotal: sale.totalAmount - sale.taxAmount,
            tax: sale.taxAmount,
            total: sale.totalAmount,
            currencySymbol: invoice.currencySymbol,
        },
        paidAt: invoice.paidAt
            ? invoice.paidAt.toLocaleDateString()
            : invoice.createdAt.toLocaleDateString(),
    };

    // Generate PDF
    const pdfBuffer = await generateReceiptPDF(data);

    // Send email with PDF attached
    await resend.emails.send({
        from: `${owner.name} <receipts@resend.dev>`,
        to: customer.email,
        subject: `Your Receipt #${receipt.receiptNumber}`,
        html: `
      <p>Dear ${customer.name || "Customer"},</p>
      <p>Thank you for your payment. Please find your receipt attached.</p>
      <ul>
        <li><strong>Receipt #:</strong> ${receipt.receiptNumber}</li>
        <li><strong>Date:</strong> ${receipt.issuedAt.toLocaleDateString()}</li>
        <li><strong>Total Paid:</strong> ${invoice.currencySymbol}${sale.totalAmount.toFixed(2)}</li>
      </ul>
      <p>If you have any questions, reply to this email.</p>
      <p>Best regards,<br/>${owner.name}</p>
    `,
        attachments: [
            {
                filename: `receipt-${receipt.receiptNumber}.pdf`,
                content: Buffer.from(pdfBuffer),
            },
        ],
    });

    // Mark receipt as emailed
    await prisma.receipt.update({
        where: { id: receipt.id },
        data: { emailed: true, emailedAt: new Date() },
    });

    await logReceiptAuditEvent({
        receiptId: receipt.id,
        eventType: "EMAILED",
        userId: req.user?.id,
        eventDetails: `Emailed to ${customer.email}`,
    });

    return res.status(200).json({ message: "Receipt emailed successfully" });
};

export const getReceiptsHandler = catchErrors(
    async (req: Request, res: Response) => {
        const ownerId = req.user?.id;
        appAssert(
            ownerId,
            UNAUTHORIZED,
            "Unauthorized, login to fetch receipts",
        );

        const {
            customerId,
            status,
            issuedById,
            search,
            sort,
            page = "1",
            limit = "20",
            startDate,
            endDate,
        } = req.query;

        const result = await getReceipts({
            ownerId,
            customerId: customerId as string | undefined,
            status: status as string | undefined,
            issuedById: issuedById as string | undefined,
            search: search as string | undefined,
            sort: sort as string | undefined,
            page: parseInt(page as string, 10) || 1,
            limit: parseInt(limit as string, 10) || 20,
            startDate: startDate as string | undefined,
            endDate: endDate as string | undefined,
        });
        res.status(200).json({
            ...result,
            message: "Receipts fetched successfully",
        });
    },
);

export const getReceiptAuditTrailHandler = catchErrors(
    async (req: Request, res: Response) => {
        const { invoiceId } = req.params;
        const ownerId = req.user?.id;
        appAssert(
            ownerId,
            UNAUTHORIZED,
            "Unauthorized, login to view audit trail",
        );

        const { limit = 20, offset = 0, eventType } = req.query;
        const where: any = { receiptId: invoiceId };
        if (eventType) where.eventType = eventType;

        const logs = await prisma.receiptAudit.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: Number(limit),
            skip: Number(offset),
            include: {
                user: { select: { id: true, name: true, email: true } },
            },
        });
        res.json({ success: true, data: logs });
    },
);
