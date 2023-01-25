import {WrappedRecord} from "../record";

export class WrappedRecordField {
    #name: string
    #wrappedRecord: WrappedRecord

    get assigned(): boolean {
        return this.#wrappedRecord.record.fields.get(this.#name).assigned;
    }

    get value(): any {
        return this.#wrappedRecord.record.fields.get(this.#name).value;
    }

    get unpublished(): boolean {
        return this.#wrappedRecord.record.fields.get(this.#name).unpublished;
    }

    set value(value) {
        this.#wrappedRecord.record.fields.get(this.#name).memory.value = value;
    }

    constructor(name: string, wrappedRecord: WrappedRecord) {
        this.#name = name;
        this.#wrappedRecord = wrappedRecord;
    }
}
