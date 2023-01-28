import type {CounterData, Value} from '.';

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

        try {
            this.#value.value = await table.crud.read.count(this.#counter);
        } catch (error) {
            this.#counter.error = error.message;
        }

        this.#fetching = false;
        this.#fetched = true;
        this.#counter.trigger('change');
    }
}
