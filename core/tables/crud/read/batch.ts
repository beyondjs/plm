import type {TReadFunction} from "./index";
import type {Query, TQueryResponse} from "./query";

export class ReadBatch {
    readonly #read: TReadFunction;
    readonly #specs: { max: number };
    readonly #queue: Query<TQueryResponse>[] = [];
    readonly #queries: Map<string, Query<TQueryResponse>> = new Map();

    get queueLength(): number {
        return this.#queue.length;
    }

    constructor(read: TReadFunction, specs?: { max?: number }) {
        this.#read = read;
        const max = specs.max ? specs.max : 30;
        this.#specs = {max};
    }

    #timer: number;

    /**
     * Push a new query request
     *
     * @param query{Query} The query to be batched
     * @returns {Promise<*>} The response of the query request
     */
    exec(query: Query<TQueryResponse>): Promise<TQueryResponse> {
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
        const response = this.#read(queries);
        if (!(response instanceof Promise)) throw new Error(`Response of action "${response}" is not a promise`);

        response.then((response: [string, TQueryResponse][]) => {
            const responses: Map<string, TQueryResponse> = new Map(response);

            for (const rq of queries) {
                this.#queries.delete(rq.id);
                rq.promise.resolve(responses.get(rq.id));
            }
        }).catch((error: Error) => {
            for (const rq of queries) {
                this.#queries.delete(rq.id);
                rq.promise.reject(error);
            }
        }).finally(() => {
            this.#execute();
        })
    }
}
