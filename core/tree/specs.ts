import type {ItemNodeSpecs} from './item';
import type {ICollectionNodeSpecs} from './collection';
import type {ItemsNodeSpecs} from './items';
import type {ItemSelectorNodeSpecs} from './item-selector';

export type NodesSpecs =
    Record<string, boolean | ItemNodeSpecs | ICollectionNodeSpecs | ItemsNodeSpecs | ItemSelectorNodeSpecs>
