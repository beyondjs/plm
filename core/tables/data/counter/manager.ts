import {CounterAttributes, CounterData} from "./counter";
import {Factory} from "../factory/factory";
import type {FilterSpecs} from "../filter/filter";

export class CountersManager extends Factory<CounterData> {
    protected create(key: string, instanceId: number, filter: FilterSpecs,
                     attributes: CounterAttributes, session: string): CounterData {
        return new CounterData(this, key, instanceId, filter, attributes, session);
    }

    get(filter: FilterSpecs, attributes: CounterAttributes, session: string): CounterData {
        return super.get(...arguments);
    }
}
