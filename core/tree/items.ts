import {Node} from "./node"
import {NodesSpecs} from "./specs";
import type {NodeSpecs} from "./specs";
import {ItemNode} from "./item";
import {ItemsProperty} from "../tables/properties/types/items";

export interface ItemsNodeSpecs extends NodeSpecs {
    properties: NodesSpecs
}

export class ItemsNode extends Node {
    get is() {
        return 'items';
    }

    readonly #items: ItemNode;
    get items() {
        return this.#items;
    }

    constructor(table: string, specs?: ItemsNodeSpecs, parent?: Node, property?: ItemsProperty) {
        if (typeof specs !== 'object') throw new Error('Invalid parameters');
        super(table, specs, parent, property);

        this.#items = new ItemNode(table, {properties: specs.properties}, parent, property);
    }
}
