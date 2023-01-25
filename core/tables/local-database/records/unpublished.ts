import type {LocalDB} from "../local-database";
import {PendingPromise} from "@beyond-js/kernel/core";

type RecordsValues = Record<string, any>

export type UnpublishedRecordStoreStructure = {
    data: RecordsValues
}

export class LocalDBUnpublished {
    #db: LocalDB

    constructor(db: LocalDB) {
        this.#db = db
    }

    #save = (localId: string, data: UnpublishedRecordStoreStructure): Promise<boolean> => {
        if (!localId || !data) throw new Error('Invalid parameters');

        const promise: PendingPromise<boolean> = new PendingPromise;
        const transaction = this.#db.db.transaction(['unpublished'], 'readwrite');

        const store = transaction.objectStore('unpublished');

        const rq = store.put(data);
        rq.onerror = (event: any) => promise.reject(event.target.result);
        rq.onsuccess = () => promise.resolve();
        return promise;
    }

    async save(localId: string, data: UnpublishedRecordStoreStructure): Promise<boolean> {
        await this.#db.prepare();
        return await this.#save(localId, data);
    }

    #load = (localId: string): Promise<UnpublishedRecordStoreStructure> => {
        const promise: PendingPromise<UnpublishedRecordStoreStructure> = new PendingPromise;
        const transaction = this.#db.db.transaction(['unpublished'], 'readonly');
        const store = transaction.objectStore('unpublished');

        let rq = store.get(localId);
        rq.onerror = (event: any) => {
            promise.reject(event.target.result);
        };
        rq.onsuccess = (event: any) => {
            const output = event.target.result;
            output && delete output.key;
            promise.resolve(output);
        };
        return promise;
    }

    async load(localId: string): Promise<UnpublishedRecordStoreStructure> {
        await this.#db.prepare();
        return await this.#load(localId);
    }
}
