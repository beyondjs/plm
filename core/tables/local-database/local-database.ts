import {Table} from "../table";
import {PendingPromise} from "@beyond-js/kernel/core";
import {LocalDBRecords} from "./records/records";
import {LocalDBLists} from "./lists/lists";
import {LocalDBUnpublished} from "./records/unpublished";
import {LocalDBCounters} from "./counters/counters";

export class LocalDB {
    readonly #table: Table
    get table() {
        return this.#table
    }

    #db: IDBDatabase
    get db() {
        return this.#db
    }

    #records = new LocalDBRecords(this)
    get records() {
        return this.#records
    }

    #unpublished = new LocalDBUnpublished(this)
    get unpublished() {
        return this.#unpublished
    }

    #lists = new LocalDBLists(this)
    get lists() {
        return this.#lists
    }

    #counters = new LocalDBCounters(this)
    get counters() {
        return this.#counters
    }

    #error = false
    get error() {
        return this.#error
    }

    #prepared: PendingPromise<void>

    prepare(): Promise<void> {
        if (!this.#table.cache.enabled) return Promise.resolve();

        if (this.#prepared) return this.#prepared;

        this.#prepared = new PendingPromise<void>();
        const table = this.#table;

        const name = `plm-table:${table.name}`;
        const version = table.version;

        const request: IDBOpenDBRequest = indexedDB.open(name, version);
        request.onerror = (error: any) => {
            this.#error = true;
            this.#prepared.reject(error.target.result);
        }
        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
            const db = (<any>event.target).result;

            const records = db.createObjectStore('records',
                {keyPath: [`data.${table.indices.primary.fields[0]}`, 'accessToken']});

            // Create the indices of the records object store
            for (const index of table.indices.values()) {
                if (!index.unique) continue;
                const keyPath = index.fields.map(field => `data.${field}`);
                keyPath.push('accessToken');
                records.createIndex(index.name, keyPath, {unique: true});
            }

            db.createObjectStore('unpublished',
                {keyPath: 'localId'});
            db.createObjectStore('lists',
                {keyPath: 'key'});
            db.createObjectStore('counters',
                {keyPath: 'key'});

            this.#db = db;
        }
        request.onsuccess = (event: IDBVersionChangeEvent) => {
            this.#db = this.#db ? this.#db : (<any>event.target).result;
            this.#prepared.resolve();
        }

        return this.#prepared;
    }

    constructor(table: Table) {
        this.#table = table;
    }
}
