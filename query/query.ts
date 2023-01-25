import type {QueryRequest} from "@beyond-js/plm/core";

export /*bundle*/
class Query {
    #request: QueryRequest;

    constructor(request: QueryRequest) {
        this.#request = request;
    }
}
