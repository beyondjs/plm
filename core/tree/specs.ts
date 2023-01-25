import type {ItemNodeSpecs} from "./item";
import type {ICollectionNodeSpecs} from "./collection";
import {ItemsNodeSpecs} from "./items";
import {ItemSelectorNodeSpecs} from "./item-selector";

export type NodesSpecs =
    Record<string, boolean | ItemNodeSpecs | ICollectionNodeSpecs | ItemsNodeSpecs | ItemSelectorNodeSpecs>

export interface NodeSpecs {
    session?: string
}
