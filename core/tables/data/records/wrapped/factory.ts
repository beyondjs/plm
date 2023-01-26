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

    protected create(key: string, instanceId: number, identifier: RecordIdentifier) {
        return new WrappedRecord(this, key, instanceId, identifier);
    }

    get(identifier: RecordIdentifier): WrappedRecord {
        return super.get(identifier);
    }
}
