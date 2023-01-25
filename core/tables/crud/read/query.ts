import {PendingPromise} from '@beyond-js/kernel/core';
import type {FilterSpecs} from "../data/filter/filter";

let incremental = 0;

type PK = string | number;

export /*bundle*/
type TRecordResponse = {
    request: number;
    fields: Record<string, any>;
}

export /*bundle*/
type TListResponse = {
    request: number;
    uptodate: boolean;
    pk?: PK;
    version?: number;
    data?: Record<string, any>;
}[]

export /*bundle*/ type TQueryResponse = TListResponse | TRecordResponse;

export class Query {
    readonly #id;
    get id() {
        return `${this.#id}`;
    }

    readonly #promise: PendingPromise<TQueryResponse>;
    get promise() {
        return this.#promise;
    }

    constructor(id?: number) {
        this.#id = id ? id : incremental++;
        this.#promise = id ? void 0 : new PendingPromise();
    }
}

type TFields = Record<string, any>;
type TAttributes = Record<string, any>;

export class RecordQuery extends Query {
    get requiring() {
        return 'record';
    }

    readonly #version: number;
    get version() {
        return this.#version;
    }

    readonly #fields: Record<string, any>;
    get fields() {
        return this.#fields;
    }

    readonly #attributes: Record<string, any>;
    get attributes() {
        return this.#attributes;
    }

    constructor({id, version, fields, attributes}:
                    { id?: number, version: number, fields: TFields, attributes: TAttributes }) {
        super(id);

        this.#version = version;
        this.#fields = fields;
        this.#attributes = attributes;
    }
}

export class ListQuery extends Query {
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

    readonly #attributes: TAttributes;
    get attributes() {
        return this.#attributes;
    }

    readonly #cached: Record<PK, number>;
    get cached() {
        return this.#cached;
    }

    constructor({id, filter, index, attributes, cached}: {
        id?: number, filter: FilterSpecs, index: string,
        attributes: TAttributes, cached: Record<PK, number>
    }) {
        super(id);

        this.#filter = filter;
        this.#index = index;
        this.#attributes = attributes;
        this.#cached = cached;
    }
}

export /*bundle*/ type TQuery = ListQuery | RecordQuery;
