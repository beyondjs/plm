import {ItemsProperty} from "./property";

export class Tree {
    readonly #property: ItemsProperty;

    constructor(property: ItemsProperty) {
        this.#property = property;
    }

    get landed(): boolean {
        for (const item of this.#property.values()) {
            if (!item.tree.landed) return false;
        }
        return true;
    }
}
