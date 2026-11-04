import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

@Injectable()
export class InvoiceService {
  async generateInvoicePdf(data: {
    orderId: string;
    userName: string;
    userEmail: string;
    assetTitle: string;
    tokenAmount: number;
    paidAt: Date;
    paymentId: string;
  }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // ─── Header ───────────────────────────────────────
      doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .text('PAYMENT INVOICE', { align: 'center' });

      doc.moveDown(0.5);
      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#888888')
        .text('Property Verification Report Charge', { align: 'center' });

      doc.moveDown(1);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#CCCCCC');
      doc.moveDown(1);

      // ─── Invoice Meta ──────────────────────────────────
      doc.fillColor('#000000').fontSize(10);

      doc.font('Helvetica-Bold').text('Invoice Details', { underline: true });
      doc.moveDown(0.5);

      this.addRow(doc, 'Order ID', data.orderId);
      this.addRow(doc, 'Payment ID', data.paymentId);
      this.addRow(
        doc,
        'Date',
        data.paidAt.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
      );

      doc.moveDown(1);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#CCCCCC');
      doc.moveDown(1);

      // ─── User Details ──────────────────────────────────
      doc.font('Helvetica-Bold').text('Paid By', { underline: true });
      doc.moveDown(0.5);
      this.addRow(doc, 'Name', data.userName);
      this.addRow(doc, 'Email', data.userEmail);

      doc.moveDown(1);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#CCCCCC');
      doc.moveDown(1);

      // ─── Asset Details ─────────────────────────────────
      doc.font('Helvetica-Bold').text('Asset Details', { underline: true });
      doc.moveDown(0.5);
      this.addRow(doc, 'Asset Title', data.assetTitle);
      this.addRow(doc, 'Payment Type', 'Property Verification Report Charge');

      doc.moveDown(1);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#CCCCCC');
      doc.moveDown(1);

      // ─── Amount ───────────────────────────────────────
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .fillColor('#1a1a1a')
        .text(`Total Paid: ${data.tokenAmount.toLocaleString('en-IN')}`, {
          align: 'right',
        });

      doc.moveDown(2);

      // ─── Footer ───────────────────────────────────────
      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#888888')
        .text('This is a system-generated invoice. No signature required.', {
          align: 'center',
        });

      doc.end();
    });
  }

  private addRow(doc: PDFKit.PDFDocument, label: string, value: string) {
    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .text(`${label}: `, { continued: true })
      .font('Helvetica')
      .text(value);
    doc.moveDown(0.3);
  }
}
