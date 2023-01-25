import type {Table} from '../table';
import type {RecordStoreStructure} from '../local-database/records/records';
import type {TReadFunction} from "./read";
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
        this.#read = new TableRead(this);
    }

    async publish(fields: Map<string, any>, session: string): Promise<{ error?: string }> {
        const request = {
            action: 'publish',
            fields: fields,
            // attributes: attributes
        };
        const response = <RecordStoreStructure>await this.#table.module.execute('publish', request);
        return {};
    }

    async delete(pk: string | number): Promise<{ error?: string }> {
        const request = {
            action: 'delete', pk
            // attributes: attributes
        };
        const response = <RecordStoreStructure>await this.#table.module.execute('delete', request);
        return {};
    }
}
