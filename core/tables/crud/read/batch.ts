import type {CRUD} from "../../table";
import type {Query, TResponse} from "./query";

export class ReadBatch {
    readonly #crud: CRUD;
    readonly #specs: { max: number };
    readonly #queue: Query[] = [];
    readonly #queries: Map<string, Query> = new Map();

    get queueLength(): number {
        return this.#queue.length;
    }

    constructor(crud: CRUD, specs?: { max?: number }) {
        this.#crud = crud;
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
    exec(query: Query): Promise<TResponse> {
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
        const response = this.#crud.read(queries);
        if (!(response instanceof Promise)) throw new Error(`Response of action "${response}" is not a promise`);

        response.then((response: [string, TResponse][]) => {
            const responses: Map<string, TResponse> = new Map(response);

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
