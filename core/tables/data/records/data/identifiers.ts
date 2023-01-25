import {Events} from "@beyond-js/kernel/core";
import {CompareObjects} from "../../factory/compare-objects";
import {NotSet} from "../../../../constants";
import type {RecordData, RecordIdentifier} from "./record";
import type {Indices} from "../../../indices/indices";
import {Index} from "../../../indices/index";

export class RecordIdentifiers extends Events {
    readonly #record: RecordData

    // The initial identifier when the record was created by the manager
    // and the record is still not loaded
    readonly #initial?: RecordIdentifier
    get initial(): RecordIdentifier {
        return this.#initial
    }

    #indices: Indices

    // Identifiers by index name
    #identifiers: Map<string, RecordIdentifier> = new Map

    get size() {
        return this.#identifiers.size
    }

    #errors: string[] = []

    errors() {
        return this.#errors
    }

    get(indexName: string): RecordIdentifier {
        return this.#identifiers.get(indexName)
    }

    /**
     * RecordIdentifiers Constructor
     *
     * @param {RecordData} record
     * @param {RecordIdentifier} initial The initial identifier when the record was created by the manager
     */
    constructor(record: RecordData, initial?: RecordIdentifier) {
        super();
        this.#initial = initial;

        this.#record = record;
        this.#indices = record.table.indices;

        if (!initial || initial.localId) return;

        const index = this.getIndex(initial);
        if (!index) {
            console.error('Identifier:', initial);
            throw new Error('Identifier does not match any of the indices of the table');
        }
        this.#identifiers.set(index.name, initial);
    }

    get primaryKeyFieldValue(): any {
        const pk = this.#indices.primary;
        const field = pk.fields[0];

        return this.#initial && this.#initial.hasOwnProperty(field) ?
            this.#initial[field] :
            this.#record.fields.get(field).value;
    }

    /**
     * Finds the index that fits an identifier
     *
     * @param {RecordIdentifier} identifier
     * @returns {Index | undefined}
     */
    getIndex = (identifier: RecordIdentifier): Index => {
        for (const index of this.#indices.values()) {
            if (!index.primary && !index.unique) continue;
            const found = index.fields.reduce(
                (found: boolean, field: string) => found && identifier.hasOwnProperty(field),
                true
            );

            if (found) return index;
        }
    };

    /**
     * Returns an identifier according to the fields of an index
     *
     * @param {string} indexName
     * @returns {RecordIdentifier | undefined}
     */
    createIdentifierFromIndex(indexName: string): RecordIdentifier {
        if (!this.#indices.has(indexName)) {
            throw new Error(`Index "${indexName}" is not registered`)
        }
        const index = this.#indices.get(indexName);
        if (!index.primary && !index.unique) {
            throw new Error(`Index "${indexName}" must be primary or unique to identify the record`);
        }

        if (!this.#record.loaded) {
            throw new Error(`Cannot create the identifier as the record is not loaded`);
        }

        const output: Record<string, any> = {};
        for (const fieldName of index.fields) {
            const value = this.#record.fields.get(fieldName).value;

            if (index.primary && [undefined, NotSet].includes(value)) {
                this.#errors.push(`Record violates the index "${indexName}" ` +
                    `as the field "${fieldName}" has an undefined value`);
                return;
            }

            output[fieldName] = value;
        }

        return output;
    };

    /**
     * Updates the identifiers according to the values of the fields of the record
     */
    update() {
        const updated: Map<string, RecordIdentifier> = new Map;
        const table = this.#record.table;
        const previous = this.#identifiers;

        for (const index of table.indices.values()) {
            const identifier = this.createIdentifierFromIndex(index.name);
            updated.set(index.name, identifier);
        }

        // Check if some of the identifiers changed
        let changed = false;
        for (const [name, identifier] of updated.entries()) {
            if (!this.#identifiers.has(name)) {
                changed = true;
                break;
            }
            if (!CompareObjects.compare(identifier, this.#identifiers.get(name))) {
                changed = true;
                break;
            }
        }

        this.#identifiers = updated;
        if (changed) {
            this.trigger('change', this.#record, previous);
        }
    }

    forEach = (callback: any) => this.#identifiers.forEach(callback);

    * [Symbol.iterator]() {
        for (const identifier of this.#identifiers.values()) {
            yield identifier;
        }
    }
}
