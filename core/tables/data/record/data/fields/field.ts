import type {RecordData} from '..';
import {PublishedFieldSource} from './sources/published';
import {MemoryFieldSource} from './sources/memory';
import {NotSet} from '../../../../../constants';

/**
 * A record data field
 */
export class Field {
    readonly #name: string;
    get name() {
        return this.#name
    }

    readonly #record: RecordData;
    get record() {
        return this.#record;
    }

    readonly #memory: MemoryFieldSource = new MemoryFieldSource(this)
    get memory(): any {
        return this.#memory
    }

    readonly #published: PublishedFieldSource = new PublishedFieldSource(this)
    get published() {
        return this.#published
    }

    /**
     * Field Constructor
     *
     * @param name {string} The name of the field
     * @param record {object} The Record instance
     */
    constructor(name: string, record: RecordData) {
        this.#name = name;
        this.#record = record;
    }

    get value(): any {
        // If memory value is assigned return it first
        if (this.#memory.assigned) {
            return this.#memory.value;
        }

        // If record is loaded or fetched, then return the published value
        if (this.#record.landed) {
            return this.#published.value;
        }

        // Check if the field is set in the initial identifier
        const initialIdentifier = this.#record.identifiers.initial;
        if (initialIdentifier?.hasOwnProperty(this.#name)) {
            return initialIdentifier[this.#name];
        }

        // Field value is not set
        return NotSet;
    }

    /**
     * true if any of the sources (memory or published) has a value different than [NotSet, undefined] or
     * true is returned if the initial identifier is set for this field
     * @returns {boolean}
     */
    get assigned(): boolean {
        const record = this.#record;
        if (!record.landed) {
            const initialIdentifier = record.identifiers.initial;
            if (initialIdentifier?.hasOwnProperty(this.#name)) {
                return true;
            }
        }

        return this.#memory.assigned || this.#published.assigned;
    }

    get unpublished() {
        return this.#memory !== NotSet && this.#memory !== this.#published;
    }

    discard = () => this.#memory.discard();
}
