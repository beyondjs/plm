import type {Table} from '../table';
import type {TReadFunction} from './read';
import type {RecordData} from '../data/record/data';
import {TableRead} from './read';

export type CrudFunctions = {
    publish?: (table: string, fields: [string, any][]) => Promise<void>;
    delete?: (table: string, pk: string | number) => Promise<void>;
    read: TReadFunction;
}

/**
 * The Queries class is a central point for executing different types of queries on a specific table.
 * It provides an API for querying the table's data, the lists and the counters of the number of records
 * that match a specific filter.
 */
export class Crud {
    #table: Table;

    readonly #functions: CrudFunctions;

    readonly #read: TableRead;
    get read() {
        return this.#read;
    }

    constructor(table: Table, functions: CrudFunctions) {
        this.#table = table;
        this.#functions = functions;
        this.#read = new TableRead(table, functions.read);
    }

    async publish(record: RecordData): Promise<void> {
        if (typeof this.#functions.publish !== 'function') {
            throw new Error(`Table "${this.#table.name}" does not support to create new records`);
        }

        await this.#functions.publish(this.#table.name, [...record.fields.unpublished()]);
    }

    async delete(record: RecordData): Promise<void> {
        if (typeof this.#functions.delete !== 'function') {
            throw new Error(`Table "${this.#table.name}" does not support record deletion`);
        }

        await this.#functions.delete(this.#table.name, record.pk.value);
    }
}
