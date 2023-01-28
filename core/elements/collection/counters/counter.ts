import type {Collection} from '../';
import type {CounterData} from '../../../tables/data/counter';
import type {FilterSpecs} from '../../../tables/data/filter';
import {Filter} from '../../../tables/data/filter';

export class CollectionCounter {
    readonly #collection: Collection
    readonly #name: String;
    readonly #counter: CounterData;

    get value(): CounterData {
        return this.#counter;
    }

    constructor(collection: Collection, name: string, conditions: FilterSpecs) {
        this.#collection = collection;
        this.#name = name;

        const {table} = collection;
        conditions = conditions ? conditions.concat(collection.list.filter.specs) : collection.list.filter.specs;

        const filter = new Filter(table, conditions);
        this.#counter = table.counters.get(filter.specs);
    }

    load = async () => await this.#counter.load();
    fetch = async () => await this.#counter.fetch();

    #timer: ReturnType<typeof setTimeout>;

    #triggerChange = () => {
        if (this.#timer) return;

        this.#timer = setTimeout(() => {
            this.#timer = void 0;
            this.#collection.node.trigger('change');
        }, 0);
    }

    activate() {
        this.#counter.on('change', this.#triggerChange);
    }

    deactivate() {
        this.#counter.off('change', this.#triggerChange);
    }
}
