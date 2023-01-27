import type {TReadFunction} from "./index";
import type {TQuery, TQueryResponse} from "./query";
import type {Table} from "../../table";

export /*bundle*/ type TBatchQueries = {
    table: string,
    queries: TQuery[];
}

export class ReadBatch {
    readonly #table: Table;
    readonly #read: TReadFunction;
    readonly #specs: { max: number };
    readonly #queue: TQuery[] = [];
    readonly #queries: Map<number, TQuery> = new Map();

    constructor(table: Table, read: TReadFunction, specs?: { max?: number }) {
        this.#table = table;
        this.#read = read;

        this.#specs = ((specs) => {
            specs = specs ? specs : {};
            const max = specs.max ? specs.max : 30;
            return {max};
        })(specs)
    }

    #timer: number;

    /**
     * Push a new query request
     *
     * @param query{Query} The query to be batched
     * @returns {Promise<*>} The response of the query request
     */
    exec(query: TQuery): Promise<TQueryResponse> {
        this.#queue.push(query);
        this.#queries.set(query.id, query);
        clearTimeout(this.#timer);

        setTimeout(this.#execute, 0);
        return query.promise;
    }

    /**
     * Processes the pending queries
     */
    #execute = () => {
        if (!this.#queue.length) return; // No more queries in queue to be processed

        const queries = this.#queue.splice(0, this.#specs.max);

        const done = ({error, outputs}: { error?: string, outputs?: Map<number, TQueryResponse> }) => {
            for (const query of queries) {
                this.#queries.delete(query.id);
                error ? query.reject(new Error(error)) : query.resolve(<any>outputs.get(query.id));
            }
        }

        const result = this.#read({table: this.#table.name, queries});
        if (!(result instanceof Promise)) return done({error: `Queries response is not a promise`});

        result.then((outputs: TQueryResponse[]) => {
            if (!(outputs instanceof Array)) return done({error: `Queries outputs is not an array`});
            done({outputs: new Map(outputs.map(qr => [qr.request, qr]))});
        }).catch((error: Error) => {
            console.error(error.stack);
            done({error: `Error caught calling read method: ${error.message}`});
        }).finally(() => {
            // Continue read batch execution
            this.#execute();
        })
    }
}
