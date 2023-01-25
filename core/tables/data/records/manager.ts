import {Events} from "@beyond-js/kernel/core";
import type {Table} from "../../table";
import {RecordsDataFactory} from "./data/factory";
import type {RecordData} from "./data/record";
import type {RecordIdentifier} from "./data/record";
import {WrappedFactory} from "./wrapped/factory";
import type {WrappedRecord} from "./wrapped/record";
import {UnpublishedRecords} from "./data/unpublished";
import {Realtime} from "./realtime/realtime";

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

    get(identifier: RecordIdentifier, session: string): WrappedRecord {
        return this.#wrappedFactory.get(identifier, session);
    }

    create(session: string): RecordData {
        return this.#recordsDataFactory.create(session);
    }

    getUnpublished(localId: string): RecordData {
        return this.#recordsDataFactory.getUnpublished(localId);
    }
}
