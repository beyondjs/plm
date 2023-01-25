import {LocalDB} from "../local-database";
import {MemoryLocalDBCounters} from "./memory";
import {FilterSpecs} from "../../data/filter/filter";
import {PendingPromise} from "@beyond-js/kernel/core";
import {CompareObjects} from "../../data/factory/compare-objects";
import type {CounterAttributes} from "../../data/counter/counter";

export type CounterStoreStructure = {
    key: string,
    value: number,
    savedTime: number
}

export class LocalDBCounters {
    #db: LocalDB
    #memory = new MemoryLocalDBCounters()
    get memory() {
        return this.#memory
    }

    constructor(db: LocalDB) {
        this.#db = db
    }

    #generateKey = (filter: FilterSpecs, attributes: CounterAttributes): string => {
        filter = filter ? filter : [];

        // Order the filter by field to assure that the generated key be unique
        filter = filter.sort((c1, c2) => c1.field > c2.field ? -1 : 1);

        return CompareObjects.generate(filter, attributes);
    };

    #save = (key: string, value: number): Promise<boolean> => {
        const promise: PendingPromise<boolean> = new PendingPromise;
        const transaction: IDBTransaction = this.#db.db.transaction(['counters'], 'readwrite');
        const store: IDBObjectStore = transaction.objectStore('counters');

        let rq;
        try {
            rq = store.put({key: key, value: value, savedTime: Date.now()});
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

    async save(filter: FilterSpecs, attributes: CounterAttributes, data: number): Promise<boolean> {
        // Save in memory cache first, the data must be available immediately as other
        // nodes in the tree that request the data could require it
        const key = this.#generateKey(filter, attributes);
        this.#memory.set(key, data);

        await this.#db.prepare();
        return await this.#save(key, data);
    }

    #load = (key: string): Promise<number> => {
        if (this.#memory.has(key)) return Promise.resolve(this.#memory.get(key));

        const promise: PendingPromise<number> = new PendingPromise;
        const transaction: IDBTransaction = this.#db.db.transaction(['counters'], 'readonly');
        const store: IDBObjectStore = transaction.objectStore('counters');

        let rq;
        try {
            rq = store.get(key);
        } catch (exc) {
            promise.reject(exc);
            return promise;
        }

        rq.onerror = (event: any) => promise.reject(event.target.result);
        rq.onsuccess = (event: any) => {
            const output: CounterStoreStructure = event.target.result;
            promise.resolve(output ? output.value : undefined);
        };

        return promise;
    }

    async load(filter: FilterSpecs, attributes: CounterAttributes): Promise<number> {
        await this.#db.prepare();
        const key = this.#generateKey(filter, attributes);
        return await this.#load(key);
    }
}