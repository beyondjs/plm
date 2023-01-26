import {RecordData} from "../record";
import {Field} from "./field";
import {FieldsSetter} from "./setter";

/**
 * The record fields
 */
export class Fields extends Map<string, Field> {
    readonly #record: RecordData;
    get record() {
        return this.#record
    }

    readonly #setter: FieldsSetter;
    get setter() {
        return this.#setter;
    }

    constructor(record: RecordData) {
        super();
        this.#record = record;
        this.#setter = new FieldsSetter(record);

        const fields = record.table.fields;

        for (let name of fields) {
            const field = new Field(name, this.#record);
            this.set(name, field);
        }
    }

    /**
     * If any of the fields have a published value assigned, it means that the
     * record is already back-end persisted
     * @returns {boolean}
     */
    get persisted(): boolean {
        for (const field of this.values()) {
            if (field.published.assigned) return true;
        }
        return false;
    }

    /**
     * Returns an object with the key-value of the unpublished fields
     */
    unpublished(): Map<string, Field> {
        const fields: Map<string, Field> = new Map;
        this.forEach((field, name) => field.unpublished && fields.set(name, field.value));
        return fields;
    }

    discard = () => this.forEach(field => field.discard());
}
