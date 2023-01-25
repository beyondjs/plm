import {Table} from "../../table";

export interface FieldOrderSpecs {
    field: string
    asc: boolean
}

export type OrderSpecs = FieldOrderSpecs[]

export class Order {
    readonly #table: Table
    get table() {
        return this.#table
    }

    readonly #specs: OrderSpecs
    get specs() {
        return this.#specs
    }

    #validate = () => {
        if (!this.#specs) return true;

        if (!(this.#specs instanceof Array)) {
            throw new Error('Invalid order specification');
        }
        for (const field of this.#specs) {
            if (!field || typeof field !== 'object') {
                console.error('Order field', field);
                throw new Error('At least one of the fields of the order is invalid');
            }

            if (!field.field || typeof field.field !== 'string') {
                throw new Error(`Field attribute "${field}" of the order specification is invalid`);
            }
        }
    }

    constructor(table: Table, specs: OrderSpecs) {
        this.#table = table;
        this.#specs = specs;
        this.#validate();
    }
}
