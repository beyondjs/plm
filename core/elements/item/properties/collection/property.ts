import {Item} from "../../item";
import {Collection} from "../../../collection/collection";
import {FilterSpecs} from "../../../../tables/data/filter/filter";
import {CollectionPropertyFilter} from "./filter";
import {CompareObjects} from "../../../../tables/data/factory/compare-objects";
import {CollectionProperty as TableCollectionProperty} from "../../../../tables/properties/types/collection";
import {CollectionNode} from "../../../../tree/collection";
import type {Property} from "../property";
import {Tree} from "./tree";

export /*bundle*/
class CollectionProperty implements Property {
    get is() {
        return 'collection';
    }

    readonly #parentItem: Item;

    readonly #node: CollectionNode;
    get node() {
        return this.#node;
    }

    readonly tree: Tree = new Tree(this);

    #value: Collection;
    get value() {
        return this.#value;
    }

    #lastFilter: FilterSpecs;
    readonly #filter: CollectionPropertyFilter;
    get filter(): CollectionPropertyFilter {
        return this.#filter;
    }

    constructor(parentItem: Item, node: CollectionNode) {
        this.#parentItem = parentItem;
        this.#node = node;
        this.#filter = new CollectionPropertyFilter(parentItem, node);
    }

    update(): Collection {
        this.#filter.update();
        if (!this.#filter.valid) {
            this.#value?.destroy();
            this.#value = void 0;
            this.#lastFilter = void 0;
            return;
        }

        const filter = this.#filter.value;

        // Check if the identifier has changed
        if (this.#lastFilter && CompareObjects.compare(this.#lastFilter, filter)) {
            return this.#value;
        }
        this.#lastFilter = filter;

        this.#value?.destroy();

        const tableProperty = <TableCollectionProperty>this.#node.property;
        this.#value = new tableProperty.Collection({
            node: this.node,
            filter: filter
        });

        return this.#value;
    }

    load = async (tree = true) => await this.#value?.load(tree);
    fetch = async (tree = true) => await this.#value?.fetch(tree);
    fill = async (tree = true) => await this.#value?.fill(tree);
    destroy = () => this.#value?.destroy();
}
