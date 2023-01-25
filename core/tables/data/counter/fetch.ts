import type {CounterData, Value} from "./counter";

export class CounterFetch {
    readonly #counter: CounterData
    readonly #value: Value

    constructor(counter: CounterData, value: Value) {
        this.#counter = counter;
        this.#value = value;
    }

    #fetching = false
    get fetching() {
        return this.#fetching
    }

    #fetched = false
    get fetched() {
        return this.#fetched
    }

    async fetch() {
        const {table} = this.#counter;

        // Fetch from server
        this.#fetching = true;
        this.#counter.trigger('change');

        const attributes = {};
        this.#value.value = await table.queries.counter(this.#counter.filter.specs, attributes);

        this.#fetching = false;
        this.#fetched = true;
        this.#counter.trigger('change');
    }
}
