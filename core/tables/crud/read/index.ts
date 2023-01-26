import type {Table} from '../../table';
import type {Crud} from '../index';
import type {RecordData} from '../../data/records/data/record';
import type {ListData} from '../../data/lists/list';
import type {CounterData} from '../../data/counter/counter';
import type {RecordStoreStructure} from '../../local-database/records/records';
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
    }

    async record(record: RecordData): Promise<RecordStoreStructure> {
        this.#record.read(record);
    }

    async list(list: ListData): Promise<(string | number)[]> {
        // filter: FilterSpecs, attributes: ListAttributes
    }

    async count(counter: CounterData): Promise<number> {
        // filter: FilterSpecs, attributes: CounterAttributes
    }
}
