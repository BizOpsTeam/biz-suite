import prisma from "../config/db";
import { OK, UNAUTHORIZED } from "../constants/http";
import {
    getInvoices,
    searchProducts,
    updateInvoicePayment,
    getInvoiceWithDetails,
    logInvoiceAuditEvent,
} from "../services/invoices.service";
import { generateInvoicePdf, InvoicePdfData } from "../services/pdf.service";
import { sendInvoiceEmail } from "../services/email.service";
import appAssert from "../utils/appAssert";
import catchErrors from "../utils/catchErrors";
import { updateInvoicePaymentSchema } from "../zodSchema/invoice.zodSchema";
import { Request, Response, NextFunction } from "express";

export const getInvoicesHandler = catchErrors(
    async (req: Request, res: Response) => {
        const ownerId = req.user?.id;
        appAssert(
            ownerId,
            UNAUTHORIZED,
            "Unauthorized, login to fetch invoices",
        );

        const {
            customerId,
            status,
            currencyCode,
            search,
            sort,
            page = "1",
            limit = "20",
            startDate,
            endDate,
        } = req.query;

        const result = await getInvoices({
            ownerId,
            customerId: customerId as string | undefined,
            status: status as string | undefined,
            currencyCode: currencyCode as string | undefined,
            search: search as string | undefined,
            sort: sort as string | undefined,
            page: parseInt(page as string, 10) || 1,
            limit: parseInt(limit as string, 10) || 20,
            startDate: startDate as string | undefined,
            endDate: endDate as string | undefined,
        });
        return res.status(OK).json({
            ...result,
            message: "invoices returned successfully",
        });
    },
);

export const productSearchHandler = catchErrors(async (req, res) => {
    const ownerId = req.user?.id;
    appAssert(ownerId, UNAUTHORIZED, "Login in to perform this action");

    const { query, categoryId, inStock } = req.query;
    console.log("Querry: ", query);
    console.log("CategoryId: ", categoryId);
    console.log("inStock: ", inStock);

    const searchResults = await searchProducts(
        ownerId,
        String(query),
        String(categoryId),
        String(inStock),
    );

    return res.status(OK).json({
        data: searchResults,
        message: "search results returned sucessfully",
    });
});

export async function updateInvoicePaymentHandler(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const { id } = req.params;
        const validated = updateInvoicePaymentSchema.parse(req.body);
        const invoice = await updateInvoicePayment(id, validated);
        res.json({ success: true, data: invoice });
    } catch (err) {
        next(err);
    }
}

export const downloadInvoicePdfHandler = catchErrors(async (req, res) => {
    const { id } = req.params;
    const ownerId = req.user?.id;
    appAssert(ownerId, UNAUTHORIZED, "Unauthorized, login to download invoice");

    const invoice = await getInvoiceWithDetails(id);
    appAssert(
        invoice.ownerId === ownerId,
        UNAUTHORIZED,
        "You do not have access to this invoice",
    );

    // Log audit event
    await logInvoiceAuditEvent({
        invoiceId: invoice.id,
        eventType: "DOWNLOADED",
        userId: ownerId,
    });

    // Map invoice to InvoicePdfData
    const pdfData: InvoicePdfData = {
        companyLogoUrl:
            invoice.owner.logoUrl ||
            "https://dummyimage.com/120x60/2b6cb0/fff&text=LOGO",
        companyName: invoice.owner.name,
        companyAddress: invoice.owner.companyAddress || "",
        companyEmail: invoice.owner.email,
        companyPhone: invoice.owner.companyPhone || "",
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.createdAt.toISOString().slice(0, 10),
        dueDate: invoice.dueDate.toISOString().slice(0, 10),
        status: invoice.status,
        customerName: invoice.sale.customer?.name || "",
        customerAddress: invoice.sale.customer?.address || "",
        customerEmail: invoice.sale.customer?.email || "",
        customerPhone: invoice.sale.customer?.phone || "",
        paymentMethod: invoice.sale.paymentMethod || "",
        paymentReference: invoice.sale.notes || "",
        items: invoice.sale.saleItems.map((item: any) => ({
            description: item.product?.name || item.description || "",
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
        discount: invoice.sale.discount?.toFixed(2) || "0.00",
        tax: invoice.taxAmount?.toFixed(2) || "0.00",
        total: invoice.amountDue?.toFixed(2) || "0.00",
        amountPaid: invoice.paidAmount?.toFixed(2) || "0.00",
        balanceDue: (invoice.amountDue - invoice.paidAmount).toFixed(2),
        currencyCode: invoice.currencyCode,
        currencySymbol: invoice.currencySymbol,
        footerNote:
            "Payment is due by the due date. Thank you for your business!",
        supportEmail: invoice.owner.email,
    };

    const pdfBuffer = await generateInvoicePdf(pdfData);
    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`,
    });
    res.send(pdfBuffer);
});

export const emailInvoicePdfHandler = catchErrors(async (req, res) => {
    const { id } = req.params;
    const ownerId = req.user?.id;
    appAssert(ownerId, UNAUTHORIZED, "Unauthorized, login to email invoice");

    const invoice = await getInvoiceWithDetails(id);
    appAssert(
        invoice.ownerId === ownerId,
        UNAUTHORIZED,
        "You do not have access to this invoice",
    );
    appAssert(invoice.sale.customer?.email, 400, "Customer email not found");

    // Log audit event
    await logInvoiceAuditEvent({
        invoiceId: invoice.id,
        eventType: "EMAILED",
        userId: ownerId,
        eventDetails: `Emailed to ${invoice.sale.customer.email}`,
    });

    // Map invoice to InvoicePdfData (reuse logic above)
    const pdfData: InvoicePdfData = {
        companyLogoUrl:
            invoice.owner.logoUrl ||
            "https://dummyimage.com/120x60/2b6cb0/fff&text=LOGO",
        companyName: invoice.owner.name,
        companyAddress: invoice.owner.companyAddress || "",
        companyEmail: invoice.owner.email,
        companyPhone: invoice.owner.companyPhone || "",
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.createdAt.toISOString().slice(0, 10),
        dueDate: invoice.dueDate.toISOString().slice(0, 10),
        status: invoice.status,
        customerName: invoice.sale.customer?.name || "",
        customerAddress: invoice.sale.customer?.address || "",
        customerEmail: invoice.sale.customer?.email || "",
        customerPhone: invoice.sale.customer?.phone || "",
        paymentMethod: invoice.sale.paymentMethod || "",
        paymentReference: invoice.sale.notes || "",
        items: invoice.sale.saleItems.map((item: any) => ({
            description: item.product?.name || item.description || "",
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
        discount: invoice.sale.discount?.toFixed(2) || "0.00",
        tax: invoice.taxAmount?.toFixed(2) || "0.00",
        total: invoice.amountDue?.toFixed(2) || "0.00",
        amountPaid: invoice.paidAmount?.toFixed(2) || "0.00",
        balanceDue: (invoice.amountDue - invoice.paidAmount).toFixed(2),
        currencyCode: invoice.currencyCode,
        currencySymbol: invoice.currencySymbol,
        footerNote:
            "Payment is due by the due date. Thank you for your business!",
        supportEmail: invoice.owner.email,
    };

    const pdfBuffer = await generateInvoicePdf(pdfData);
    await sendInvoiceEmail(invoice.sale.customer.email, pdfBuffer, pdfData);
    res.json({ success: true, message: "Invoice PDF emailed to customer." });
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
