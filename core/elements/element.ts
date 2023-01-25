import type {Table} from "../tables/table";
import {tables} from "../tables/tables";
import {Node} from "../tree/node";
import {ListenerFunction} from "@beyond-js/kernel/core";
import {Product} from "../tables/data/factory/product";
import {Realtime} from "./realtime";

export interface ElementSpecs {
    session?: string
}

export interface Element<NODE extends Node> {
    is: string

    load(tree?: boolean): Promise<void>

    fetch(tree?: boolean): Promise<void>

    fill(tree?: boolean): Promise<void>
}

export abstract class Element<NODE extends Node> {
    on = (event: string, listener: ListenerFunction, priority?: number) => this.#node.on(event, listener, priority);
    bind = (event: string, listener: ListenerFunction, priority?: number) => this.#node.on(event, listener, priority);
    off = (event: string, listener: ListenerFunction) => this.#node.off(event, listener);
    unbind = (event: string, listener: ListenerFunction) => this.#node.off(event, listener);

    #realtime: Realtime;

    #node: NODE;
    get node() {
        return this.#node;
    }

    set node(value: NODE) {
        if (this.#node) throw new Error('Property "node" already set');
        this.#node = value;
    }

    get active(): boolean {
        return this.node.active;
    }

    set active(value: boolean) {
        this.node.active = value;
    }

    #timer: ReturnType<typeof setTimeout>;

    #triggerChange = () => {
        if (this.#timer) return;

        this.#timer = setTimeout(() => {
            this.#timer = void 0;
            this.#node.trigger('change');
        }, 0);
    }

    #data: Product;
    get data(): Product {
        return this.#data;
    }

    set data(value: Product) {
        if (this.#data) throw new Error('Property "data" already set');
        this.#data = value;
        this.#data.on('change', this.#triggerChange);

        this.#realtime = new Realtime(this);
    }

    get session(): string {
        return this.#node.session;
    }

    readonly #table: Table;
    get table(): Table {
        return this.#table;
    }

    get loaded(): boolean {
        return this.#data.loaded;
    }

    get fetching(): boolean {
        return this.#data.fetching;
    }

    get fetched(): boolean {
        return this.#data.fetched;
    }

    get landed(): boolean {
        return this.#data.landed;
    }

    async restore() {
        await this.fetch(false);
        await this.fill();
    }

    protected constructor(table: string) {
        if (!table || typeof table !== 'string') throw new Error('Parameter table is invalid');
        if (!tables.has(table)) throw new Error(`Table "${table}" is not registered`);
        this.#table = tables.get(table);
    }

    destroy() {
        this.#data?.off('change', this.#triggerChange);
        this.#realtime.destroy();
    }
}