import prisma from "../config/db";
import { OK, UNAUTHORIZED, BAD_REQUEST } from "../constants/http";
import {
    getInvoices,
    getInvoiceById,
    getInvoiceStats,
    updateInvoiceStatus,
    markInvoiceAsViewed,
    deleteInvoice,
    logInvoiceAuditEvent,
    type InvoicesOptions
} from "../services/invoices.service";
import { generateInvoicePdf, InvoicePdfData } from "../services/pdf.service";
import { sendInvoiceEmail } from "../services/email.service";
import appAssert from "../utils/appAssert";
import catchErrors from "../utils/catchErrors";
import { Request, Response } from "express";
import { InvoiceStatus } from "@prisma/client";

export const getInvoicesHandler = catchErrors(
    async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const {
            page = 1,
            limit = 10,
            search = "",
            status,
            startDate,
            endDate,
        } = req.query;

        const options: InvoicesOptions = {
            ownerId: userId,
            page: Number(page),
            limit: Number(limit),
            search: search as string,
            status: status as InvoiceStatus,
            startDate: startDate ? new Date(startDate as string) : undefined,
            endDate: endDate ? new Date(endDate as string) : undefined,
        };

        const result = await getInvoices(options);
        return res.json({ success: true, data: result });
    },
);

export const invoiceSearchHandler = catchErrors(async (req, res) => {
    const ownerId = req.user?.id;
    appAssert(ownerId, UNAUTHORIZED, "Login in to perform this action");

    const {
        status,
        search,
        page = 1,
        limit = 20,
        startDate,
        endDate,
    } = req.query;

    // Parse and validate numeric params
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    const result = await getInvoices({
        ownerId,
        search: search as string | undefined,
        status: status as InvoiceStatus | undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        page: parsedPage,
        limit: parsedLimit,
    });

    return res.status(OK).json({
        ...result,
        message: "Invoices search results returned successfully",
    });
});

export const updateInvoicePaymentHandler = catchErrors(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params;
    const { status, paidAmount } = req.body;

    if (!status || !Object.values(InvoiceStatus).includes(status)) {
        return res.status(400).json({ 
            success: false, 
            message: "Invalid status. Must be one of: UNPAID, PARTIAL, PAID" 
        });
    }

    const invoice = await updateInvoiceStatus(id, userId, status, paidAmount);

    if (!invoice) {
        return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    return res.json({ success: true, data: invoice });
});

export const deleteInvoiceHandler = catchErrors(async (req, res) => {
    const { id } = req.params;
    const ownerId = req.user?.id;
    appAssert(
        ownerId,
        UNAUTHORIZED,
        "Unauthorized, login to perform this action",
    );
    appAssert(id, BAD_REQUEST, "Invoice Id required");

    await deleteInvoice(id, ownerId);
    res.status(OK).json({ message: "Invoice deleted successfully" });
});

export const downloadInvoicePdfHandler = catchErrors(async (req, res) => {
    const { id } = req.params;
    const ownerId = req.user?.id;
    appAssert(ownerId, UNAUTHORIZED, "Unauthorized, login to download invoice");

    const invoice = await getInvoiceById(id, ownerId);
    if (!invoice) {
        return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    // Log audit event
    await logInvoiceAuditEvent({
        invoiceId: invoice.id,
        eventType: "DOWNLOADED",
        userId: ownerId,
    });

    // Get user's business information for the invoice
    const user = await prisma.userModel.findUnique({
        where: { id: ownerId },
        select: {
            name: true,
            email: true,
            companyAddress: true,
            companyPhone: true,
            logoUrl: true,
        }
    });

    // Map invoice to InvoicePdfData
    const pdfData: InvoicePdfData = {
        companyLogoUrl: user?.logoUrl || "https://via.placeholder.com/120x60/3182ce/ffffff?text=LOGO",
        companyName: user?.name || "Your Business",
        companyAddress: user?.companyAddress || "",
        companyEmail: user?.email || "business@example.com",
        companyPhone: user?.companyPhone || "",
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: new Date(invoice.createdAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        }),
        dueDate: new Date(invoice.dueDate).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        }),
        status: invoice.status.toLowerCase(),
        customerName: invoice.sale.customer?.name || "",
        customerAddress: invoice.sale.customer?.address || "",
        customerEmail: invoice.sale.customer?.email || "",
        customerPhone: invoice.sale.customer?.phone || "",
        paymentMethod: invoice.sale.paymentMethod || "",
        paymentReference: "",
        items: invoice.sale.saleItems.map((item: any) => ({
            description: item.product?.name || "",
            quantity: item.quantity,
            unitPrice: item.price,
            total: (item.price * item.quantity).toFixed(2),
        })),
        subtotal: invoice.sale.saleItems
            .reduce(
                (sum: number, item: any) => sum + item.price * item.quantity,
                0,
            )
            .toFixed(2),
        discount: "0.00",
        tax: invoice.taxAmount?.toFixed(2) || "0.00",
        total: invoice.amountDue?.toFixed(2) || "0.00",
        amountPaid: invoice.paidAmount?.toFixed(2) || "0.00",
        balanceDue: (invoice.amountDue - invoice.paidAmount).toFixed(2),
        currencyCode: invoice.currencyCode,
        currencySymbol: invoice.currencySymbol,
        footerNote:
            "Payment is due by the due date. Thank you for your business!",
        supportEmail: "business@example.com",
    };

    const pdfBuffer = await generateInvoicePdf(pdfData);
    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`,
    });
    res.send(pdfBuffer);
    return;
});

export const emailInvoicePdfHandler = catchErrors(async (req, res) => {
    const { id } = req.params;
    const { email, subject, message } = req.body;
    const ownerId = req.user?.id;
    appAssert(ownerId, UNAUTHORIZED, "Unauthorized, login to email invoice");

    const invoice = await getInvoiceById(id, ownerId);
    if (!invoice) {
        return res.status(404).json({ success: false, message: "Invoice not found" });
    }
    
    // Use provided email or default to customer email
    const recipientEmail = email || invoice.sale.customer?.email;
    appAssert(recipientEmail, 400, "Customer email not found and no email provided");

    // Log audit event
    await logInvoiceAuditEvent({
        invoiceId: invoice.id,
        eventType: "EMAILED",
        userId: ownerId,
        eventDetails: `Emailed to ${recipientEmail}`,
    });

    // Get user's business information for the email
    const user = await prisma.userModel.findUnique({
        where: { id: ownerId },
        select: {
            name: true,
            email: true,
            companyAddress: true,
            companyPhone: true,
            logoUrl: true,
        }
    });

    // Map invoice to InvoicePdfData (reuse logic from download)
    const pdfData: InvoicePdfData = {
        companyLogoUrl: user?.logoUrl || "https://via.placeholder.com/120x60/3182ce/ffffff?text=LOGO",
        companyName: user?.name || "Your Business",
        companyAddress: user?.companyAddress || "",
        companyEmail: user?.email || "business@example.com",
        companyPhone: user?.companyPhone || "",
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: new Date(invoice.createdAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        }),
        dueDate: new Date(invoice.dueDate).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        }),
        status: invoice.status.toLowerCase(),
        customerName: invoice.sale.customer?.name || "",
        customerAddress: invoice.sale.customer?.address || "",
        customerEmail: invoice.sale.customer?.email || "",
        customerPhone: invoice.sale.customer?.phone || "",
        paymentMethod: invoice.sale.paymentMethod || "",
        paymentReference: "",
        items: invoice.sale.saleItems.map((item: any) => ({
            description: item.product?.name || "",
            quantity: item.quantity,
            unitPrice: item.price,
            total: (item.price * item.quantity).toFixed(2),
        })),
        subtotal: invoice.sale.saleItems
            .reduce(
                (sum: number, item: any) => sum + item.price * item.quantity,
                0,
            )
            .toFixed(2),
        discount: "0.00",
        tax: invoice.taxAmount?.toFixed(2) || "0.00",
        total: invoice.amountDue?.toFixed(2) || "0.00",
        amountPaid: invoice.paidAmount?.toFixed(2) || "0.00",
        balanceDue: (invoice.amountDue - invoice.paidAmount).toFixed(2),
        currencyCode: invoice.currencyCode,
        currencySymbol: invoice.currencySymbol,
        footerNote:
            "Payment is due by the due date specified above. Late payments may incur additional charges. Thank you for choosing our services.",
        supportEmail: user?.email || "business@example.com",
    };

    const pdfBuffer = await generateInvoicePdf(pdfData);
    await sendInvoiceEmail(recipientEmail, pdfBuffer, pdfData, subject, message);
    res.json({ 
        success: true, 
        message: `Invoice PDF emailed successfully to ${recipientEmail}.`,
        data: {
            emailedTo: recipientEmail,
            invoiceNumber: invoice.invoiceNumber,
        }
    });
    return;
});

export const getInvoiceAuditTrailHandler = catchErrors(async (req, res) => {
    const { id } = req.params;
    const ownerId = req.user?.id;
    appAssert(ownerId, UNAUTHORIZED, "Unauthorized, login to view audit trail");

    const { limit = 20, offset = 0, eventType } = req.query;
    const where: any = { invoiceId: id };
    if (eventType) where.eventType = eventType;

    const logs = await prisma.invoiceAudit.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: Number(limit),
        skip: Number(offset),
        include: { user: { select: { id: true, name: true, email: true } } },
    });
    res.json({ success: true, data: logs });
});

export const getInvoiceByIdHandler = catchErrors(
    async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { id } = req.params;
        const invoice = await getInvoiceById(id, userId);

        if (!invoice) {
            return res.status(404).json({ success: false, message: "Invoice not found" });
        }

        // Mark invoice as viewed
        await markInvoiceAsViewed(id, userId);

        return res.json({ success: true, data: invoice });
    },
);

export const getInvoiceStatsHandler = catchErrors(
    async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const stats = await getInvoiceStats(userId);
        return res.json({ success: true, data: stats });
    },
);

export const updateInvoiceStatusHandler = catchErrors(
    async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { id } = req.params;
        const { status, paidAmount } = req.body;

        if (!status || !Object.values(InvoiceStatus).includes(status)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid status. Must be one of: UNPAID, PARTIAL, PAID" 
            });
        }

        const invoice = await updateInvoiceStatus(id, userId, status, paidAmount);

        if (!invoice) {
            return res.status(404).json({ success: false, message: "Invoice not found" });
        }

        return res.json({ success: true, data: invoice });
    },
);
