import type {Table} from '../../table';
import type {DerivedItem, Item} from '../../../elements/item';
import type {PropertySpecs} from '../property';
import type {RecordIdentifier} from '../../data/record/data';
import {Property} from '../property';

export interface ItemSelectorResponse {
    table: string
    Item: DerivedItem
    identifier: RecordIdentifier
}

export interface ItemSelectorPropertySpecs {
    selector: (item: Item) => ItemSelectorResponse
    tables: string[]
}

export class ItemSelectorProperty extends Property {
    get type() {
        return 'item-selector'
    }

    readonly #selector: (item: Item) => ItemSelectorResponse
    get selector() {
        return this.#selector
    }

    readonly #tables: string[]
    get tables(): string[] {
        return this.#tables
    }

    constructor(parentTable: Table, name: string, specs: PropertySpecs & ItemSelectorPropertySpecs) {
        super(parentTable, name, specs);

        this.#tables = specs.tables;
        this.#selector = specs.selector;
    }

    validate(): boolean {
        // TODO: Add property validations
        return true;
    }
}
