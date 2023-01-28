import type {NodesSpecs} from './specs';
import type {ItemsProperty} from '../tables/properties/types/items';
import {Node} from './node'
import {ItemNode} from './item';

export interface ItemsNodeSpecs {
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
        super(table, parent, property);

        this.#items = new ItemNode(table, {properties: specs.properties}, parent, property);
    }
}
