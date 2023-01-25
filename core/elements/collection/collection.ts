import {Element, ElementSpecs} from "../element"
import {ICollectionNodeSpecs, CollectionNode} from "../../tree/collection";
import type {ListData} from "../../tables/data/lists/list";
import {CollectionCounters} from "./counters/counters";
import {CollectionItems} from "./items/items";
import {Item, DerivedItem} from "../item/item";
import type {FilterSpecs} from "../../tables/data/filter/filter";
import {Tree} from "./tree";

export /*bundle*/
interface CollectionSpecs extends ElementSpecs {
    node?: CollectionNode
    tree?: ICollectionNodeSpecs
    filter?: FilterSpecs
}

export interface DerivedCollection {
    new(specs: CollectionSpecs): Collection;
}

export /*bundle*/
class Collection extends Element<CollectionNode> {
    get is() {
        return 'collection'
    }

    readonly #Item: DerivedItem
    get Item(): DerivedItem {
        return this.#Item
    }

    readonly #list: ListData
    get list() {
        return this.#list
    }

    readonly #counters: CollectionCounters = new CollectionCounters(this)
    get counters() {
        return this.#counters
    }

    readonly #items = new CollectionItems(this)
    get items(): Item[] {
        return this.#items.items
    }

    readonly #tree = new Tree(this);
    get tree() {
        return this.#tree;
    }

    /**
     * Loads the collection bringing the data from the local store cache
     *
     * @returns {Promise<void>}
     */
    async load(tree = true) {
        await this.#list.load();
        if (!this.loaded || !tree) return;

        const promises: Promise<void>[] = [];
        promises.push(this.#items.load(tree));
        promises.push(this.#counters.load());

        await Promise.all(promises);
    }

    /**
     * Fetch the collection bringing the data from the server
     *
     * @param {boolean} tree Fetches the tree or only the current node
     * @returns {Promise<void>}
     */
    async fetch(tree: boolean = true) {
        await this.#list.fetch();
        if (!tree || !this.landed) return;

        const promises: Promise<void>[] = [];
        promises.push(this.#items.fetch(tree));
        promises.push(this.#counters.fetch());

        await Promise.all(promises);
    }

    /**
     * Loads or fetch data only if not data is already available
     *
     * @param {boolean} tree Fills the tree or only the current node
     * @returns {Promise<void>}
     */
    async fill(tree: boolean = true) {
        if (!this.landed) {
            await this.load(false);
            !this.landed && await this.fetch(false);
        }

        if (!tree || this.tree.landed) return;

        // Continue with tree loading
        const promises: Promise<void>[] = [];
        promises.push(this.#items.fill(tree));
        promises.push(this.#counters.fill());

        await Promise.all(promises);
    }

    constructor(table: string, DItem: DerivedItem, specs: CollectionSpecs) {
        super(table);

        if (!table || typeof table !== 'string') throw new Error('Parameter table is invalid');
        if (!(DItem.prototype instanceof Item)) throw new Error('Parameter item is invalid');

        this.#Item = DItem;

        specs = specs ? specs : {};
        super.node = specs.node ? specs.node : new CollectionNode(table, specs.tree);

        // Gets the list data access
        const attributes = {};
        this.#list = this.table.lists.get(specs.filter, this.node.order, attributes, specs.session);
        super.data = this.#list;

        this.#items.activate();
    }

    destroy() {
        super.destroy();

        // The list is not longer being used by this item
        this.#list.release();
        this.#items.destroy();
    }
}
