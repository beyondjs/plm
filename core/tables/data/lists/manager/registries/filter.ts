// Keeps a registry (grouping by filter) of the lists that were created
import {ListData} from "../../list";
import type {ListsRegistry} from "./registries";
import {CompareObjects} from "../../../factory/compare-objects";
import {Filter} from "../../../filter/filter";

interface ListsByFilter {
    filter: Filter,
    lists: ListData[]
}

export class RegistryByFilter extends Map<string, ListsByFilter> implements ListsRegistry {
    informListCreated(list: ListData) {
        const key = CompareObjects.generate(list.filter.specs);
        const registry: ListsByFilter = this.has(key) ?
            this.get(key) :
            {filter: list.filter, lists: []};

        registry.lists.push(list);
        this.set(key, registry);
    }

    informListDestroyed(list: ListData) {
        const key = CompareObjects.generate(list.filter.specs);
        if (!this.has(key)) {
            console.error('List filter is not in the registry of filters', list);
            return;
        }

        const registry = this.get(key);
        if (!registry.lists.includes(list)) {
            console.error('List filter is not in the registry of filters', list);
            return;
        }

        registry.lists.slice(registry.lists.indexOf(list), 1);
    }
}
