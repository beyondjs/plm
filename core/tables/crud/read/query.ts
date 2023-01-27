import type {FilterSpecs} from "../../data/filter/filter";
import {PendingPromise} from '@beyond-js/kernel/core';

let incremental = 0;

export type PK = string | number;

export /*bundle*/
type TRecordResponse = {
    request: number;
    fields: Record<string, any>;
    found: boolean;
    version: number;
}

export /*bundle*/
type TListResponse = {
    request: number;
    records: {
        pk?: PK;
        version?: number;
        data?: Record<string, any>;
    }[]
}

export /*bundle*/
type TCounterResponse = {
    request: number;
    count: number;
}

export /*bundle*/ type TQueryResponse = TRecordResponse | TListResponse | TCounterResponse;

export type TCachedList = Record<PK, number>;

export class Query<TQueryResponse> {
    readonly #id;
    get id() {
        return this.#id;
    }

    readonly #promise: PendingPromise<TQueryResponse>;
    get promise() {
        return this.#promise;
    }

    resolve(response: TQueryResponse) {
        if (!response) {
            this.#promise.reject(new Error(`Query response not received`));
            return;
        }

        this.#promise.resolve(response);
    }

    reject(error: Error) {
        this.#promise.reject(error);
    }

    constructor(id?: number) {
        this.#id = id ? id : incremental++;
        this.#promise = id ? void 0 : new PendingPromise();
    }
}

type TFields = Record<string, any>;

export /*bundle*/
interface IRecordQuery {
    id: number;
    requiring: string;
    fields: Record<string, any>;
    version: number;
}

export class RecordQuery extends Query<TRecordResponse> implements IRecordQuery {
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

    resolve(response: TRecordResponse) {
        if (response && typeof response.fields !== 'object') {
            super.reject(new Error(`Invalid response received from query, fields is not an object`));
            return;
        }

        super.resolve(response);
    }

    toJSON() {
        const {requiring, id, fields, version} = this;
        return {requiring, id, fields, version};
    }
}


export /*bundle*/
interface IListQuery {
    id: number;
    requiring: string;
    filter: FilterSpecs;
    index?: string;
    cached?: TCachedList;
}

export class ListQuery extends Query<TListResponse> implements IListQuery {
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

    resolve(response: TListResponse) {
        if (response && !(response.records instanceof Array)) {
            super.reject(new Error(`Invalid response received from query, records is not an array`));
            return;
        }

        super.resolve(response);
    }

    toJSON() {
        const {requiring, id, filter, index, cached} = this;
        return {requiring, id, filter, index, cached};
    }
}


export /*bundle*/
interface ICounterQuery {
    id: number;
    requiring: string;
    filter: FilterSpecs;
    index?: string;
}

export class CounterQuery extends Query<TCounterResponse> implements ICounterQuery {
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

    resolve(response: TCounterResponse) {
        if (response && typeof response.count !== 'number') {
            super.reject(new Error(`Invalid response received from query, count is not a number`));
            return;
        }

        super.resolve(response);
    }

    toJSON() {
        const {requiring, id, filter, index} = this;
        return {requiring, id, filter, index};
    }
}

export /*bundle*/ type TQuery = RecordQuery | ListQuery | CounterQuery;
