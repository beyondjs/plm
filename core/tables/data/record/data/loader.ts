import type {RecordData, RecordDataVersion} from '.';
import {SingleCall} from '@beyond-js/kernel/core';

export class RecordLoader {
    readonly #record: RecordData
    readonly #version: RecordDataVersion;

    constructor(record: RecordData, version: RecordDataVersion) {
        this.#record = record;
        this.#version = version;
    }

    #loaded = false;
    get loaded() {
        return this.#loaded;
    }

    #searched = false;
    get searched() {
        return this.#searched
    }

    @SingleCall
    async load(): Promise<boolean> {
        const {table} = this.#record;
        const {pk} = this.#record;

        if (!pk.assigned) throw new Error(`Primary key field "${pk.name}" not assigned`);

        const fields: Record<string, any> = {};
        fields[pk.name] = pk.value;

        const index = table.indices.primary;
        const value = await table.localDB.records.load(index.name, fields);
        this.#searched = true;
        if (!value || !value.version || !value.fields) return false;

        this.#record.fields.setter.values(value.fields);
        this.#version.value = value.version;

        this.#loaded = true;
        this.#record.trigger('change');
        this.#record.trigger('updated');

        return true;
    }
}
