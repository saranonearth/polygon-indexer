import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Index} from 'typeorm';

export type TxStatus = 'QUEUED' | 'PENDING' | 'CONFIRMED' | 'FAILED' | 'CANCELLED';

@Schema({timestamps: true})
export class Transaction {

    public _id: string;

    @Prop({required: true, index: true})
    public status: TxStatus;

    @Prop({required: true, index: true})
    public transactionHash: string;

    @Prop({default: () => new Date()})
    public emittedAt: Date;

    @Prop({type: Object})
    public data: any;

}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
TransactionSchema.index({status: 1, transactionHash: 1}, {unique: true});
