import type {RecordStoreStructure} from '../../../local-database/records';
import type {TRecordResponse} from '../../../crud/read/query';
import type {RecordData, RecordDataVersion} from './';
import {SingleCall} from '@beyond-js/kernel/core';

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

        const done = ({data, error}: { data?: RecordStoreStructure | TRecordResponse, error?: string }) => {
            this.#fetched = true;
            this.#record.error = error;
            data && this.#record.fields.setter.values(data.fields);
            this.#version.value = data?.version;

            this.#record.trigger('change');
            this.#record.trigger('updated');
            return true;
        };

        // Check if data is already loaded in memory cache
        const memory: RecordStoreStructure = table.localDB.records.memory.load(this.#record);
        if (memory && Date.now() - memory.savedTime < 1000) {
            return done({data: memory});
        }

        // Fetch from server
        this.#fetching = true;
        this.#record.trigger('change');

        try {
            const response: TRecordResponse = await table.crud.read.record(this.#record);
            if (!response) {
                this.#fetching = false;
                this.#fetched = true;
                return false;
            }

            this.#fetching = false;
            return done({data: response});
        } catch (exc) {
            return done({error: exc.message});
        }
    }
}
