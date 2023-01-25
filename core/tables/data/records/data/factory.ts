import {Events} from "@beyond-js/kernel/core";
import {Table} from "../../../table";
import {RecordData, RecordIdentifier} from "./record";
import {CompareObjects} from "../../factory/compare-objects";
import {UnpublishedRecords} from "./unpublished";
import {WrappedFactory} from "../wrapped/factory";

export class RecordsDataFactory extends Events {
    readonly #table: Table
    get table() {
        return this.#table;
    }

    readonly #identifiers: Map<string, RecordData> = new Map()
    readonly #unpublished = new UnpublishedRecords(this)
    get unpublished() {
        return this.#unpublished
    }

    constructor(table: Table) {
        super();
        this.#table = table;
    }

    #wrappedFactory: WrappedFactory
    set wrappedFactory(value: WrappedFactory) {
        this.#wrappedFactory = value;
    }

    get(identifier: RecordIdentifier, session: string): RecordData {
        const key = CompareObjects.generate(identifier, session);
        if (this.#identifiers.has(key)) {
            return this.#identifiers.get(key);
        }

        const record = new RecordData(this, identifier, session);
        this.#identifiers.set(key, record);

        return record;
    }


    /**
     * This method is called by the wrapped record.
     * When an identifier is not longer used (no consumers are holding the identifier),
     * then the wrapped record is destroyed, and this method is called.
     * It is required to check if there still are other identifiers using this record before destroying it.
     *
     * @param {RecordIdentifier} identifier
     * @param {string} session
     */
    release(identifier: RecordIdentifier, session: string) {
        const key = CompareObjects.generate(identifier, session);
        if (!this.#identifiers.has(key)) {
            throw new Error(`Identifier "${key}" session "${session}" is not registered in the factory`);
        }

        const record = this.#identifiers.get(key);

        // Check if there are identifiers consuming this record
        for (const identifier of record.identifiers) {
            if (this.#wrappedFactory.has(identifier, session)) {
                return;
            }
        }

        // At this point, none of the record identifiers are being consumed
        this.#identifiers.delete(key);
        record.destroy();
    }

    create = (session: string) => this.#unpublished.create(session);
    getUnpublished = (localId: string) => this.#unpublished.getUnpublished(localId);
}
