import type {Table} from '../../../table';
import type {RecordsDataFactory} from '../data/factory';
import type {RecordIdentifier} from '../data';
import {Factory} from '../../factory';
import {WrappedRecord} from './record';

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
