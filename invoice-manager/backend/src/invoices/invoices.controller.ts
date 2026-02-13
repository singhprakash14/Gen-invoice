import { Controller, Get, Post, Body, Param, Res, Patch, Delete } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import type { Response } from 'express';

@Controller('invoices')
export class InvoicesController {
    constructor(private readonly invoicesService: InvoicesService) { }

    @Post()
    create(@Body() createInvoiceDto: any) {
        return this.invoicesService.create(createInvoiceDto);
    }

    @Get()
    findAll() {
        return this.invoicesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.invoicesService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateInvoiceDto: any) {
        return this.invoicesService.update(id, updateInvoiceDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.invoicesService.remove(id);
    }

    @Get(':id/pdf')
    async downloadPdf(@Param('id') id: string, @Res() res: Response) {
        const buffer = await this.invoicesService.generatePdf(id);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=invoice-${id}.pdf`,
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }
}
