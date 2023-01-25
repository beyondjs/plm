import {Item} from "../item";
import {NotSet} from "../../../constants";

export class ItemField {
    #item: Item
    #name: string

    constructor(item: Item, name: string) {
        this.#item = item;
        this.#name = name;
    }

    get assigned(): boolean {
        return this.#item.record.fields.get(this.#name).assigned
    }

    get value(): any {
        const value = this.#item.record.fields.get(this.#name).value;
        return value === NotSet ? undefined : value;
    }

    set value(value: any) {
        this.#item.record.fields.get(this.#name).value = value;
        this.#item.node.trigger('change');
    }
}
