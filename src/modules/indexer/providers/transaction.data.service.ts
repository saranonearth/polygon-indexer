import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Transaction, TxStatus} from '../models/Transaction';
import {Model} from 'mongoose';

@Injectable()
export class TransactionDataService {
    constructor(
        @InjectModel(Transaction.name) private readonly transactionModel: Model<Transaction>
    ) {
    }

    public async saveEvent(tx: Transaction): Promise<void> {
        await this.transactionModel.create(tx);
    }

    public async getTransactionsByStatus(status: TxStatus, skip: number, limit: number): Promise<Transaction[]> {
        return this.transactionModel.find({status}).skip(skip).limit(limit);
    }

    public async getTransactionByHash(hash: string): Promise<Transaction | null> {
        return this.transactionModel.findOne({transactionHash: hash});
    }

}
