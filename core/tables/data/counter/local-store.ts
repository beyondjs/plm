import {CounterData} from "./counter";

export class CounterLocalStore {
    readonly #counter: CounterData

    #loaded = false;
    get loaded(): boolean {
        return this.#loaded;
    }

    #accessed = false;

    async load(): Promise<number> {
        const {table, filter} = this.#counter;

        const attributes = {};
        const stored = await table.localDB.counters.load(filter.specs, attributes);

        this.#accessed = true;
        this.#loaded = !!stored;

        return stored;
    }

    constructor(counter: CounterData) {
        this.#counter = counter;
    }
}