import type {Table} from '../table';
import type {RecordStoreStructure} from '../local-database/records/records';
import type {TReadFunction} from "./read";
import type {RecordData} from "../data/records/data/record";
import {TableRead} from "./read";

export type CrudFunctions = {
    create: () => Promise<void>;
    read: TReadFunction;
    update: () => Promise<void>;
    delete: () => Promise<void>;
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
        const response = <RecordStoreStructure>await this.#functions.create(fields);
        return {};
    }

    async delete(record: RecordData): Promise<{ error?: string }> {
        const response = <RecordStoreStructure>await this.#functions.delete(pk);
        return {};
    }
}
