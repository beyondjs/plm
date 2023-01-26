import {CounterData} from "./counter";
import {Factory} from "../factory/factory";
import type {FilterSpecs} from "../filter/filter";

export class CountersManager extends Factory<CounterData> {
    protected create(key: string, instanceId: number, filter: FilterSpecs): CounterData {
        return new CounterData(this, key, instanceId, filter);
    }

    get(filter: FilterSpecs): CounterData {
        return super.get(...arguments);
    }
}
