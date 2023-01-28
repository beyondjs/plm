import type {Table} from '../../table';
import type {ReadBatch} from './batch';
import type {ListData} from '../../data/list';
import type {PK, TCachedList, TListResponse} from './query';
import type {FilterSpecs} from '../../data/filter';
import {ListQuery} from './query';

export class ListReader {
    #table: Table;
    #batch: ReadBatch;

    constructor(table: Table, batch: ReadBatch) {
        this.#table = table;
        this.#batch = batch;
    }

    /**
     * Returns the cached version of the list as an object where the key is the primary key of the record,
     * and the value is its version
     *
     * @param {FilterSpecs} filter
     * @returns {Record<string, number>}
     */
    async #cached(filter: FilterSpecs): Promise<TCachedList> {
        let output: TCachedList = {};

        let cached = await this.#table.localDB.lists.load(filter);
        if (cached && !(cached.data instanceof Array)) {
            console.warn('Cache of list is invalid.\n', cached);
            cached = void 0;
        }

        if (!cached) return;

        const records = cached.data;
        for (const record of records) {
            const index = this.#table.indices.primary;
            const pk = index.fields[0];
            const fields: Record<string, string | number> = {};
            fields[pk] = record;

            let cached = await this.#table.localDB.records.load(index.name, fields);
            cached && (output[record] = cached.version);
        }

        return output;
    }

    /**
     * Creates a ListQueryRequest
     *
     * @param {FilterSpecs} filter
     * @returns {ListQuery}
     */
    async #request(filter: FilterSpecs): Promise<ListQuery> {
        const cached: TCachedList = await this.#cached(filter);

        const fields: Record<string, any> = {};
        filter = filter ? filter : [];
        let count = 0;
        filter.map(condition => {
            count++;
            fields[condition.field] = condition.value;
        });

        const index = count ? this.#table.indices.select('list', fields) : void 0;
        if (count && !index) {
            const message = `No index found in table "${this.#table.name}" ` +
                `that can be used to solve the "list" request.\n\n`;
            console.error(message, filter, '\n', fields);
            throw new Error(message);
        }

        return new ListQuery({cached, filter, index: index?.name});
    }

    async read(list: ListData): Promise<PK[]> {
        const request = await this.#request(list.filter.specs);
        const response = <TListResponse>await this.#batch.exec(request);

        if (!(response.records instanceof Array)) {
            console.error(`Invalid response received on query "list" to table "${this.#table.name}".\n\n`,
                request, '\n', response);
            return [];
        }

        // Save to the local database the list and the records data
        const listIds: (string | number)[] = [];
        for (const record of response.records) {
            if (!record.pk) {
                /**
                 * Record is not in cache
                 */
                const pk = this.#table.indices.primary.fields[0];
                if (!record.data.hasOwnProperty(pk)) {
                    console.error(`Error on "list" query. Record of table "${this.#table.name}" ` +
                        `does not have its primary key field "${pk}".\n\n`, request, record);
                    continue;
                }

                // Verify that the version of the received record is newer
                const {cached} = request;
                const cachedVersion = cached && cached.hasOwnProperty(record.data[pk]) ? cached[record.data[pk]] : 0;

                if (cachedVersion && cachedVersion >= record.version) {
                    console.warn('The record version of the received fetch is not improved.\n' +
                        `Cached version was "${cachedVersion}" and the record received version is "${record.version}"`);
                }

                listIds.push(record.data[pk]);

                this.#table.localDB.records.save(record.data, record.version)
                    .catch(error =>
                        console.error(`Error saving record of table "${this.#table.name}" to local storage.\n\n`,
                            error, '\n', request, '\n', record));
            } else {
                /**
                 * Record is up-to-date
                 */
                const {cached} = request;
                if (!cached.hasOwnProperty(record.pk)) {
                    const message = `The record received ("${record.pk}") is supposed to be cached, but it is not`;
                    console.warn(message, cached);
                } else {
                    listIds.push(record.pk);
                }
            }
        }

        this.#table.localDB.lists.save(list.filter.specs, listIds)
            .catch(error => console.error(`Error saving list of table "${this.#table.name}" to local storage.\n\n`,
                error, '\n', request, '\n', listIds));

        return listIds;
    }
}
