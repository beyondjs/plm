import type {Item} from "../item";
import {ItemField} from "./field";

export class ItemFields extends Map<string, ItemField> {
    constructor(item: Item) {
        super();

        const {fields} = item.table;
        for (const name of fields) {
            this.set(name, new ItemField(item, name));
        }
    }
}
