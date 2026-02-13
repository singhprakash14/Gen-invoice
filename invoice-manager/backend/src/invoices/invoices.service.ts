import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice, InvoiceDocument } from './schemas/invoice.schema';
import * as path from 'path';
const PDFDocument = require('pdfkit');

@Injectable()
export class InvoicesService {
    constructor(@InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>) { }

    async create(createInvoiceDto: any): Promise<Invoice> {
        const createdInvoice = new this.invoiceModel(createInvoiceDto);
        return createdInvoice.save();
    }

    async findAll(): Promise<Invoice[]> {
        return this.invoiceModel.find().exec();
    }

    async findOne(id: string): Promise<InvoiceDocument | null> {
        return this.invoiceModel.findById(id).exec();
    }

    async update(id: string, updateInvoiceDto: any): Promise<Invoice | null> {
        return this.invoiceModel.findByIdAndUpdate(id, updateInvoiceDto, { new: true }).exec();
    }

    async remove(id: string): Promise<any> {
        return this.invoiceModel.findByIdAndDelete(id).exec();
    }

    async generatePdf(id: string): Promise<Buffer> {
        const invoice = await this.findOne(id);
        if (!invoice) throw new Error('Invoice not found');

        // Number to words helper
        const toWords = (num: number) => {
            const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
            const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
            const convert = (n: number): string => {
                if (n < 20) return ones[n];
                if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
                if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convert(n % 100) : '');
                if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
                return n.toString();
            };
            return convert(Math.floor(num)) + ' Rupees only';
        };

        const doc = new (PDFDocument as any)({ margin: 30, size: 'A4' });
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));

        return new Promise((resolve) => {
            doc.on('end', () => {
                resolve(Buffer.concat(buffers));
            });

            const mainColor = '#2d334a';
            const lightColor = '#f4f6f9';
            const accentColor = '#6366f1';
            const startX = 40;
            const width = 515;

            // 1. Tax Invoice Header
            doc.rect(startX, 30, width, 20).fillAndStroke(lightColor, mainColor);
            doc.fillColor(mainColor).fontSize(10).text('Tax Invoice', startX, 35, { align: 'center', width });

            // 2. Company Info Box
            doc.rect(startX, 50, width * 0.6, 90).stroke(mainColor);

            // Logo Image - load as Buffer for reliability
            const fs = require('fs');
            const logoPath = path.join(process.cwd(), 'src', 'assets', 'logo.png');
            if (fs.existsSync(logoPath)) {
                const logoBuffer = fs.readFileSync(logoPath);
                doc.image(logoBuffer, startX + 8, 58, { width: 65, height: 75 });
            } else {
                // Fallback WM text logo
                doc.rect(startX + 10, 60, 60, 70).fillAndStroke('#eff6ff', accentColor);
                doc.fillColor(accentColor).fontSize(22).text('WM', startX + 18, 85);
            }

            doc.fillColor(mainColor).fontSize(14).text('Webmasterify and It Solution', startX + 80, 70, { bold: true });
            doc.fontSize(8).text('Phone: 9307324014', startX + 80, 95);
            doc.text('Email: webmasterifyy@gmail.com', startX + 80, 108);

            // 3. Invoice No & Date Box
            doc.rect(startX + width * 0.6, 50, width * 0.4, 90).stroke(mainColor);
            doc.fontSize(9).text(`Invoice No.: ${id.slice(-6).toUpperCase()}`, startX + width * 0.6 + 10, 65);
            doc.text(`Date: ${new Date().toLocaleDateString()}`, startX + width * 0.6 + 10, 85);

            // 4. Bill To Box
            doc.rect(startX, 140, width, 60).stroke(mainColor);
            doc.fontSize(8).text('Bill To:', startX + 5, 145);
            doc.fontSize(10).text(invoice.clientName, startX + 5, 160, { bold: true });
            doc.fontSize(8).fillColor('#666').text(`Account: ${invoice.accountNumber}`, startX + 5, 178);
            doc.fillColor(mainColor);

            // 5. Items Table
            const tableY = 200;
            const cols = [
                { label: '#', w: 30 },
                { label: 'Item name', w: 225 },
                { label: 'HSN/ SAC', w: 60 },
                { label: 'Qty', w: 40 },
                { label: 'Price/ Unit(Rs)', w: 80 },
                { label: 'Amount(Rs)', w: 80 }
            ];

            let curX = startX;
            cols.forEach(c => {
                doc.rect(curX, tableY, c.w, 20).fillAndStroke(lightColor, mainColor);
                doc.fillColor(mainColor).fontSize(8).text(c.label, curX, tableY + 6, { align: 'center', width: c.w });
                curX += c.w;
            });

            // 6. Item Rows
            let rowY = tableY + 20;
            if (invoice.items && invoice.items.length > 0) {
                invoice.items.forEach((item, index) => {
                    curX = startX;
                    const rowData = [
                        (index + 1).toString(),
                        item.itemName,
                        item.hsn || '',
                        item.quantity.toString(),
                        item.price.toFixed(2),
                        (item.quantity * item.price).toFixed(2)
                    ];

                    rowData.forEach((txt, i) => {
                        doc.rect(curX, rowY, cols[i].w, 20).stroke(mainColor);
                        doc.fillColor(mainColor).fontSize(8).text(txt, curX + 5, rowY + 6, { width: cols[i].w - 10, align: i > 3 ? 'right' : 'left' });
                        curX += cols[i].w;
                    });
                    rowY += 20;
                });
            } else {
                // Fallback if no items
                doc.rect(startX, rowY, width, 20).stroke(mainColor);
                doc.text('No items listed', startX + 5, rowY + 6);
                rowY += 20;
            }

            // 7. Summary Table
            rowY += 10;
            const drawSummaryRow = (label: string, value: string, isTotal = false) => {
                doc.rect(startX, rowY, width * 0.7, 20).stroke(mainColor);
                doc.rect(startX + width * 0.7, rowY, width * 0.3, 20).stroke(mainColor);

                doc.fontSize(9).fillColor(mainColor).text(label, startX + 5, rowY + 5);
                doc.text(value, startX + width * 0.7 + 5, rowY + 5, { align: 'right', width: width * 0.3 - 10 });
                rowY += 20;
            };

            drawSummaryRow('Sub Total', `Rs ${invoice.totalAmount.toFixed(2)}`);
            drawSummaryRow('Total', `Rs ${invoice.totalAmount.toFixed(2)}`, true);
            drawSummaryRow('Invoice Amount in Words', toWords(invoice.totalAmount));
            drawSummaryRow('Received (Paid)', `Rs ${invoice.paidAmount.toFixed(2)}`);

            doc.fillColor('red');
            drawSummaryRow('Balance (Remaining)', `Rs ${invoice.remainingAmount.toFixed(2)}`);

            // 8. EMI Schedule
            rowY += 15;
            doc.fillColor(mainColor).fontSize(10).text('EMI Payment Schedule:', startX, rowY, { bold: true });
            rowY += 15;
            invoice.emiDetails.forEach((emi, i) => {
                doc.fontSize(8).text(`${i + 1}. Rs ${emi.amount.toFixed(2)} | Due: ${new Date(emi.dueDate).toLocaleDateString()} | Status: ${emi.status.toUpperCase()}`, startX + 10, rowY);
                rowY += 12;
            });

            // 9. Footer
            doc.fontSize(7).fillColor('#666').text('Thank you for your business! This is a computer generated invoice.', startX, 780, { align: 'center', width });

            doc.end();
        });
    }
}
