import type {Collection} from "../collection";
import {DerivedItem, Item} from "../../item/item";

export class CollectionItems {
    readonly #collection: Collection

    #map: Map<string, Item>;
    #items: Item[] = [];
    get items() {
        return this.#items;
    }

    constructor(collection: Collection) {
        this.#collection = collection;
    }

    #timer: ReturnType<typeof setTimeout>;

    #triggerChange = () => {
        if (this.#timer) return;

        this.#timer = setTimeout(() => {
            this.#timer = void 0;
            this.#collection.node.trigger('change');
        }, 0);
    }

    update = () => {
        if (!this.#collection.list.landed) return;

        this.#items = [];
        const updated: Map<string, Item> = new Map();

        const ordered = this.#collection.list.records.values;
        for (const id of ordered) {
            let item: Item;
            const key = id.unpublished ? `local.${id.localId}` : `published.${id.pk}`;

            if (this.#map && this.#map.has(key)) {
                item = this.#map.get(key);
            } else if (id.unpublished) {
                const Item: DerivedItem = this.#collection.Item;
                item = new Item({
                    node: this.#collection.node.items,
                    localId: id.localId
                });
                item.on('change', this.#triggerChange);
            } else {
                item = new this.#collection.Item({
                    node: this.#collection.node.items,
                    pk: id.pk
                });
                item.on('change', this.#triggerChange);
            }

            updated.set(key, item);
            this.#items.push(item);
        }

        // Destroy unused items
        this.#map &&
        this.#map.forEach((item, key) => {
            if (updated.has(key)) return;
            item.off('change', this.#triggerChange);
            item.destroy();
        });

        this.#map = updated;
    }

    async load(tree = true) {
        const promises: Promise<void>[] = [];
        this.#map.forEach(item => promises.push(item.load(tree)));
        await Promise.all(promises);
    }

    async fetch(tree = true) {
        const promises: Promise<void>[] = [];
        this.#map.forEach(item => promises.push(item.fetch(tree)));
        await Promise.all(promises);
    }

    async fill(tree = true) {
        const promises: Promise<void>[] = [];
        this.#map.forEach(item => promises.push(item.fill(tree)));
        await Promise.all(promises);
    }

    activate() {
        this.#collection.list.on('updated', this.update);
        this.update();
    }

    destroy() {
        this.#collection.list.off('updated', this.update);
    }
}
