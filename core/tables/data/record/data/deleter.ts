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
    async delete(): Promise<void> {
        // Avoid to request the delete action twice to the server
        if (this.#deleting) return;

        // Check if the record is persisted
        if (!this.#record.persisted) {
            throw new Error('Record cannot be deleted as is it not persisted');
        }

        // Check if the record is already deleted
        if (this.#deleted) return;

        if (!this.#record.pk.assigned) {
            throw new Error(`Record cannot be deleted as its primary key field is not defined`);
        }

        this.#deleting = true;
        this.#record.trigger('change');

        try {
            await this.#record.table.crud.delete(this.#record.pk.value);
            this.#deleted = true;
            this.#record.trigger('deleted');
        } catch (e) {
            throw e;
        } finally {
            this.#deleting = false;
            this.#record.trigger('change');
        }
    }
}
