import type {Property, PropertySpecs} from "./property";
import {ItemProperty, ItemPropertySpecs} from "./types/item";
import {ItemsProperty, ItemsPropertySpecs} from "./types/items";
import {CollectionProperty, CollectionPropertySpecs} from "./types/collection";
import {ItemSelectorProperty, ItemSelectorPropertySpecs} from "./types/item-selector";
import type {Table} from "../table";

export type PropertySpecsUnion = (PropertySpecs &
    (ItemPropertySpecs | ItemSelectorPropertySpecs | ItemsPropertySpecs | CollectionPropertySpecs))

/**
 * The properties of the table / item
 */
export class Properties extends Map<string, Property> {
    #table: Table;
    get table(): Table {
        return this.#table;
    }

    /**
     * Properties constructor
     * @param table {Table} The table
     * @param specs {object} The properties specification
     */
    constructor(table: Table, specs: Record<string, PropertySpecsUnion>) {
        super();
        this.#table = table;

        specs = specs ? specs : {};
        if (typeof specs !== 'object')
            throw new Error(`Invalid properties specification`);

        Object.keys(specs).forEach(
            name => this.register(name, specs[name])
        );
    }

    register(name: string, specs: PropertySpecsUnion): this {
        let property

        if ((specs as ItemPropertySpecs).Item) {
            property = new ItemProperty(this.#table, name, <PropertySpecs & ItemPropertySpecs>specs)
        } else if ((specs as ItemSelectorPropertySpecs).selector) {
            property = new ItemSelectorProperty(this.#table, name, <PropertySpecs & ItemSelectorPropertySpecs>specs)
        } else if ((specs as ItemsPropertySpecs).Items) {
            property = new ItemsProperty(this.#table, name, <PropertySpecs & ItemsPropertySpecs>specs)
        } else if ((specs as CollectionPropertySpecs).Collection) {
            property = new CollectionProperty(this.#table, name, <PropertySpecs & CollectionPropertySpecs>specs)
        } else {
            console.error('Property specs:', specs);
            throw new Error(`Property "${name}" not recognized`)
        }

        super.set(name, property);
        return this;
    }

    validate(): boolean {
        this.forEach(property => property.validate());
        return true;
    }
}
