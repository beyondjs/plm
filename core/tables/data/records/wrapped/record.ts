import {Product} from "../../factory/product";
import {RecordData, RecordIdentifier} from "../data/record";
import {WrappedFactory} from "./factory";
import {WrappedRecordFields} from "./fields/fields";

/**
 * The WrappedRecord class exists because the same record can be identified by different identifiers (identifiers).
 * For example, a user with pk=1 and username=henry can be retrieved by either of those two fields,
 * since pk is a primary key and username is a unique field. Therefore,
 * if there is an instance of an item with identifier {pk: 1} and another with {username: 'henry'} prior to any fetching,
 * after fetching there must be a way to identify that both items should interface with the same record.
 * The WrappedRecord is responsible for achieving that interface.
 */
export class WrappedRecord extends Product {
    readonly #identifier: RecordIdentifier;
    get identifier(): RecordIdentifier {
        return this.#identifier;
    }

    readonly #session: string;
    get session(): string {
        return this.#session;
    }

    #destroyed = false;
    get destroyed() {
        return this.#destroyed;
    }

    #record: RecordData;
    get record() {
        return this.#record;
    }

    get version(): number {
        return this.#record.version;
    }

    readonly #fields: WrappedRecordFields;
    get fields() {
        return this.#fields;
    }

    get loaded(): boolean {
        return this.#record.loaded;
    }

    get fetched(): boolean {
        return this.#record.fetched;
    }

    get fetching(): boolean {
        return this.#record.fetching;
    }

    get publishing(): boolean {
        return this.#record.publishing;
    }

    get deleting(): boolean {
        return this.#record.deleting;
    }

    get deleted(): boolean {
        return this.#record.deleted;
    }

    get found(): boolean {
        return this.#record.found;
    }

    load = () => this.#record.load();
    fetch = () => this.#record.fetch();

    #triggerChange = () => this.trigger('change');
    #triggerUpdated = () => this.trigger('updated');
    #triggerInvalidated = () => this.trigger('invalidated');

    #bind = () => {
        this.#record.on('change', this.#triggerChange);
        this.#record.on('updated', this.#triggerUpdated);
        this.#record.on('invalidated', this.#triggerInvalidated);
    };

    #unbind = () => {
        if (!this.#record) return;
        this.#record.off('change', this.#triggerChange);
        this.#record.off('updated', this.#triggerUpdated);
        this.#record.off('invalidated', this.#triggerInvalidated);
    };

    #update = (record: RecordData) => {
        this.#unbind();
        this.#record = record;
        this.#bind();
        this.trigger('change');
    }

    constructor(manager: WrappedFactory,
                key: string, instanceId: number,
                identifier: RecordIdentifier, session: string) {
        super(manager, key, instanceId, session);

        this.#identifier = identifier;
        this.#session = session;

        const {recordsDataFactory} = manager;
        recordsDataFactory.on(`identifier.${key}.record.changed`, this.#update);

        const record = recordsDataFactory.get(identifier, session);
        this.#update(record);

        this.#fields = new WrappedRecordFields(this);
    }

    async publish() {
        await this.#record.publish();
    }

    async delete() {
        await this.#record.delete();
    }

    destroy() {
        if (this.#destroyed) {
            throw new Error('FactorizedRecord already destroyed');
        }

        this.#destroyed = true;
        const {recordsDataFactory} = <WrappedFactory>this.manager;
        recordsDataFactory.off('change', this.#update);
        super.destroy();

        this.#record.manager.release(this.#identifier, this.#session);
    }
}
