import type {ListData} from '.';
import type {IdsList} from '../../local-database/lists';

export class ListLocalStore {
    readonly #list: ListData

    #loaded = false;
    get loaded(): boolean {
        return this.#loaded;
    }

    #accessed = false;

    async load(): Promise<IdsList> {
        const {table, filter} = this.#list;
        const stored = await table.localDB.lists.load(filter.specs);
        this.#accessed = true;
        this.#loaded = !!stored;
        return stored?.data;
    }

    constructor(list: ListData) {
        this.#list = list;
    }
}