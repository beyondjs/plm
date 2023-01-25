import type {RecordsManager} from "../manager";
import type {RecordIdentifier} from "../data/record";

export class Reports {
    readonly #manager: RecordsManager;

    constructor(manager: RecordsManager) {
        this.#manager = manager;
    }

    update(pk: string | number, field?: string, value?: any) {
        const {table} = this.#manager;
        const pkName = table.indices.primary.fields[0];

        const identifier: RecordIdentifier = {};
        identifier[pkName] = pk;

        const session: string = undefined;
        const record = this.#manager.recordsDataFactory.get(identifier, session);

        if (record.landed) {
            if (!field) {
                record.invalidate();
                return;
            }

            // Check if field exists in the record
            if (!record.fields.has(field)) {
                console.warn(`Record field realtime is invalid. Field "${field}" not found on table "${table.name}"`);
                return;
            }
            record.fields.get(field).published.overwrite(value);
            record.trigger('change');
        }

        this.#manager.recordsDataFactory.release(identifier, session);
    }
}
