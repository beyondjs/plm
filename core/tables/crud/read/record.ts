import type {Table} from "../../table";
import type {ReadBatch} from "./batch";
import type {ListAttributes} from "../data/lists/list";
import type {RecordStoreStructure} from "../local-database/records/records";
import type {TRecordQueryRequest} from "./types";

export class RecordReader {
    #table: Table;
    #batch: ReadBatch;

    constructor(table: Table, batch: ReadBatch) {
        this.#table = table;
        this.#batch = batch;
    }

    async read(fields: Record<string, any>, attributes: ListAttributes): Promise<RecordStoreStructure> {
        attributes = attributes ? attributes : {};

        const index = this.#table.indices.select('data', fields);
        if (!index) {
            const message = `No index found in table "${this.#table.name}" ` +
                `that can be used to solve a "data" request.\n\n`;
            console.error(message, fields);
            throw new Error(message);
        }

        let cached = await this.#table.localDB.records.load(index.name, fields, attributes.accessToken);
        const version = cached ? cached.version : undefined;
        const request: TRecordQueryRequest = {query: 'record', version, fields, attributes};

        /**
         * Call the batch to queue the read query
         */
        const response = <RecordStoreStructure>await this.#batch.exec(request);

        // Item not found
        if (response === undefined || response === null) {
            if (cached) {
                //Delete to cache
                this.#table.localDB.records.remove(cached.data, attributes.accessToken).catch(error => {
                    const message = `Error removing record of table "${this.#table.name}" to local storage.\n\n`
                    console.error(message, error, '\n', cached)
                });
            }
            return;
        }

        if (typeof response !== 'object') {
            console.warn(`Response received was not an object on query "data" to table "${this.#table.name}".\n\n`,
                request, '\n', response);
            return;
        }

        response.version = response.version ? response.version : (response as any).tu;
        if (typeof response.data !== 'object' || typeof response.version !== 'number') {
            console.warn(`Invalid response received on query "data" to table "${this.#table.name}".\n\n`,
                request, '\n', response);
            return;
        }

        // Verify that the version of the received record is newer
        if (version && version >= response.version) {
            console.warn('The record version of the received fetch is not improved.\n' +
                `Cached version was "${version}" and the record received version is "${response.version}"`);
        }

        // Save to cache
        this.#table.localDB.records.save(response.data, response.version, attributes.accessToken)
            .catch(error => console.error(`Error saving record of table "${this.#table.name}" to local storage.\n\n`,
                error, '\n', request, '\n', response.data));

        return response;
    }
}
