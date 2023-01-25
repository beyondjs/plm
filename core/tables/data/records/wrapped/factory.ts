import {Factory} from "../../factory/factory";
import {WrappedRecord} from "./record";
import type {Table} from "../../../table";
import {RecordsDataFactory} from "../data/factory";
import {RecordIdentifier} from "../data/record";

export class WrappedFactory extends Factory<WrappedRecord> {
    readonly #recordsDataFactory: RecordsDataFactory
    get recordsDataFactory() {
        return this.#recordsDataFactory
    }

    constructor(table: Table, recordsDataFactory: RecordsDataFactory) {
        super(table);
        this.#recordsDataFactory = recordsDataFactory;
    }

    protected create(key: string, instanceId: number, identifier: RecordIdentifier, session: string) {
        return new WrappedRecord(this, key, instanceId, identifier, session);
    }

    get(identifier: RecordIdentifier, session: string): WrappedRecord {
        return super.get(identifier, session);
    }
}
