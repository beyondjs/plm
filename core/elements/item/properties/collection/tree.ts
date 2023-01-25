import {CollectionProperty} from "./property";

export class Tree {
    readonly #property: CollectionProperty;

    constructor(property: CollectionProperty) {
        this.#property = property;
    }

    get landed(): boolean {
        const collection = this.#property.value;
        return collection ? collection.tree.landed : true;
    }
}
