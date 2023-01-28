import type {Table} from '../../table';
import type {ReadBatch} from './batch';
import type {TCounterResponse} from './query';
import type {CounterData} from '../../data/counter';
import {CounterQuery} from './query';

export class CounterReader {
    #table: Table
    #batch: ReadBatch;

    constructor(table: Table, batch: ReadBatch) {
        this.#table = table;
        this.#batch = batch;
    }

    async read(counter: CounterData): Promise<number> {
        let fields: Record<string, any> = {};
        const filter = counter.filter.specs ? counter.filter.specs : [];
        let count = 0;
        filter.map(condition => {
            count++;
            fields[condition.field] = condition.value;
        });

        const index = count ? this.#table.indices.select('count', fields) : undefined;
        if (count && !index) {
            const message = `No index found in table "${this.#table.name}" ` +
                `that can be used to solve a "count" this request`;
            console.error(message, filter, fields);
            throw new Error(message);
        }

        const request = new CounterQuery({index: index?.name, filter});
        const response = <TCounterResponse>await this.#batch.exec(request);

        if (typeof response !== 'object') {
            console.error(`Invalid response received on query "counter" to table "${this.#table.name}"`,
                request, response);
            return;
        }

        this.#table.localDB.counters.save(filter, response.count)
            .catch(error => console.error(`Error saving counter of table "${this.#table.name}" to local storage`,
                error, request, response));

        return response.count;
    }
}
