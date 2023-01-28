import type {RecordFieldsValues} from '../../../../local-database/records';
import type {RecordData} from '../';

export class FieldsSetter {
    readonly #record: RecordData;

    constructor(record: RecordData) {
        this.#record = record;
    }

    values(values: RecordFieldsValues) {
        const record = this.#record;

        // Check if primary key received is valid
        const pk = record.table.indices.primary.fields[0];
        if (!values.hasOwnProperty(pk)) {
            console.error(`Data received on record fetch is invalid. Primary key not received.`, values, this);
            return;
        }
        for (const identifier of record.identifiers) {
            if (!identifier.hasOwnProperty(pk)) continue;
            if (identifier[pk] !== values[pk]) {
                console.error(`Data received on record fetch is invalid. Primary key received is invalid.`, values, this);
                return;
            }
            break;
        }

        // Set fields with the received values
        const data: Map<string, any> = new Map(Object.entries(values));
        for (const [name, value] of data) {
            const {fields} = record;
            if (!fields.has(name)) {
                console.warn(`Field "${name}" is not defined on table "${record.table.name}", ` +
                    `but it was received on fetch response.\n\n`, data, '\n', this);
                continue;
            }

            const field = fields.get(name);
            field.published.overwrite(value);
        }
    }
}
