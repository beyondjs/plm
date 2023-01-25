import {Item} from "../../item";
import {ItemNode} from "../../../../tree/item";
import {ItemPropertyIdentifier} from "./identifier";
import {CompareObjects} from "../../../../tables/data/factory/compare-objects";
import {RecordIdentifier} from "../../../../tables/data/records/data/record";
import {ItemProperty as TableItemProperty} from "../../../../tables/properties/types/item";
import type {Property} from "../property";
import {Tree} from "./tree";

export /*bundle*/
class ItemProperty implements Property {
    get is() {
        return 'item';
    }

    readonly #parentItem: Item

    readonly #node: ItemNode
    get node() {
        return this.#node
    }

    readonly tree: Tree = new Tree(this);

    #value: Item
    get value() {
        return this.#value
    }

    #lastIdentifier: RecordIdentifier

    readonly #identifier: ItemPropertyIdentifier
    get identifier(): ItemPropertyIdentifier {
        return this.#identifier;
    }

    constructor(parentItem: Item, node: ItemNode) {
        this.#parentItem = parentItem
        this.#node = node
        this.#identifier = new ItemPropertyIdentifier(parentItem, node)
    }

    update() {
        this.#identifier.update();
        if (!this.#identifier.valid) {
            this.#value?.destroy();
            this.#value = void 0;
            this.#lastIdentifier = void 0;
            return;
        }

        const identifier = this.#identifier.value;

        // Check if the identifier has changed
        if (this.#lastIdentifier && CompareObjects.compare(this.#lastIdentifier, identifier)) {
            //TODO: agregar comentario para caso de uso, en actualizacion de Item
            return this.#value;
        }
        this.#lastIdentifier = identifier;

        this.#value?.destroy();

        const tableProperty = <TableItemProperty>this.#node.property;
        this.#value = new tableProperty.Item({
            node: this.node,
            identifier: identifier
        });

        return this.#value;
    }

    load = async (tree = true) => await this.#value?.load(tree);
    fetch = async (tree = true) => await this.#value?.fetch(tree);
    fill = async (tree = true) => await this.#value?.fill(tree);
    destroy = () => this.#value?.destroy();
}
