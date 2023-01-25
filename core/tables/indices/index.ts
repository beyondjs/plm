export interface IndexSpecs {
    primary?: boolean,
    unique?: boolean,
    fields: string[],
    batches?: Record<string, string[]>
}

/**
 * Index of the table
 */
export class Index {
    readonly #name: string;
    get name() {
        return this.#name;
    }

    readonly #specs: IndexSpecs;

    get primary(): boolean {
        return this.#specs.primary;
    }

    get unique(): boolean {
        return this.#specs.unique;
    }

    get fields(): string[] {
        return this.#specs.fields;
    }

    get batches(): Record<string, string[]> {
        return this.#specs.batches;
    }

    /**
     * Index Constructor
     *
     * @param name {string} The name of the index
     * @param specs {IndexSpecs} The index specification
     */
    constructor(name: string, specs: IndexSpecs) {
        if (!(specs.fields instanceof Array) || !specs.fields.length) throw new Error(
            `Fields specification of index "${name}" is invalid`);

        if (specs.fields.length !== 1 && specs.primary)
            throw new Error(`Primary key must have only one field on index "${name}"`);

        if (specs.batches && typeof specs.batches !== 'object')
            throw new Error(`Batches specification is invalid on index "${name}"`);

        specs.batches = specs.batches ? specs.batches : {};
        if (!specs.batches && specs.primary) {
            specs.batches = {};
            specs.batches[specs.fields[0]] = ['data'];
        }

        this.#name = name;
        this.#specs = specs;
    }

    /**
     * Check if the index is suitable to be queried by the specified parameters
     *
     * @param {Record<string, string | number>} fields The fields to be used by the request
     * @param {string} action The action to be executed (tu, data, list, count)
     * @returns {boolean}
     */
    suitable(action: string, fields: Record<string, any>) {
        if (!Object.keys(fields).length) throw new Error('Parameter fields does not set any properties');

        // "data" action only can use the primary key or a unique index
        if (action === 'data' && !this.primary && !this.unique) return false;

        // "list" and "count" actions cannot use the primary key index
        if (['list', 'count'].includes(action) && this.primary) return false;

        let count = 0;
        for (const field of this.fields) {
            if (!fields.hasOwnProperty(field)) {
                // All the fields must be set on the "data" action,
                // as all the fields are require to uniquely identify the record being queried
                if (['tu', 'data'].includes(action)) return false;

                // An index can be used on "list" and "count" actions
                // when not all the fields are specified, only if:
                // 1. There is at least one field that applies to the filter
                // 2. There are no other filters specified in the parameters that are used by the index
                return count === Object.keys(fields).length;
            }

            count++;
        }

        // Do not use the index if more fields than the required were specified
        return count === Object.keys(fields).length;
    }
}
