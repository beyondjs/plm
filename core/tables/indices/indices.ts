import {Index, IndexSpecs} from "./index";
import type {Table} from "../table";

export type IndicesSpecs = Record<string, IndexSpecs>

/**
 * The indices collection
 */
export class Indices extends Map<string, Index> {
    // The primary index, .. a table can only have one primary index
    readonly #primary: Index;
    get primary() {
        return this.#primary;
    }

    /**
     * Indices collection Constructor
     * @param table {object} The table that contains the indices
     * @param specs {object} The indices specification
     */
    constructor(table: Table, specs: IndicesSpecs) {
        super();

        if (!specs) {
            throw new Error(`Table "${table.name}" does not define its indices. ` +
                `At least its primary key must be defined`);
        }

        for (const [indexName, indexSpecs] of Object.entries(specs)) {
            this.set(indexName, new Index(indexName, indexSpecs));
        }

        this.#primary = [...this.values()].find(index => index.primary);
        if (!this.#primary)
            throw new Error(`Table "${table.name}" does not define a primary key`);
    }

    /**
     * Select an index to be used to query by the specified fields
     *
     * @param {string} action The action (data, list, count)
     * @param {Record<string, any>} fields The fields of the request
     * @returns {Index | undefined}
     */
    select(action: string, fields: Record<string, any>): Index | undefined {
        if (typeof fields !== 'object') throw new Error('Invalid parameter');

        for (let index of this.values()) {
            // Filter the fields to only leave the required by the index, otherwise it will not work
            const filtered = Object.fromEntries(
                Object.entries(fields).filter(([name]) => index.fields.includes(name))
            );
            if (Object.entries(filtered).length !== index.fields.length) continue;

            // Find a suitable index
            if (index.suitable(action, filtered)) return index;
        }
    };
}
