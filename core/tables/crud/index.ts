import type {Table} from '../table';
import type {TReadFunction} from './read';
import type {RecordData} from '../data/record/data';
import {TableRead} from './read';

export type CrudFunctions = {
    create?: (record: RecordData) => Promise<{ error: string }>;
    read: TReadFunction;
    update?: (record: RecordData) => Promise<{ error: string }>;
    delete?: (record: RecordData) => Promise<{ error: string }>;
}

/**
 * The Queries class is a central point for executing different types of queries on a specific table.
 * It provides an API for querying the table's data, the lists and the counters of the number of records
 * that match a specific filter.
 */
export class Crud {
    readonly #functions: CrudFunctions;
    get functions() {
        return this.#functions;
    }

    readonly #read: TableRead;
    get read() {
        return this.#read;
    }

    constructor(table: Table, functions: CrudFunctions) {
        this.#functions = functions;
        this.#read = new TableRead(table, functions.read);
    }

    async publish(record: RecordData): Promise<{ error?: string }> {
        try {
            return await this.#functions.create(record);
        } catch (error) {
            return {error: error.message};
        }
    }

    async delete(record: RecordData): Promise<{ error?: string }> {
        try {
            return await this.#functions.delete(record);
        } catch (error) {
            return {error: error.message};
        }
    }
}
