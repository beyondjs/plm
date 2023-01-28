import type {Table} from '../../table';
import type {RecordData} from '../../data/record/data';
import type {ListData} from '../../data/list';
import type {CounterData} from '../../data/counter';
import type {TRecordResponse, TQueryResponse, PK} from './query';
import type {TBatchQueries} from './batch';
import {RecordReader} from './record';
import {ListReader} from './list';
import {CounterReader} from './counter';
import {ReadBatch} from './batch';

export type TReadFunction = (batch: TBatchQueries) => Promise<TQueryResponse[]>;

export class TableRead {
    #record: RecordReader;
    #list: ListReader;
    #counter: CounterReader;

    constructor(table: Table, read: TReadFunction) {
        const batch = new ReadBatch(table, read);

        this.#record = new RecordReader(table, batch);
        this.#list = new ListReader(table, batch);
        this.#counter = new CounterReader(table, batch);
    }

    async record(record: RecordData): Promise<TRecordResponse> {
        return await this.#record.read(record);
    }

    async list(list: ListData): Promise<PK[]> {
        return await this.#list.read(list);
    }

    async count(counter: CounterData): Promise<number> {
        return await this.#counter.read(counter);
    }
}
