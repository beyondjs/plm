import {PropertySpecs, Property} from "../property";
import type {DerivedItem, Item} from "../../../elements/item/item";
import {RecordIdentifier} from "../../data/records/data/record";
import type {Table} from "../../table";

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
