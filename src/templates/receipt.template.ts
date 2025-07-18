// Receipt HTML template for PDF generation
// Usage: import and call generateReceiptHTML({ ... })

export interface ReceiptTemplateData {
    company: {
        logoUrl?: string;
        name: string;
        address?: string;
        phone?: string;
        email?: string;
    };
    customer: {
        name: string;
        email?: string;
        phone?: string;
        address?: string;
    };
    receipt: {
        number: string;
        issuedAt: string; // formatted date
        invoiceNumber: string;
        paymentMethod: string;
    };
    items: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        total: number;
    }>;
    summary: {
        subtotal: number;
        tax: number;
        total: number;
        currencySymbol: string;
    };
    paidAt: string; // formatted date
}

export function generateReceiptHTML(data: ReceiptTemplateData): string {
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Receipt</title>
    <style>
      body {
        font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
        background: #f7f8fa;
        margin: 0;
        padding: 0;
        color: #222;
      }
      .container {
        max-width: 700px;
        margin: 40px auto;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 4px 24px rgba(0,0,0,0.07);
        padding: 40px 32px 32px 32px;
      }
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 2px solid #eaeaea;
        padding-bottom: 18px;
        margin-bottom: 24px;
      }
      .company-info {
        display: flex;
        align-items: center;
      }
      .company-logo {
        height: 56px;
        width: 56px;
        object-fit: contain;
        margin-right: 18px;
        border-radius: 8px;
        background: #f2f2f2;
      }
      .company-details {
        font-size: 1.1em;
      }
      .receipt-title {
        font-size: 2.1em;
        font-weight: 700;
        color: #2d7d46;
        letter-spacing: 2px;
        text-align: right;
      }
      .section {
        margin-bottom: 28px;
      }
      .info-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 12px;
      }
      .info-table td {
        padding: 4px 0;
        font-size: 1em;
      }
      .badge {
        display: inline-block;
        background: #e6f7ec;
        color: #2d7d46;
        font-weight: 600;
        border-radius: 6px;
        padding: 6px 18px;
        font-size: 1.1em;
        margin-bottom: 10px;
      }
      .items-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 18px;
      }
      .items-table th, .items-table td {
        border-bottom: 1px solid #eaeaea;
        padding: 10px 6px;
        text-align: left;
      }
      .items-table th {
        background: #f7f8fa;
        font-weight: 600;
      }
      .summary-table {
        width: 100%;
        margin-top: 10px;
        font-size: 1.1em;
      }
      .summary-table td {
        padding: 6px 0;
      }
      .summary-table .label {
        color: #888;
      }
      .summary-table .value {
        text-align: right;
        font-weight: 600;
      }
      .footer {
        margin-top: 36px;
        text-align: center;
        color: #888;
        font-size: 1em;
      }
      @media (max-width: 600px) {
        .container {
          padding: 18px 4vw;
        }
        .header {
          flex-direction: column;
          align-items: flex-start;
        }
        .receipt-title {
          text-align: left;
          margin-top: 12px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="company-info">
          ${data.company.logoUrl ? `<img src="${data.company.logoUrl}" class="company-logo" alt="Logo" />` : ""}
          <div class="company-details">
            <div><strong>${data.company.name}</strong></div>
            ${data.company.address ? `<div>${data.company.address}</div>` : ""}
            ${data.company.phone ? `<div>Phone: ${data.company.phone}</div>` : ""}
            ${data.company.email ? `<div>Email: ${data.company.email}</div>` : ""}
          </div>
        </div>
        <div class="receipt-title">RECEIPT</div>
      </div>

      <div class="section">
        <span class="badge">Payment Received</span>
        <table class="info-table">
          <tr>
            <td><strong>Receipt #:</strong></td>
            <td>${data.receipt.number}</td>
            <td><strong>Date Issued:</strong></td>
            <td>${data.receipt.issuedAt}</td>
          </tr>
          <tr>
            <td><strong>Invoice #:</strong></td>
            <td>${data.receipt.invoiceNumber}</td>
            <td><strong>Paid At:</strong></td>
            <td>${data.paidAt}</td>
          </tr>
          <tr>
            <td><strong>Payment Method:</strong></td>
            <td>${data.receipt.paymentMethod}</td>
            <td></td>
            <td></td>
          </tr>
        </table>
      </div>

      <div class="section">
        <table class="info-table">
          <tr>
            <td><strong>Billed To:</strong></td>
            <td>${data.customer.name}</td>
            <td><strong>Email:</strong></td>
            <td>${data.customer.email || ""}</td>
          </tr>
          <tr>
            <td><strong>Phone:</strong></td>
            <td>${data.customer.phone || ""}</td>
            <td><strong>Address:</strong></td>
            <td>${data.customer.address || ""}</td>
          </tr>
        </table>
      </div>

      <div class="section">
        <table class="items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${data.items
                .map(
                    (item) => `
              <tr>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>${data.summary.currencySymbol}${item.unitPrice.toFixed(2)}</td>
                <td>${data.summary.currencySymbol}${item.total.toFixed(2)}</td>
              </tr>
            `,
                )
                .join("")}
          </tbody>
        </table>
        <table class="summary-table">
          <tr>
            <td class="label">Subtotal:</td>
            <td class="value">${data.summary.currencySymbol}${data.summary.subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td class="label">Tax:</td>
            <td class="value">${data.summary.currencySymbol}${data.summary.tax.toFixed(2)}</td>
          </tr>
          <tr>
            <td class="label"><strong>Total Paid:</strong></td>
            <td class="value"><strong>${data.summary.currencySymbol}${data.summary.total.toFixed(2)}</strong></td>
          </tr>
        </table>
      </div>

      <div class="footer">
        <div>Thank you for your business!</div>
        <div>If you have any questions, contact us at ${data.company.email || "our support email"}.</div>
        <div style="margin-top: 8px; font-size: 0.95em; color: #bbb;">This receipt is generated electronically and is valid without a signature.</div>
      </div>
    </div>
  </body>
  </html>
  `;
}
