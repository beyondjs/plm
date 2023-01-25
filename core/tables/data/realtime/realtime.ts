import {Reports} from "./reports/reports";

export /*bundle*/
const realtime = new class {
    #reports = new Reports();
    get reports() {
        return this.#reports;
    }
}
