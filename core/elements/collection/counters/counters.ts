import type {Collection} from "../collection";
import {CollectionCounter} from "./counter";
import {FilterSpecs} from "../../../tables/data/filter/filter";

export class CollectionCounters extends Map<string, CollectionCounter> {
    readonly #collection: Collection;

    constructor(collection: Collection) {
        super();
        this.#collection = collection;
    }

    register(name: string, conditions?: FilterSpecs) {
        const {node} = this.#collection;
        if (!node.counters.has(name)) return;
        this.set(name, new CollectionCounter(this.#collection, name, conditions));
    }

    async load(): Promise<void> {
        const promises: Promise<void>[] = [];
        this.forEach(counter => promises.push(counter.load()));
        await Promise.all(promises);
    }

    async fetch(): Promise<void> {
        const promises: Promise<void>[] = [];
        this.forEach(counter => promises.push(counter.fetch()));
        await Promise.all(promises);
    }

    async fill(): Promise<void> {
        const promises: Promise<void>[] = [];
        this.forEach(counter => !counter.value === undefined && promises.push(counter.fetch()));
        await Promise.all(promises);
    }
}
