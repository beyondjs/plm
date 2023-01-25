import {WrappedRecord} from "../record";
import {WrappedRecordField} from "./field";

export class WrappedRecordFields extends Map {
    constructor(wrappedRecord: WrappedRecord) {
        super();
        const {fields} = wrappedRecord.manager.table;

        for (const name of fields) {
            this.set(name, new WrappedRecordField(name, wrappedRecord));
        }
    }
}
