import type {Property} from "../property";
import {Item} from "../../item";
import {ItemsNode} from "../../../../tree/items";
import {ItemsProperty as TableItemsProperty} from "../../../../tables/properties/types/items";
import {WrappedRecordField} from "../../../../tables/data/records/wrapped/fields/field";
import {RecordIdentifier} from "../../../../tables/data/records/data/record";
import {Tree} from "./tree";

export /*bundle*/
class ItemsProperty extends Map implements Property {
    get is() {
        return 'items';
    }

    readonly #parentItem: Item

    readonly #node: ItemsNode
    get node() {
        return this.#node;
    }

    readonly tree: Tree = new Tree(this);

    constructor(parentItem: Item, node: ItemsNode) {
        super();
        this.#parentItem = parentItem;
        this.#node = node;
    }

    update(): this {
        const {record} = this.#parentItem;
        const tableProperty = <TableItemsProperty>this.#node.property;

        if (!record.fields.has(tableProperty.identifier.source)) return;

        const source: WrappedRecordField = record.fields.get(tableProperty.identifier.source);
        if (!source.assigned) return;

        const values: string | number[] = source.value;
        if (!(values instanceof Array)) return;

        for (const identifierValue of values) {
            if (this.has(identifierValue)) continue;

            const identifier: RecordIdentifier = {};
            identifier[tableProperty.identifier.field] = identifierValue;

            this.set(identifierValue, new tableProperty.Items({
                node: this.node.items,
                identifier: identifier
            }));
        }

        // Remove items that now are not in the collection
        const marked = [];
        for (const id of this.keys()) !values.includes(id) && marked.push(id);
        for (const id of marked) {
            const item = this.get(id);
            item.destroy();
            super.delete(id);
        }

        return this;
    }

    push(value: string | number) {
        const {record} = this.#parentItem;
        const tableProperty = <TableItemsProperty>this.#node.property;

        if (!record.fields.has(tableProperty.identifier.source))
            throw new Error(`Field "${tableProperty.identifier.source}" has not been declared`);

        const field = record.fields.get(tableProperty.identifier.source);
        let values = field.assigned ? field.value : [];

        if (values.includes(value)) return;

        values.push(value);
        field.memory = values;

        this.update();
    };

    delete(id: string | number) {
        const {record} = this.#parentItem;
        const tableProperty = <TableItemsProperty>this.#node.property;

        if (!record.fields.has(tableProperty.identifier.source))
            throw new Error(`Field "${tableProperty.identifier.source}" has not been declared`);

        const field = record.fields.get(tableProperty.identifier.source);
        let values: string | number[] = field.value;
        if (!(values instanceof Array)) return false; // Nothing to delete

        field.memory = values.filter(value => value !== id);

        this.update();
        return true;
    };

    async load(tree = true): Promise<void> {
        const promises: Promise<void>[] = [];
        this.forEach(item => promises.push(item.load(tree)));
        await Promise.all(promises);
    };

    async fetch(tree = true): Promise<void> {
        const promises: Promise<void>[] = [];
        this.forEach(item => promises.push(item.fetch(tree)));
        await Promise.all(promises);
    };

    async fill(tree = true): Promise<void> {
        const promises: Promise<void>[] = [];
        this.forEach(item => promises.push(item.fill(tree)));
        await Promise.all(promises);
    };

    destroy() {
        this.forEach(item => item.destroy());
        this.clear();
    }
}
