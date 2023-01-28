import type {RecordData} from './';
import {SingleCall} from '@beyond-js/kernel/core';

export class RecordPublisher {
    // The record instance to be published
    readonly #record: RecordData;

    constructor(record: RecordData) {
        this.#record = record;
    }

    #publishing = false;

    // Indicates if the record is currently being published
    get publishing() {
        return this.#publishing;
    }

    #published = false;

    // Indicates if the record has already been published
    get published() {
        return this.#published;
    }

    /**
     * Publishes the current state of the record to the server
     * @returns {Promise<boolean>}
     */
    @SingleCall
    async publish(): Promise<void> {
        // Do not allow to publish if the record has not been modified
        if (!this.#record.unpublished) {
            throw new Error('Cannot publish a record that has not been modified');
        }

        this.#publishing = true;
        this.#record.trigger('change');

        try {
            await this.#record.table.crud.publish(this.#record);
            this.#published = true;
            this.#record.trigger('published');
        } catch (e) {
            throw e;
        } finally {
            this.#publishing = false;
            this.#record.trigger('change');
        }
    }
}
