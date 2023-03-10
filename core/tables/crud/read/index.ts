import type {Table} from '../../table';
import type {RecordData} from '../../data/records/data/record';
import type {ListData} from '../../data/lists/list';
import type {CounterData} from '../../data/counter/counter';
import type {TQuery, TRecordResponse, TQueryResponse, PK} from './query';
import {RecordReader} from './record';
import {ListReader} from './list';
import {CounterReader} from './counter';
import {ReadBatch} from './batch';

export type TReadFunction = (batch: TQuery[]) => Promise<TQueryResponse[]>;

export class TableRead {
    #record: RecordReader;
    #list: ListReader;
    #counter: CounterReader;

    constructor(table: Table, read: TReadFunction) {
        const batch = new ReadBatch(read);

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
