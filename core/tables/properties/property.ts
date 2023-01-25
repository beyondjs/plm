import type {Table} from "../table";

export interface PropertySpecs {
    readonly?: boolean
    immutable?: boolean
}

export interface Property {
    type: string
}

/**
 * A property of the table / item
 */
export abstract class Property {
    readonly #parentTable: Table;
    get parentTable(): Table {
        return this.#parentTable;
    }

    readonly #specs: PropertySpecs;
    get specs() {
        return this.#specs;
    }

    readonly #name: string;
    get name() {
        return this.#name;
    }

    readonly #readonly: boolean;
    get readonly() {
        return this.#readonly;
    }

    readonly #immutable: boolean;
    get immutable() {
        return this.#immutable;
    }

    abstract validate(): boolean;

    /**
     * Property constructor
     *
     * @param {Table} parentTable The table where the property resides
     * @param {string} name The property name
     * @param {PropertySpecs} specs The property specification
     */
    protected constructor(parentTable: Table, name: string, specs: PropertySpecs) {
        if (!parentTable || !name || !specs) throw new Error('Invalid parameters');

        this.#parentTable = parentTable;
        this.#name = name;

        this.#readonly = (typeof specs.readonly !== 'boolean') ? false : specs.readonly;
        this.#immutable = !!specs.immutable;

        this.#specs = specs;
    }
}
