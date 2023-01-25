/**
 * Nodes of the tree that represent the properties of the item and item-selector
 */
import type {NodesSpecs} from "./specs";
import type {Table} from "../tables/table";
import type {Property} from "../tables/properties/property";
import type {Node} from "./node"
import type {ItemNode, ItemNodeSpecs} from "./item";
import type {CollectionNode} from "./collection";
import type {ItemsNode, ItemsNodeSpecs} from "./items";
import type {ItemProperty} from "../tables/properties/types/item";
import type {CollectionProperty} from "../tables/properties/types/collection";
import type {ItemSelectorProperty} from "../tables/properties/types/item-selector";
import type {ItemsProperty} from "../tables/properties/types/items";
import type {ItemSelectorNode, ItemSelectorNodeSpecs} from "./item-selector";

declare function require(module: string): any;

type NodeTypes = ItemSelectorNode | ItemNode | CollectionNode | ItemsNode;

export class Properties extends Map<string, NodeTypes> {
    #table: Table

    constructor(table: Table) {
        super();
        this.#table = table;
    }

    register(properties: NodesSpecs, parent: Node) {
        if (!properties) return;

        for (let [name, specs] of Object.entries(properties)) {
            if (!this.#table.properties.has(name)) {
                console.warn(`Property "${name}" of table "${this.#table.name}" is not registered`);
                continue;
            }

            if (typeof specs === 'boolean' && !specs) continue;
            specs = typeof specs === 'boolean' ? {} : specs;

            const property: Property = this.#table.properties.get(name);

            let table;
            switch (property.type) {
                case 'item-selector':
                    const CItemSelectorNode = <typeof ItemSelectorNode>(require('./item-selector')).ItemSelectorNode;
                    this.set(name, new CItemSelectorNode(this.#table.name, <ItemSelectorNodeSpecs>specs, parent, <ItemSelectorProperty>property));
                    break;
                case 'item':
                    table = (<ItemProperty>property).table;
                    const CItemNode = <typeof ItemNode>(require('./item')).ItemNode;
                    this.set(name, new CItemNode(table, <ItemNodeSpecs>specs, parent, <ItemProperty>property));
                    break;
                case 'collection':
                    table = (<CollectionProperty>property).table;
                    const CCollectionNode = <typeof CollectionNode>(require('./collection')).CollectionNode;
                    this.set(name, new CCollectionNode(table, <ItemNodeSpecs>specs, parent, property));
                    break;
                case 'items':
                    table = (<ItemsProperty>property).table;
                    const CItemsNode = <typeof ItemsNode>(require('./items')).ItemsNode;
                    this.set(name, new CItemsNode(table, <ItemsNodeSpecs>specs, parent, <ItemsProperty>property));
                    break;
                default:
                    throw new Error(`Property "${name}" has an invalid type "${property.type}"`)
            }
        }
    }
}
