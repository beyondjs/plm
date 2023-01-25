import {Events} from "@beyond-js/kernel/core";
import {NodeSpecs} from "./specs";
import {Table} from "../tables/table";
import {tables} from "../tables/tables";
import {Property} from "../tables/properties/property";

export class Node extends Events {
    readonly #property: Property
    get property() {
        return this.#property
    }

    readonly #table: Table
    get table() {
        return this.#table
    }

    readonly #session: string | undefined
    get session() {
        return this.#session
    }

    readonly #root: Node;
    get root(): Node {
        return this.#root;
    }

    readonly #parent: Node
    get parent() {
        return this.#parent;
    }

    #active = true;
    get active(): boolean {
        return this.#parent ? this.#parent.active : this.#active;
    }

    set active(value: boolean) {
        if (this.#parent) {
            throw new Error('.active property can only be set to the root of the tree');
        }
        this.#active = value;
    }

    /**
     * The Node Constructor
     * @param {string} table The table name
     * @param {NodeSpecs} specs The node specification
     * @param {Node} parent The parent node in the tree
     * @param {Property} property The table property.
     * Undefined when the node is created from the item or the collection instead of being created by the tree
     */
    constructor(table: string, specs?: NodeSpecs, parent?: Node, property?: Property) {
        super();

        if (property && typeof property !== 'object') throw new Error('Invalid "property" parameter');
        this.#property = property;

        if (!table) throw new Error('Parameter "table" is required');
        if (!tables.has(table)) throw new Error(`Table "${table}" is not registered`);
        this.#table = tables.get(table);

        specs = specs ? specs : {};

        this.#session = specs.session ? specs.session : (parent ? parent.session : undefined);
        this.#parent = parent;
        this.#root = parent ? parent.root : this;
    }

    #timer: number;

    trigger(event: string, ...rest: any) {
        if (!this.#active) return;

        if (this.#parent) {
            event === 'change' && this.root.trigger(event, ...rest);
            return super.trigger(event, ...arguments); // async events return a promise
        } else {
            if (event !== 'change') return super.trigger(event, ...rest);
            if (this.#timer) return;

            this.#timer = window.setTimeout(() => {
                this.#timer = void 0;
                super.trigger(event, ...rest);
            }, 0);
        }
    }
}
