import {RecordData} from "./record";
import {RecordsDataFactory} from "./factory";

export class UnpublishedRecords {
    #recordsDataFactory: RecordsDataFactory

    constructor(recordsDataFactory: RecordsDataFactory) {
        this.#recordsDataFactory = recordsDataFactory;
    }

    readonly #records: Map<string, RecordData> = new Map()

    create(session: string): RecordData {
        const record = new RecordData(this.#recordsDataFactory, undefined, session);
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
