import type {FilterSpecs} from "../../data/filter/filter";
import {PendingPromise} from '@beyond-js/kernel/core';

let incremental = 0;

export type PK = string | number;

export /*bundle*/
type TRecordResponse = {
    request: number;
    fields: Record<string, any>;
    version: number;
}

export /*bundle*/
type TListResponse = {
    request: number;
    uptodate: boolean;
    pk?: PK;
    version?: number;
    data?: Record<string, any>;
}[]

export /*bundle*/
type TCounterResponse = {
    request: number;
    count: number;
}

export type TQueryResponse = TRecordResponse | TListResponse | TCounterResponse;

export type TCachedList = Record<PK, number>;

export class Query<TQueryResponse> {
    readonly #id;
    get id() {
        return `${this.#id}`;
    }

    readonly #promise: PendingPromise<TQueryResponse>;
    get promise() {
        return this.#promise;
    }

    resolve(response: TQueryResponse) {
        this.#promise.resolve(response);
    }

    constructor(id?: number) {
        this.#id = id ? id : incremental++;
        this.#promise = id ? void 0 : new PendingPromise();
    }
}

type TFields = Record<string, any>;

export class RecordQuery extends Query<TRecordResponse> {
    get requiring() {
        return 'record';
    }

    readonly #fields: Record<string, any>;
    get fields() {
        return this.#fields;
    }

    readonly #version: number;
    get version() {
        return this.#version;
    }

    constructor({id, fields, version}: { id?: number, fields: TFields, version: number }) {
        super(id);
        this.#fields = fields;
        this.#version = version;
    }

    toJSON() {
        const {id, fields, version} = this;
        return {id, fields, version};
    }
}

export class ListQuery extends Query<TListResponse> {
    get requiring() {
        return 'list';
    }

    readonly #filter: FilterSpecs;
    get filter() {
        return this.#filter;
    }

    readonly #index: string;
    get index() {
        return this.#index;
    }

    readonly #cached: TCachedList;
    get cached() {
        return this.#cached;
    }

    constructor({id, filter, index, cached}: { id?: number, filter: FilterSpecs, index: string, cached: TCachedList }) {
        super(id);
        this.#filter = filter;
        this.#index = index;
        this.#cached = cached;
    }

    toJSON() {
        const {id, filter, index, cached} = this;
        return {id, filter, index, cached};
    }
}

export class CounterQuery extends Query<TCounterResponse> {
    get requiring() {
        return 'count';
    }

    readonly #filter: FilterSpecs;
    get filter() {
        return this.#filter;
    }

    readonly #index: string;
    get index() {
        return this.#index;
    }

    constructor({id, filter, index}: { id?: number, filter: FilterSpecs, index: string }) {
        super(id);
        this.#filter = filter;
        this.#index = index;
    }

    toJSON() {
        const {id, filter, index} = this;
        return {id, filter, index};
    }
}

export /*bundle*/ type TQuery = RecordQuery | ListQuery | CounterQuery;
