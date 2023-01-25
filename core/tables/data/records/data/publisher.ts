import {SingleCall} from "@beyond-js/kernel/core";
import {RecordData} from "./record";

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
     * @param {string} session
     * @returns {Promise<boolean>}
     */
    @SingleCall
    async publish(session?: string): Promise<boolean> {
        // Do not allow to publish if the record is already being published
        if (this.#publishing) {
            console.warn('Cannot publish a record that is already being published');
            return false;
        }

        // Prepare the data to be sent to the server
        const fields: Map<string, any> = this.#record.fields.unpublished();

        // Do not allow to publish if the record has not been modified
        if (!fields.size) {
            console.warn('Cannot publish a record that has not been modified');
            return false;
        }

        // Set the publishing flag
        this.#publishing = true;
        this.#record.trigger('change');

        // Send the fields to the server
        try {
            await this.#record.table.queries.publish(fields, session);
        } catch (e) {
            console.warn('Error publishing record: ', e);
            this.#publishing = false;
            this.#record.trigger('change');
            return false;
        }

        // If the server returns a success response
        this.#publishing = false;
        this.#record.trigger('change');
        this.#record.trigger('published');

        return true;
    }
}
