/**
 * The item property identifier generator
 */
import type {ItemNode} from "../../../../tree/item";
import type {Item} from "../../item";
import {IdentifierSpec, ItemProperty as TableItemProperty} from "../../../../tables/properties/types/item";
import {RecordIdentifier} from "../../../../tables/data/records/data/record";

export class ItemPropertyIdentifier {
    readonly #node: ItemNode
    readonly #parentItem: Item

    #value: RecordIdentifier
    get value() {
        return this.#value
    }

    #valid = false
    get valid() {
        return this.#valid
    }

    readonly #spec: IdentifierSpec

    /**
     * ItemPropertyIdentifier Constructor
     *
     * @param {Item} item
     * @param {ItemNode} node
     */
    constructor(item: Item, node: ItemNode) {
        this.#parentItem = item;
        this.#node = node;
        this.#spec = (<TableItemProperty>this.#node.property).identifierSpec;
    }

    /**
     * Generates the identifier of the item to be created
     */
    update() {
        this.#valid = false;
        this.#value = undefined;

        const identifier: RecordIdentifier = {};

        for (const field of this.#spec) {
            if (field.hasOwnProperty('value')) {
                identifier[field.field] = field.value;
                continue;
            }

            const source = field.source;

            if (!this.#parentItem.fields.has(source))
                throw new Error(`Identifier of property "${this.#node.property.name}" is invalid. ` +
                    `Source "${source}" not found`);

            let parentItemField = this.#parentItem.fields.get(source);
            if (!parentItemField.assigned) return;

            let value = parentItemField.value;
            value = typeof field.transform === 'function' ?
                field.transform(this.#parentItem, value) : value;

            if (!value) return;

            identifier[field.field] = value;
        }

        this.#valid = true;
        this.#value = identifier;
    }
}
