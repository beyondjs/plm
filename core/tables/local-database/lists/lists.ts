import {LocalDB} from "../local-database";
import {MemoryLocalDBLists} from "./memory";
import {FilterSpecs} from "../../data/filter/filter";
import {PendingPromise} from "@beyond-js/kernel/core";
import {ListAttributes} from "../../data/lists/list";
import {CompareObjects} from "../../data/factory/compare-objects";

export type IdsList = (string | number)[];

export type ListStoreStructure = {
    key: string
    data: IdsList
    savedTime: number
}

export class LocalDBLists {
    #db: LocalDB
    #memory = new MemoryLocalDBLists()
    get memory() {
        return this.#memory
    }

    constructor(db: LocalDB) {
        this.#db = db
    }

    #generateKey = (filter: FilterSpecs, attributes: ListAttributes): string => {
        filter = filter ? filter : [];

        // Order the filter by field to assure that the generated key be unique
        filter = filter.sort((c1, c2) => c1.field > c2.field ? -1 : 1);

        return CompareObjects.generate(filter, attributes);
    };

    #save = (value: ListStoreStructure): Promise<boolean> => {
        const promise: PendingPromise<boolean> = new PendingPromise;
        const transaction = this.#db.db.transaction(['lists'], 'readwrite');
        const store = transaction.objectStore('lists');

        let rq;
        try {
            rq = store.put(value);
        } catch (exc) {
            promise.reject(exc);
            return promise;
        }

        rq.onerror = (event: any) => {
            promise.reject(event.target.result);
        };
        rq.onsuccess = () => {
            promise.resolve(true);
        };
        return promise;
    }

    async save(filter: FilterSpecs, attributes: ListAttributes, data: IdsList): Promise<boolean> {
        const key = this.#generateKey(filter, attributes);

        const value: ListStoreStructure = {
            key: key,
            data: data,
            savedTime: Date.now()
        };

        // Save in memory cache first, the data must be available immediately as other
        // nodes in the tree that request the data could require it
        this.#memory.set(key, value);

        if (!this.#db.table.cache.enabled) return;

        await this.#db.prepare();
        return await this.#save(value);
    }

    #load = (key: string): Promise<ListStoreStructure> => {
        const promise: PendingPromise<ListStoreStructure> = new PendingPromise;
        const transaction: IDBTransaction = this.#db.db.transaction(['lists'], 'readonly');
        const store: IDBObjectStore = transaction.objectStore('lists');

        let rq;
        try {
            rq = store.get(key);
        } catch (exc) {
            promise.reject(exc);
            return promise;
        }

        rq.onerror = (event: any) => promise.reject(event.target.result);
        rq.onsuccess = (event: any) => {
            const value: ListStoreStructure = event.target.result;
            value && this.#memory.set(key, value);
            promise.resolve(value);
        };

        return promise;
    }

    async load(filter: FilterSpecs, attributes: ListAttributes): Promise<ListStoreStructure> {
        const key = this.#generateKey(filter, attributes);
        if (this.#memory.has(key)) return this.#memory.get(key);

        if (!this.#db.table.cache.enabled) return;

        await this.#db.prepare();
        return await this.#load(key);
    }
}
