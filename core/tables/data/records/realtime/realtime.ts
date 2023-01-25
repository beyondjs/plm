import type {RecordsManager} from "../manager";
import {Reports} from "./reports";

export class Realtime {
    readonly #reports: Reports;
    get reports() {
        return this.#reports;
    }

    constructor(manager: RecordsManager) {
        this.#reports = new Reports(manager);
    }
}

