import {ListData} from "./list";
import {RecordData} from "../records/data/record";

export type RecordId = {
    unpublished: boolean
    localId?: string
    pk?: (string | number)
}

export class ListRecords {
    readonly #list: ListData
    get list() {
        return this.#list
    }

    // Keeps a list of records sorted by the filter criteria
    #ordered: RecordId[] = []

    get values(): RecordId[] {
        return this.#ordered.slice()
    }

    /**
     * ListRecords Constructor
     * @param {ListRecords} list
     */
    constructor(list: ListData) {
        this.#list = list;
        this.#list.table.records.on('modified', this.#admission);
    }

    #delete = (unpublished: boolean, id: (string | number)) => {
        for (let index = this.#ordered.length - 1; index >= 0; index--) {
            const value = this.#ordered[index];
            if (!value.unpublished !== !!unpublished) continue;
            if ((value.unpublished && value.localId !== id) || (!value.unpublished && value.pk !== id)) continue;
            this.#ordered.splice(index, 1);
        }
    }

    #sort = (unpublished: boolean, id: (string | number)) => {
        // TODO: sort algorithm should be added here
        const value: Record<string, string | number | boolean> = {unpublished: unpublished};
        value[unpublished ? 'localId' : 'pk'] = id;
        this.#ordered.push(<RecordId>value);
    }

    /**
     * Checks if the record should be included in the list or not
     * @param {RecordData} record
     * @param {string} field The name of the field that has changed
     */
    #admission = (record: RecordData, field?: string) => {
        if (field && !this.#list.filter.fields.has(field)) {
            // The change is in a field that is not part of the filter
            return;
        }

        const applies = this.#list.filter.applies(record);

        const id = record.persisted ? record.pk.value : record.localId;
        applies ? this.#sort(record.persisted, id) : this.#delete(record.persisted, id);
    }

    destroy() {
        this.#list.manager.off('modified', this.#admission);
    }

    overwrite(values: (string | number)[]) {
        this.#ordered = [];
        values.forEach(id => this.#ordered.push({unpublished: false, pk: id}));
    }
}
