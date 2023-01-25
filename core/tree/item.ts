import type {NodeSpecs} from "./specs";
import {Node} from "./node"
import {Properties} from "./properties";
import {NodesSpecs} from "./specs";
import type {ItemProperty} from "../tables/properties/types/item";
import type {ItemsProperty} from "../tables/properties/types/items";
import type {ItemSelectorProperty} from "../tables/properties/types/item-selector";

export interface ItemNodeSpecs extends NodeSpecs {
    properties?: NodesSpecs
}

export class ItemNode extends Node {
    get is() {
        return 'item';
    }

    readonly #specs: ItemNodeSpecs;
    get specs() {
        return this.#specs;
    }

    readonly #properties: Properties;
    get properties() {
        return this.#properties;
    }

    constructor(table: string, specs?: ItemNodeSpecs, parent?: Node,
                property?: ItemProperty | ItemsProperty | ItemSelectorProperty) {
        super(table, specs, parent, property);

        specs = specs ? specs : {};
        if (typeof specs !== 'object') throw new Error('Invalid parameters');

        this.#specs = specs;
        this.#properties = new Properties(this.table);
        this.#properties.register(specs.properties, this);
    }
}
