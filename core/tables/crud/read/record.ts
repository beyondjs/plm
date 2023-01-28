import type {Table} from '../../table';
import type {ReadBatch} from './batch';
import type {RecordData} from '../../data/record/data';
import {RecordQuery, TRecordResponse} from './query';

export class RecordReader {
    #table: Table;
    #batch: ReadBatch;

    constructor(table: Table, batch: ReadBatch) {
        this.#table = table;
        this.#batch = batch;
    }

    async read(record: RecordData): Promise<TRecordResponse> {
        const fields: Record<string, any> = {};

        let count = 0;
        for (const [name, field] of record.fields) {
            if (!field.assigned) continue;
            fields[name] = field.value;
            count++;
        }

        if (count === 0) {
            const message = 'None of the fields of the record being fetched is set';
            console.error(message, record);
            throw new Error(message);
        }

        const index = this.#table.indices.select('data', fields);
        if (!index) {
            const message = `No index found in table "${this.#table.name}" ` +
                `that can be used to solve a "data" request.\n\n`;
            console.error(message, record);
            throw new Error(message);
        }

        let cached = await this.#table.localDB.records.load(index.name, fields);
        const version = cached ? cached.version : undefined;
        const request = new RecordQuery({fields, version});

        /**
         * Call the batch to queue the read query
         */
        const response = <TRecordResponse>await this.#batch.exec(request);

        // Item not found
        if (response === undefined || response === null) {
            if (cached) {
                // Delete from cache
                this.#table.localDB.records.remove(cached.fields).catch(error => {
                    const message = `Error removing record of table "${this.#table.name}" to local storage.\n\n`
                    console.error(message, error, '\n', cached)
                });
            }
            return;
        }

        if (typeof response !== 'object') {
            console.warn(`Invalid response received querying record of table "${this.#table.name}".\n\n`,
                request, '\n', response);
            return;
        }

        response.version = response.version ? response.version : (response as any).tu;
        if (typeof response.fields !== 'object' || typeof response.version !== 'number') {
            console.warn(`Invalid response received querying record of table "${this.#table.name}".\n\n`,
                request, '\n', response);
            return;
        }

        // Verify that the version of the received record is newer
        if (version && version >= response.version) {
            console.warn('The record version of the received fetch is not improved.\n' +
                `Cached version was "${version}" and the record received version is "${response.version}"`);
        }

        // Save to cache
        this.#table.localDB.records.save(response.fields, response.version)
            .catch(error => console.error(`Error saving record of table "${this.#table.name}" to local storage.\n\n`,
                error, '\n', request, '\n', response.fields));

        return response;
    }
}
