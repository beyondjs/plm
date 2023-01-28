import type {Collection} from '..';
import type {FilterSpecs} from '../../../tables/data/filter';
import {CollectionCounter} from './counter';

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
