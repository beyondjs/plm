import {ItemSelectorProperty} from "./property";

export class Tree {
    readonly #property: ItemSelectorProperty;

    constructor(property: ItemSelectorProperty) {
        this.#property = property;
    }

    get landed(): boolean {
        const item = this.#property.value;
        return item ? item.tree.landed : true;
    }
}
