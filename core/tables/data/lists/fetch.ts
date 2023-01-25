import {SingleCall} from "@beyond-js/kernel/core";
import type {ListData} from "./list";

export class ListFetch {
    readonly #list: ListData

    constructor(list: ListData) {
        this.#list = list;
    }

    #fetching = false
    get fetching() {
        return this.#fetching
    }

    #fetched = false
    get fetched() {
        return this.#fetched
    }

    @SingleCall
    async fetch() {
        const {table} = this.#list;

        // Fetch from server
        this.#fetching = true;
        this.#list.trigger('change');

        const attributes = {};

        const response: (string | number)[] = await table.queries.list(this.#list.filter.specs, attributes);
        if (!response) {
            this.#fetching = false;
            this.#fetched = true;
            this.#list.trigger('change');
            return;
        }

        this.#list.records.overwrite(response);

        this.#fetching = false;
        this.#fetched = true;
        this.#list.trigger('change');
        this.#list.trigger('updated');
    }
}
