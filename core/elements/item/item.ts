import {Element} from "../element"
import {ItemNodeSpecs, ItemNode} from "../../tree/item";
import {RecordIdentifier} from "../../tables/data/records/data/record";
import {Properties} from "./properties/properties";
import {WrappedRecord} from "../../tables/data/records/wrapped/record";
import {ItemFields} from "./fields/fields";
import {Tree} from "./tree";

export /*bundle*/
interface ItemSpecs {
    // When the element is the root of a tree being created by the consumer
    tree?: ItemNodeSpecs
    // Passed internally by PLM, when the element is a node of a tree
    node?: ItemNode
    // The record identifier
    identifier?: RecordIdentifier
    // The primary key field value (only when record is persisted)
    pk?: (string | number)
    // The local id when the record is in the unpublished records store
    localId?: string
}

export interface DerivedItem {
    new(specs: ItemSpecs): Item;
}

export /*bundle*/
class Item extends Element<ItemNode> {
    get is() {
        return 'item'
    }

    readonly #record: WrappedRecord
    get record() {
        return this.#record
    }

    get version(): number {
        return this.#record.version;
    }

    readonly #fields: ItemFields
    get fields() {
        return this.#fields;
    }

    readonly #properties: Properties
    get properties() {
        return this.#properties;
    }

    get loaded(): boolean {
        return this.#record.loaded;
    }

    get fetched(): boolean {
        return this.#record.fetched;
    }

    get fetching(): boolean {
        return this.#record.fetching;
    }

    get publishing(): boolean {
        return this.#record.publishing;
    }

    get deleting(): boolean {
        return this.#record.deleting;
    }

    get deleted(): boolean {
        return this.#record.deleted;
    }

    get found(): boolean {
        return this.#record.found
    }

    readonly #tree: Tree = new Tree(this);
    get tree() {
        return this.#tree;
    }

    /**
     * Loads the item bringing the data from the local store cache
     *
     * @returns {Promise<void>}
     */
    async load(tree: boolean = true) {
        await this.#record.load();
        if (!this.loaded) return;

        this.#properties.update();
        if (!tree || this.tree.landed) return;

        await this.#properties.load(tree);
    }

    /**
     * Fetch the item bringing the data from the server
     *
     * @param {boolean} tree Fetches the tree or only the current node
     * @returns {Promise<void>}
     */
    async fetch(tree: boolean = true) {
        await this.#record.fetch();

        this.#properties.update();
        if (!tree || this.tree.landed) return;

        await this.#properties.fetch(tree);
    }

    async publish() {
        this.#record.publish();
    }

    async delete() {
        this.#record.delete();
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

        this.#properties.update();
        if (!tree || this.tree.landed) return;

        // Continue with tree loading
        await this.#properties.fill(tree);
    }

    constructor(table: string, specs: ItemSpecs) {
        super(table);

        if (!table || typeof table !== 'string') throw new Error('Parameter table is invalid');

        specs = specs ? specs : {};
        super.node = specs.node ? specs.node : new ItemNode(table, specs.tree);

        // Get the record data access
        let identifier: RecordIdentifier;
        if (specs.identifier) {
            identifier = specs.identifier;
        } else if (specs.localId) {
            identifier = {localId: specs.localId};
        } else if (specs.pk) {
            const pk = this.table.indices.primary.fields[0];
            identifier = {};
            identifier[pk] = specs.pk;
        }

        this.#record = this.table.records.get(identifier);
        super.data = this.#record;

        this.#fields = new ItemFields(this);
        this.#properties = new Properties(this);

        this.#record.on('updated', () => this.#properties.update());
        this.#record.landed && this.properties.update();
    }

    destroy() {
        // The record is not longer being used by this item
        this.#record.off('updated', this.#properties.update);
        super.destroy();
        this.#record.release();
    }
}
