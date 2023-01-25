import {DerivedItem, Item} from "../../../elements/item/item";
import {PropertySpecs, Property} from "../property";
import type {Table} from "../../table";

interface FieldIdentifierSpec {
    field: string
    source?: string
    value?: string
    transform?: (item: Item, value: any) => any
}

export type IdentifierSpec = FieldIdentifierSpec[]

export interface ItemPropertySpecs {
    Item: DerivedItem
    identifier: IdentifierSpec
    table: string
}

export class ItemProperty extends Property {
    get type() {
        return 'item';
    }

    readonly #table: string
    get table(): string {
        return this.#table
    }

    readonly #Item: DerivedItem
    get Item(): DerivedItem {
        return this.#Item
    }

    readonly #identifierSpec: IdentifierSpec
    get identifierSpec() {
        return this.#identifierSpec
    }

    constructor(parentTable: Table, name: string, specs: PropertySpecs & ItemPropertySpecs) {
        super(parentTable, name, specs)
        this.#table = specs.table
        this.#Item = specs.Item
        this.#identifierSpec = specs.identifier
    }

    validate(): boolean {
        // TODO: Add property validations
        return true;
    }
}
