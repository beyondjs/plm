import type {Collection} from "./collection";

export class Tree {
    readonly #collection: Collection;

    constructor(collection: Collection) {
        this.#collection = collection;
    }

    get landed() {
        const collection = this.#collection;
        if (!collection.landed) return false;

        for (const item of collection.items) {
            if (!item.tree.landed) return false;
        }

        return true;
    }
}
