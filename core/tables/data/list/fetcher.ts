import type {ListData} from '.';
import {SingleCall} from '@beyond-js/kernel/core';

export class ListFetcher {
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

        const done = ({data, error}: { data?: (string | number)[], error?: string }) => {
            this.#fetching = false;
            this.#fetched = true;

            this.#list.records.overwrite(data ? data : []);
            this.#list.error = error;
            this.#list.trigger('change');
            this.#list.trigger('updated');
        }

        try {
            const response: (string | number)[] = await table.crud.read.list(this.#list);
            return done({data: response});
        } catch (error) {
            return done({error: error.message});
        }
    }
}
