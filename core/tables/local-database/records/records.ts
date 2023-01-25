import type {LocalDB} from "../local-database";
import {PendingPromise} from "@beyond-js/kernel/core";
import {MemoryLocalDBRecords} from "./memory";
import type {Index} from "../../indices/index";

export type RecordFieldsValues = Record<string, any>
export type IndexFieldsValues = Record<string, any>

export type RecordStoreStructure = {
    data: RecordFieldsValues
    version: number
    accessToken?: string
    savedTime: number
}

export class LocalDBRecords {
    readonly #db: LocalDB
    #memory = new MemoryLocalDBRecords()
    get memory() {
        return this.#memory
    }

    constructor(db: LocalDB) {
        this.#db = db
    }

    #save = (value: RecordStoreStructure): Promise<boolean> => {
        const promise: PendingPromise<boolean> = new PendingPromise;
        const transaction = this.#db.db.transaction(['records'], 'readwrite');
        const store = transaction.objectStore('records');

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

    async save(data: RecordFieldsValues, version: number, accessToken?: string): Promise<boolean> {
        const pk = this.#db.table.indices.primary.fields[0];
        if (!data.hasOwnProperty(pk)) {
            throw new Error(`Cannot save record to the local database as its pk "${pk}" is not assigned`);
        }

        const value: RecordStoreStructure = {
            data: data,
            version: version,
            accessToken: accessToken ? accessToken : '',
            savedTime: Date.now()
        };

        // Save in memory cache first, the data must be available immediately as other
        // nodes in the tree that request the data could require it
        this.#memory.save(data[pk], accessToken, value);

        if (!this.#db.table.cache.enabled) return;
        await this.#db.prepare();
        return await this.#save(value);
    }

    #remove = () => {
        //TODO remove on indexedDB
        return true;
    }

    async remove(data: RecordFieldsValues, accessToken?: string): Promise<boolean> {
        const pk = this.#db.table.indices.primary.fields[0];
        if (!data.hasOwnProperty(pk)) {
            throw new Error(`Cannot remove record to the local database as its pk "${pk}"`);
        }

        // Remove in memory cache first, the data must be available immediately as other
        // nodes in the tree that request the data could require it
        this.#memory.remove(data[pk], accessToken);

        if (!this.#db.table.cache.enabled) return;
        await this.#db.prepare();
        return await this.#remove();
    }

    #load = (index: Index, fields: IndexFieldsValues, accessToken?: string): Promise<RecordStoreStructure> => {
        const pkField = this.#db.table.indices.primary.fields[0];
        const pk = fields.hasOwnProperty(pkField) ? fields[pkField] : undefined;

        if (index.primary && !pk) {
            throw new Error(`Primary key field "${pkField}" not specified`);
        }

        const promise: PendingPromise<RecordStoreStructure> = new PendingPromise;
        const transaction = this.#db.db.transaction(['records'], 'readonly');
        const store = transaction.objectStore('records');

        accessToken = accessToken ? accessToken : '';

        let rq;
        if (index.primary) {
            rq = store.get([pk, accessToken]);
        } else {
            const indexStore = store.index(index.name);
            if (!indexStore) {
                throw new Error(`Index ${index.name} doesn't exist`);
            }

            const values = index.fields.map(field => {
                if (!fields.hasOwnProperty(field)) {
                    throw new Error(`Field "${field}" is required to query by index "${index.name}"`);
                }
                return fields[field];
            });

            rq = indexStore.get(values);
        }

        rq.onerror = (event: any) => promise.reject(event.target.result);
        rq.onsuccess = (event: any) => promise.resolve(event.target.result);
        return promise;
    }

    async load(indexName: string, fields: IndexFieldsValues, accessToken?: string): Promise<RecordStoreStructure> {
        const {table} = this.#db;
        const {indices} = table;
        if (!indices.has(indexName)) {
            throw new Error(`Index "${indexName}" not found on table "${table.name}"`);
        }

        const index = indices.get(indexName);

        // Check if record is in memory cache
        if (index.primary) {
            const pkField = this.#db.table.indices.primary.fields[0];
            const pk = fields.hasOwnProperty(pkField) ? fields[pkField] : undefined;
            const key = this.#memory.generateKey(pk, accessToken);
            if (pk && this.#memory.has(key)) return Promise.resolve(this.#memory.get(key));
        }

        if (!this.#db.table.cache.enabled) return;

        await this.#db.prepare();
        return await this.#load(index, fields, accessToken);
    }
}
