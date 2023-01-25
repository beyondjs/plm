import {tables} from "../../../tables";

export class RecordReport {
    #checkTable = (tableName: string): boolean => {
        if (!tables.has(tableName)) {
            console.error('Realtime record update notification arrived with ' +
                `an invalid table specification "${tableName}"`);
            return false;
        }
        return true;
    };

    insert(tableName: string, id: string | number) {
        console.log('record insert reported', tableName, id);
    }

    delete(tableName: string, id: string | number) {
        console.log('record deleted reported', tableName, id);
    }

    update(tableName: string, pk: string | number, field?: string, value?: any) {
        if (!this.#checkTable(tableName)) return;

        const table = tables.get(tableName);
        table.records.realtime.reports.update(pk, field, value);
    }
}
