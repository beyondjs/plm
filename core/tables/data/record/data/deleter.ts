import {SingleCall} from '@beyond-js/kernel/core'
import type {RecordData} from './';

export class RecordDeleter {
    readonly #record: RecordData;

    constructor(record: RecordData) {
        this.#record = record;
    }

    #deleting = false;
    get deleting() {
        return this.#deleting;
    }

    #deleted = false;
    get deleted() {
        return this.#deleted;
    }

    @SingleCall
    async delete(): Promise<boolean> {
        // Avoid to request the delete action twice to the server
        if (this.#deleting) return;

        // Check if the record is persisted
        if (!this.#record.persisted) {
            console.warn('Record is not persisted, delete request skipped', this.#record);
            return false;
        }

        // Check if the record is already deleted
        if (this.#deleted) return true;

        const {table} = this.#record;
        const index = table.indices.primary;
        const pk = index.fields[0];
        const pkField = this.#record.fields.get(pk);

        if (!pkField.assigned) throw new Error(`Primary key field "${pk}" not assigned`);

        this.#deleting = true;
        this.#record.trigger('change');

        const response = await table.crud.delete(pkField.value);
        if (!response) {
            this.#deleting = false;
            return false;
        }

        this.#deleting = false;
        this.#deleted = true;
        this.#record.trigger('change');
        this.#record.trigger('deleted');
        return true;
    }
}
