import {Node} from "./node";
import {ItemSelectorProperty} from "../tables/properties/types/item-selector";
import {Property} from "../tables/properties/property";
import type {NodesSpecs} from "./specs";
import type {ItemNode} from "./item";

declare function require(module: string): any;

export interface ItemSelectorNodeSpecs {
    [table: string]: NodesSpecs
}

export class ItemSelectorNode extends Node {
    get is() {
        return 'item-selector';
    }

    #tables: Map<string, ItemNode> = new Map();
    get tables() {
        return this.#tables
    }

    readonly #property: Property
    get property() {
        return this.#property
    }

    constructor(table: string, specs?: ItemSelectorNodeSpecs, parent?: Node, property?: ItemSelectorProperty) {
        super(table, specs, parent, property);

        this.#property = property;
        if (typeof specs !== 'object') throw new Error('Invalid parameters');

        for (const [table, children] of Object.entries(specs)) {
            if (!property.tables.includes(table)) {
                throw new Error(`Table "${table}" is not registered`);
            }

            const CItemNode = <typeof ItemNode>(require('./item')).ItemNode;
            this.#tables.set(table, new CItemNode(table, children, this, property));
        }
    }
}
