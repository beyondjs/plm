import type {Table} from '../../table';
import type {RecordData, RecordIdentifier} from './data';
import type {WrappedRecord} from './wrapped/record';
import type {UnpublishedRecords} from './data/unpublished';
import {Events} from '@beyond-js/kernel/core';
import {RecordsDataFactory} from './data/factory';
import {WrappedFactory} from './wrapped/factory';
import {Realtime} from './realtime';

export class RecordsManager extends Events {
    readonly #recordsDataFactory: RecordsDataFactory
    get recordsDataFactory(): RecordsDataFactory {
        return this.#recordsDataFactory;
    }

    readonly #wrappedFactory: WrappedFactory;

    readonly #table: Table;
    get table() {
        return this.#table;
    }

    get unpublished(): UnpublishedRecords {
        return this.#recordsDataFactory.unpublished;
    }

    #realtime = new Realtime(this);
    get realtime() {
        return this.#realtime;
    }

    constructor(table: Table) {
        super();
        this.#table = table;
        this.#recordsDataFactory = new RecordsDataFactory(table);
        this.#wrappedFactory = new WrappedFactory(table, this.#recordsDataFactory);
        this.#recordsDataFactory.wrappedFactory = this.#wrappedFactory;
    }

    get(identifier: RecordIdentifier): WrappedRecord {
        return this.#wrappedFactory.get(identifier);
    }

    create(): RecordData {
        return this.#recordsDataFactory.create();
    }

    getUnpublished(localId: string): RecordData {
        return this.#recordsDataFactory.getUnpublished(localId);
    }
}
