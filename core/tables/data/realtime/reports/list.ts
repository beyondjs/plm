import {tables} from "../../../tables";

export /*bundle*/
type ListUpdateFilterReport = Record<string, string | number | boolean>;

export class ListReport {
    update(tableName: string, filter: ListUpdateFilterReport) {
        if (!tables.has(tableName)) {
            console.error(`Realtime list update notification arrived with an invalid table specification "${tableName}"`);
            return;
        }

        const table = tables.get(tableName);
        table.lists.realtime.reports.update(filter);
    }
}
