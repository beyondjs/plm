import type {ItemProperty} from '.';

export class Tree {
    readonly #property: ItemProperty;

    constructor(property: ItemProperty) {
        this.#property = property;
    }

    get landed(): boolean {
        const item = this.#property.value;
        return item ? item.tree.landed : true;
    }
}
