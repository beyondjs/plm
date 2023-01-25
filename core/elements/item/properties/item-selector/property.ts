import type {Property} from "../property";
import {Item} from "../../item";
import {RecordIdentifier} from "../../../../tables/data/records/data/record";
import {ItemPropertyIdentifier} from "../item/identifier";
import {CompareObjects} from "../../../../tables/data/factory/compare-objects";
import {ItemSelectorProperty as TableItemSelectorProperty} from "../../../../tables/properties/types/item-selector";
import {ItemSelectorNode} from "../../../../tree/item-selector";
import {Tree} from "./tree";

export /*bundle*/
class ItemSelectorProperty implements Property {
    get is() {
        return 'item-selector';
    }

    readonly #parentItem: Item

    readonly #node: ItemSelectorNode
    get node() {
        return this.#node
    }

    readonly tree: Tree = new Tree(this);

    #value: Item
    get value() {
        return this.#value
    }

    #lastIdentifier: RecordIdentifier

    readonly #identifier: ItemPropertyIdentifier
    get identifier(): ItemPropertyIdentifier {
        return this.#identifier;
    }

    constructor(parentItem: Item, node: ItemSelectorNode) {
        this.#parentItem = parentItem
        this.#node = node
    }

    update() {
        const tableProperty = <TableItemSelectorProperty>this.#node.property;
        const {Item, identifier, table} = tableProperty.selector(this.#parentItem);

        // Check if the table is registered in the tree
        if (!this.node.tables.has(table)) return;

        // Check if value should be changed or not
        if (this.#value && this.#value.constructor === Item &&
            this.#lastIdentifier && CompareObjects.compare(this.#lastIdentifier, identifier)) {
            return this.#value;
        }
        this.#lastIdentifier = identifier;

        this.#value && this.#value.destroy();

        this.#value = new Item({
            node: this.node.tables.get(table),
            identifier: identifier
        });

        return this.#value;
    }

    load = async (tree = true) => await this.#value?.load(tree);
    fetch = async (tree = true) => await this.#value?.fetch(tree);
    fill = async (tree = true) => await this.#value?.fill(tree);
    destroy = () => this.#value?.destroy();
}