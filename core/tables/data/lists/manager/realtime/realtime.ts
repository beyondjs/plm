import type {ListsManager} from "../manager";
import {Reports} from "./reports";

export class Realtime {
    readonly #reports: Reports;
    get reports() {
        return this.#reports;
    }

    constructor(manager: ListsManager) {
        this.#reports = new Reports(manager);
    }
}

