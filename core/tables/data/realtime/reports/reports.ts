import {RecordReport} from "./record";
import {ListReport} from "./list";

export class Reports {
    #list = new ListReport();
    get list() {
        return this.#list;
    }

    #record = new RecordReport();
    get record() {
        return this.#record;
    }
}
