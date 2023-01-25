import {DerivedItem} from "../../../elements/item/item";
import {PropertySpecs, Property} from "../property";
import type {Table} from "../../table";
import type {Tables} from "../../tables";

declare function require(module: string): any;

// @field The name of the field of the primary key index, or a unique index
// @field  Compounds indices are not actually supported
// @source The name of the field that is the source of data of the ids of the related table
export interface ItemsPropertyIdentifierSpecs {
    field: string,
    source: string
}

export interface ItemsPropertySpecs {
    Items: DerivedItem
    identifier: ItemsPropertyIdentifierSpecs
    table: string
}

export class ItemsProperty extends Property {
    get type() {
        return 'items';
    }

    readonly #table: string
    get table(): string {
        return this.#table
    }

    readonly #Items: DerivedItem
    get Items(): DerivedItem {
        return this.#Items
    }

    readonly #identifier: ItemsPropertyIdentifierSpecs
    get identifier() {
        return this.#identifier
    }

    constructor(parentTable: Table, name: string, specs: PropertySpecs & ItemsPropertySpecs) {
        super(parentTable, name, specs);
        this.#table = specs.table;
        this.#Items = specs.Items;
        this.#identifier = specs.identifier;
    }

    validate(): boolean {
        const {source, field} = this.#identifier;
        if (!this.parentTable.fields.includes(source)) {
            throw new Error(`Property "${this.name}" of table "${this.parentTable.name}" has an invalid source.`);
        }

        const tables: Tables = <Tables>require('../../tables');
        const relatedTable = tables.get(this.#table);
        if (!relatedTable.fields.includes(field)) {
            throw new Error(`Property "${this.name}" of table "${this.parentTable.name}" has an invalid "field" value.`);
        }

        return true;
    }
}
