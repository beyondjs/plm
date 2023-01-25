import type {Item} from "./item";

export class Tree {
    readonly #item: Item;

    constructor(item: Item) {
        this.#item = item;
    }

    get landed() {
        const item = this.#item;
        if (!item.landed) return false;

        for (const property of item.properties.values()) {
            if (!property.tree.landed) return false;
        }

        return true;
    }
}