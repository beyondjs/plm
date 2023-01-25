import {Product} from "../factory/product";
import type {CountersManager} from "./manager";
import {FilterSpecs, Filter} from "../filter/filter";
import {CounterFetch} from "./fetch";
import {CounterLocalStore} from "./local-store";

export type CounterAttributes = Record<string, any>

export interface Value {
    value: number
}

export class CounterData extends Product {
    readonly #filter: Filter
    get filter() {
        return this.#filter;
    }

    readonly #attributes: CounterAttributes
    get attributes() {
        return this.#attributes;
    }

    #value: Value = {value: undefined};
    get value(): number {
        return this.#value.value;
    }

    // The local store, properties and methods
    #localStore = new CounterLocalStore(this)
    get localStore() {
        return this.#localStore
    }

    get loaded() {
        return this.#localStore.loaded
    }

    async load() {
        let stored: number;
        try {
            stored = await this.#localStore.load();
        } catch (exc) {
            console.error(`Error loading counter from cache`, exc.stack);
            return;
        }

        if (stored === undefined) return;

        if (typeof stored !== 'number') {
            console.warn('Invalid counter data cache', this, stored);
        } else {
            this.#value.value = stored;
            this.trigger('change');
        }
    }

    // The fetch manager, properties and methods
    readonly #fetch = new CounterFetch(this, this.#value);

    get fetching() {
        return this.#fetch.fetching;
    }

    get fetched() {
        return this.#fetch.fetched;
    }

    async fetch() {
        await this.#fetch.fetch();
    }

    constructor(manager: CountersManager, key: string, instanceId: number,
                filterSpecs: FilterSpecs, attributes: CounterAttributes, session: string) {
        super(manager, key, instanceId, session);
        this.#filter = new Filter(this.table, filterSpecs);
        this.#attributes = attributes;
    }
}
