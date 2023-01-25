import type {Item} from "../item";
import {ItemProperty} from "./item/property";
import {ItemsProperty} from "./items/property";
import {ItemSelectorProperty} from "./item-selector/property";
import {CollectionProperty} from "./collection/property";
import type {Property} from "./property";
import type {ItemNode} from "../../../tree/item";
import type {ItemsNode} from "../../../tree/items";
import type {CollectionNode} from "../../../tree/collection";
import type {ItemSelectorNode} from "../../../tree/item-selector";

export class Properties extends Map<string, Property> {
    constructor(item: Item) {
        super();

        const {properties} = item.node;
        for (const [name, node] of properties) {
            switch (node.is) {
                case 'item':
                    this.set(name, new ItemProperty(item, <ItemNode>node));
                    break;
                case 'item-selector':
                    this.set(name, new ItemSelectorProperty(item, <ItemSelectorNode>node));
                    break;
                case 'collection':
                    this.set(name, new CollectionProperty(item, <CollectionNode>node));
                    break;
                case 'items':
                    this.set(name, new ItemsProperty(item, <ItemsNode>node));
                    break;
                default:
                    console.warn(`node of type "${node.is}" is not currently supported`,
                        item, name, node);
            }
        }
    }

    async load(tree = true) {
        const promises: Promise<void>[] = [];
        this.forEach(property => {
            property.update();
            promises.push(property.load(tree));
        });
        await Promise.all(promises);
    }

    async fetch(tree = true) {
        const promises: Promise<void>[] = [];
        this.forEach(property => {
            property.update();
            promises.push(property.fetch(tree));
        });
        await Promise.all(promises);
    };

    async fill(tree = true) {
        const promises: Promise<void>[] = [];
        this.forEach(property => {
            property.update();
            promises.push(property.fill(tree));
        });
        await Promise.all(promises);
    };

    update = () => this.forEach(property => property.update());
}