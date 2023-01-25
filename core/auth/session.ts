import {Events} from "@beyond-js/kernel/core";

export class PLMSession extends Events {
    readonly #name: string;
    get name() {
        return this.#name;
    }

    constructor(name: string) {
        super();
        this.#name = name;
    }

    #accessToken: string;
    get accessToken() {
        return this.#accessToken;
    }

    set accessToken(value) {
        this.#accessToken = value;
        this.trigger('change');
    }
}
