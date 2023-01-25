import {ListData} from "../../list";
import type {ListsManager} from "../manager";
import {RegistryByFilter} from "./filter";

export interface ListsRegistry {
    informListCreated: (list: ListData) => void
    informListDestroyed: (list: ListData) => void
}

export class Registries {
    readonly #manager: ListsManager;
    #registries: Map<string, ListsRegistry>;

    constructor(manager: ListsManager) {
        this.#manager = manager;
        this.#registries = new Map();
        this.#registries.set('filters', new RegistryByFilter());
    }

    get filters(): RegistryByFilter {
        return <RegistryByFilter>this.#registries.get('filters');
    }

    informListCreated(list: ListData) {
        this.#registries.forEach(registry => registry.informListCreated(list));
    }

    informListDestroyed(list: ListData) {
        this.#registries.forEach(registry => registry.informListDestroyed(list));
    }
}
