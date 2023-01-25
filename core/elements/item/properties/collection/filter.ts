/**
 * The collection property filter generator
 */
import {Condition, ConditionOperand, FilterSpecs} from "../../../../tables/data/filter/filter";
import {
    CollectionProperty as TableCollectionProperty,
    FilterSpec as PropertyFilterSpec
} from "../../../../tables/properties/types/collection";
import {CollectionNode} from "../../../../tree/collection";
import {Item} from "../../item";

export class CollectionPropertyFilter {
    readonly #node: CollectionNode
    readonly #parentItem: Item

    #value: FilterSpecs
    get value() {
        return this.#value
    }

    #valid = false
    get valid() {
        return this.#valid
    }

    readonly #spec: PropertyFilterSpec

    /**
     * CollectionPropertyFilter Constructor
     *
     * @param {Item} item
     * @param {ItemNode} node
     */
    constructor(item: Item, node: CollectionNode) {
        this.#parentItem = item;
        this.#node = node;
        this.#spec = (<TableCollectionProperty>this.#node.property).filterSpec;
    }

    /**
     * Generates the identifier of the item to be created
     */
    update() {
        this.#valid = false;
        this.#value = undefined;

        const filter: Condition[] = [];

        for (const field of this.#spec) {
            if (field.hasOwnProperty('value')) {
                filter.push({field: field.field, value: field.value, operand: ConditionOperand.Equal});
                continue;
            }

            const source = field.source;

            if (!this.#parentItem.fields.has(source))
                throw new Error(`Filter of property "${this.#node.property.name}" is invalid. ` +
                    `Source "${source}" not found`);

            let parentItemField = this.#parentItem.fields.get(source);
            if (!parentItemField.assigned) return;

            let value = parentItemField.value;
            value = typeof field.transform === 'function' ?
                field.transform(this.#parentItem, value) : value;

            if (!value) return;

            filter.push({field: field.field, value: value, operand: ConditionOperand.Equal});
        }

        this.#valid = true;
        this.#value = filter;
    }
}
