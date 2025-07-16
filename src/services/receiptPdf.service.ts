import puppeteer, { Browser } from 'puppeteer';
import { generateReceiptHTML, ReceiptTemplateData } from '../templates/receipt.template';

/**
 * Generates a PDF buffer for a receipt using Puppeteer.
 * @param data ReceiptTemplateData - All dynamic data for the receipt
 * @returns Uint8Array - The generated PDF
 */
export async function generateReceiptPDF(data: ReceiptTemplateData): Promise<Uint8Array> {
  const html = generateReceiptHTML(data);
  let browser: Browser | null = null;
  try {
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '32px', bottom: '32px', left: '24px', right: '24px' },
    });
    await page.close();
    return pdfBuffer;
  } catch (err) {
    console.error('Error generating receipt PDF:', err);
    throw new Error('Failed to generate receipt PDF');
  } finally {
    if (browser) await browser.close();
  }
} 