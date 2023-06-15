import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Transaction} from '../models/Transaction';
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

}
