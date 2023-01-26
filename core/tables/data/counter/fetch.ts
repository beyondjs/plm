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

        const read = await table.crud.read.count(this.#counter);
        this.#value.value = read.count;

        this.#fetching = false;
        this.#fetched = true;
        this.#counter.trigger('change');
    }
}
