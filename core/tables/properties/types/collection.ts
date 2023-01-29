import type {DerivedCollection} from '../../../elements/collection';
import type {PropertySpecs} from '../property';
import type {Item} from '../../../elements/item';
import type {Table} from '../../table';
import {Property} from '../property';

// The source property or the value property must be set (one of both)
export /*bundle*/
interface FieldFilterSpec {
    // The field being filtered
    field: string;
    // The name of the field of the item that will be used to filter the collection,
    // It will be assigned to the name of the field of the filter
    source?: string;
    // The value assigned to the field of the filter
    value?: string | boolean | number;
    transform?: (item: Item, value: any) => any;
}

export /*bundle*/ type FilterSpec = FieldFilterSpec[];

export interface CollectionPropertySpecs {
    Collection: DerivedCollection;
    filter: FilterSpec;
    table: string;
}

export class CollectionProperty extends Property {
    get type() {
        return 'collection';
    }

    readonly #table: string;
    get table(): string {
        return this.#table;
    }

    readonly #Collection: DerivedCollection;
    get Collection() {
        return this.#Collection;
    }

    readonly #filterSpec: FilterSpec;
    get filterSpec() {
        return this.#filterSpec;
    }

    constructor(parentTable: Table, name: string, specs: PropertySpecs & CollectionPropertySpecs) {
        super(parentTable, name, specs);
        this.#table = specs.table;
        this.#Collection = specs.Collection;
        this.#filterSpec = specs.filter;
    }

    validate(): boolean {
        // TODO: Add property validations
        return true;
    }
}
