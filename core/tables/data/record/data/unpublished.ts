import type {RecordsDataFactory} from './factory';
import {RecordData} from './';

export class UnpublishedRecords {
    #recordsDataFactory: RecordsDataFactory

    constructor(recordsDataFactory: RecordsDataFactory) {
        this.#recordsDataFactory = recordsDataFactory;
    }

    readonly #records: Map<string, RecordData> = new Map()

    create(): RecordData {
        const record = new RecordData(this.#recordsDataFactory);
        this.#records.set(record.localId, record);
        return record;
    }

    getUnpublished(localId: string): RecordData {
        if (this.#records.has(localId)) return this.#records.get(localId);

        const record = new RecordData(this.#recordsDataFactory, localId);
        this.#records.set(record.localId, record);
        return record;
    }
}
