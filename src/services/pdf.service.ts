import puppeteer from "puppeteer";
import { readFile } from "fs/promises";
import path from "path";

/**
 * Type for invoice PDF data. Add or adjust fields as needed.
 */
export interface InvoicePdfData {
    companyLogoUrl: string;
    companyName: string;
    companyAddress: string;
    companyEmail: string;
    companyPhone: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    status: string;
    customerName: string;
    customerAddress: string;
    customerEmail: string;
    customerPhone: string;
    paymentMethod: string;
    paymentReference: string;
    items: Array<{
        description: string;
        quantity: number;
        unitPrice: string | number;
        total: string | number;
    }>;
    subtotal: string | number;
    discount: string | number;
    tax: string | number;
    total: string | number;
    amountPaid: string | number;
    balanceDue: string | number;
    currencyCode: string;
    currencySymbol: string;
    footerNote: string;
    supportEmail: string;
}

/**
 * Replace {{placeholders}} in the template with actual data.
 * Supports {{#each items}}...{{/each}} for items array.
 */
function fillTemplate(template: string, data: InvoicePdfData): string {
    // Handle items array
    template = template.replace(
        /{{#each items}}([\s\S]*?){{\/each}}/g,
        (_, rowTemplate) => {
            return data.items
                .map((item, idx) => {
                    let row = rowTemplate;
                    row = row.replace(/{{@index}}/g, (idx + 1).toString());
                    
                    // Replace @root.xxx with root-level data
                    Object.entries(data).forEach(([key, value]) => {
                        if (typeof value !== "object") {
                            row = row.replace(
                                new RegExp(`{{@root\\.${key}}}`, "g"),
                                String(value),
                            );
                        }
                    });
                    
                    // Replace item-level data
                    Object.entries(item).forEach(([key, value]) => {
                        row = row.replace(
                            new RegExp(`{{${key}}}`, "g"),
                            String(value),
                        );
                    });
                    return row;
                })
                .join("");
        },
    );
    // Replace all other placeholders
    Object.entries(data).forEach(([key, value]) => {
        if (typeof value !== "object") {
            template = template.replace(
                new RegExp(`{{${key}}}`, "g"),
                String(value),
            );
        }
    });
    return template;
}

/**
 * Generate a PDF buffer for an invoice using Puppeteer.
 * @param invoiceData InvoicePdfData
 * @returns Promise<Buffer> PDF buffer
 */
export async function generateInvoicePdf(
    invoiceData: InvoicePdfData,
): Promise<Buffer> {
    // Load HTML template
    const templatePath = path.join(
        __dirname,
        "../templates/invoice.template.html",
    );
    const htmlTemplate = await readFile(templatePath, "utf8");
    // Fill template with data
    const html = fillTemplate(htmlTemplate, invoiceData);

    // Launch Puppeteer and generate PDF
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });
        const pdfUint8Array = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "32px",
                bottom: "32px",
                left: "24px",
                right: "24px",
            },
        });
        await page.close();
        // Ensure we return a Node.js Buffer
        return Buffer.isBuffer(pdfUint8Array)
            ? pdfUint8Array
            : Buffer.from(pdfUint8Array);
    } catch (err) {
        throw new Error("Failed to generate PDF: " + (err as Error).message);
    } finally {
        await browser.close();
    }
}
