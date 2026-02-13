import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InvoiceDocument = Invoice & Document;

@Schema({ timestamps: true })
export class Invoice {
    @Prop({ required: true })
    clientName: string;

    @Prop({ required: true })
    accountNumber: string;

    @Prop({ required: true })
    totalAmount: number;

    @Prop({ required: true })
    paidAmount: number;

    @Prop({ required: true })
    remainingAmount: number;

    @Prop([{
        itemName: String,
        hsn: String,
        quantity: Number,
        price: Number
    }])
    items: { itemName: string; hsn: string; quantity: number; price: number }[];

    @Prop([{
        amount: Number,
        dueDate: Date,
        status: { type: String, enum: ['paid', 'pending'], default: 'pending' }
    }])
    emiDetails: { amount: number; dueDate: Date; status: string }[];
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
