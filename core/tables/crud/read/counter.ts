import type {FilterSpecs} from "../data/filter/filter";
import type {CounterAttributes} from "../data/counter/counter";
import type {Table} from "../table";
import {Batch} from "./batch/batch";

// interface CounterRead {
//     action: string,
//     filter?: FilterSpecs,
//     attributes?: CounterAttributes
//     index?: string,
// }

export class CounterReader {
    #table: Table
    #batch: Batch<CounterQueryRequest, number>

    constructor(table: Table) {
        this.#table = table;
        this.#batch = new Batch({
            module: table.module,
            action: table.batch.actions.count,
            max: table.batch.max
        });
    }

    async exec(filter: FilterSpecs, attributes: CounterAttributes): Promise<number> {
        let fields: Record<string, any> = {};
        filter = filter ? filter : [];
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

        const request = {
            action: 'counter',
            attributes: attributes
        }
        count && Object.assign(request, {
            index: index.name,
            filter: filter,
        });

        const response = await this.#batch.exec(request);

        if (typeof response !== 'number') {
            console.error(`Invalid response received on query "counter" to table "${this.#table.name}"`,
                request, response);
            return;
        }

        this.#table.localDB.counters.save(filter, attributes, response)
            .catch(error => console.error(`Error saving counter of table "${this.#table.name}" to local storage`,
                error, request, response));

        return response;
    }
}
