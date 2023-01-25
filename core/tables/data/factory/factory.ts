import {Events} from "@beyond-js/kernel/core";
import {Table} from "../../table";
import {CompareObjects} from "./compare-objects";
import {Product} from "./product";

export abstract class Factory<PRODUCT extends Product> extends Events {
    readonly #table: Table
    get table() {
        return this.#table
    }

    constructor(table: Table) {
        super();
        this.#table = table;
    }

    #instanceId = 0

    readonly #keys: Map<string, number> = new Map();
    readonly #instances: Map<number, PRODUCT> = new Map()

    has(...any: any[]) {
        return this.#keys.has(CompareObjects.generate(...arguments))
    }

    // The count of consumers that are holding a product
    // Used destroy a product only when there are no consumers using it
    // The key of the map is the product instanceId
    readonly #counters: Map<number, number> = new Map()

    protected abstract create(...any: any[]): PRODUCT

    get(...any: any[]): PRODUCT {
        const key = CompareObjects.generate(...arguments);
        const instanceId = this.#keys.has(key) ? this.#keys.get(key) : this.#instanceId++;

        this.hold(instanceId);

        if (this.#instances.has(instanceId)) return this.#instances.get(instanceId);

        const product = this.create(key, instanceId, ...arguments);
        this.#keys.set(key, instanceId);
        this.#instances.set(instanceId, product);

        return product;
    }

    hold(instanceId: number) {
        let count = this.#counters.has(instanceId) ? this.#counters.get(instanceId) + 1 : 1
        this.#counters.set(instanceId, count);
    }

    /**
     * Release a product from being consumed. Many consumers can hold the same product, so only destroy it
     * when no consumers are holding it
     *
     * @param {number} instanceId The instance id of the product
     * @returns {Product} Returns the product only if it has been destroyed
     */
    release(instanceId: number): Product {
        if (!this.#counters.has(instanceId)) {
            throw new Error(`Instance id "${instanceId}" is not registered`);
        }

        const count: number = this.#counters.get(instanceId) - 1;
        if (count) {
            this.#counters.set(instanceId, count);
            return;
        }

        const product = this.#instances.get(instanceId);
        this.#keys.delete(product.key);
        this.#instances.delete(instanceId);
        this.#counters.delete(instanceId);
        product.destroy();

        return product;
    }
}
