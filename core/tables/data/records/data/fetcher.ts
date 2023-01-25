import {SingleCall} from "@beyond-js/kernel/core";
import {RecordData, RecordDataVersion} from "./record";
import type {RecordStoreStructure} from "../../../local-database/records/records";

export class RecordFetcher {
    readonly #record: RecordData
    readonly #version: RecordDataVersion;

    constructor(record: RecordData, version: RecordDataVersion) {
        this.#record = record;
        this.#version = version;
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
    async fetch(): Promise<boolean> {
        // Avoid to request the fetch action twice to the server
        if (this.#fetching) return;

        const {table} = this.#record;

        const done = (data: RecordStoreStructure) => {
            this.#fetched = true;
            this.#record.fields.setter.values(data.data);
            this.#version.value = data.version;
            this.#record.trigger('change');
            this.#record.trigger('updated');
            return true;
        };

        // Check if data is already loaded in memory cache
        const memory: RecordStoreStructure = table.localDB.records.memory.load(this.#record);
        if (memory && Date.now() - memory.savedTime < 1000) {
            return done(memory);
        }

        // Fetch from server
        this.#fetching = true;
        this.#record.trigger('change');

        const fields: Record<string, any> = {};

        let count = 0;
        for (const [name, field] of this.#record.fields) {
            if (!field.assigned) continue;
            fields[name] = field.value;
            count++;
        }
        const attributes = {};

        if (count === 0) {
            console.warn('None of the fields of the record being fetched is set', this.#record);
            return;
        }

        const response: RecordStoreStructure = await table.queries.data(fields, attributes);
        if (!response) {
            this.#fetching = false;
            this.#fetched = true;
            return false;
        }

        this.#fetching = false;
        return done(response);
    }
}
