import type {NodeSpecs} from "./specs";
import {Node} from "./node"
import {ItemNode} from "./item";
import {NodesSpecs} from "./specs";
import {Property} from "../tables/properties/property";
import {OrderSpecs} from "../tables/data/lists/order";

export interface ICollectionNodeSpecs extends NodeSpecs {
    view?: string
    limit?: number
    properties?: NodesSpecs
    order?: OrderSpecs
    counters?: string[]
}

export class CollectionNode extends Node {
    get is() {
        return 'collection'
    }

    readonly #view: string
    get view() {
        return this.#view
    }

    readonly #limit: number
    get limit() {
        return this.#limit
    }

    readonly #items: ItemNode
    get items(): ItemNode {
        return this.#items
    }

    readonly #order: OrderSpecs
    get order(): OrderSpecs {
        return this.#order
    }

    readonly #counters: Set<string> = new Set()
    get counters() {
        return this.#counters
    }

    constructor(table: string, specs: ICollectionNodeSpecs, parent?: Node, property?: Property) {
        super(table, specs, parent, property);

        specs = specs ? specs : {};
        if (typeof specs !== 'object') throw new Error('Invalid parameters');
        if (specs.counters && !(specs.counters instanceof Array)) throw new Error('Invalid counters specification');

        this.#counters = new Set(specs.counters);

        this.#items = new ItemNode(table, {properties: specs.properties}, parent);
        this.#view = specs.view;
        this.#limit = specs.limit;
        this.#order = specs.order;
    }
}
