import type {FilterSpecs} from '../filter';
import {CounterData} from './';
import {Factory} from '../factory';

export class CountersManager extends Factory<CounterData> {
    protected create(key: string, instanceId: number, filter: FilterSpecs): CounterData {
        return new CounterData(this, key, instanceId, filter);
    }

    get(filter: FilterSpecs): CounterData {
        return super.get(...arguments);
    }
}
