import {SingleCall} from "@beyond-js/kernel/core";
import type {RecordData, RecordDataVersion} from "./record";

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
        const index = table.indices.primary;
        const pk = index.fields[0];
        const pkField = this.#record.fields.get(pk);

        if (!pkField.assigned) throw new Error(`Primary key field "${pk}" not assigned`);

        const fields: Record<string, any> = {};
        fields[pk] = pkField.value;

        const value = await table.localDB.records.load(index.name, fields);
        this.#searched = true;
        if (!value || !value.version || !value.data) return false;

        this.#record.fields.setter.values(value.data);
        this.#version.value = value.version;

        this.#loaded = true;
        this.#record.trigger('change');
        this.#record.trigger('updated');

        return true;
    }
}
