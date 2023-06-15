import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Index} from 'typeorm';

export type TxStatus = 'QUEUED' | 'PENDING' | 'CONFIRMED' | 'FAILED' | 'CANCELLED';

@Schema({timestamps: true})
export class Transaction {

    public _id: string;

    @Index()
    @Prop({required: true})
    public status: TxStatus;

    @Index()
    @Prop({required: true})
    public transactionHash: string;

    @Prop({default: () => new Date()})
    public emittedAt: Date;

    @Prop({type: Object})
    public data: any;

}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
