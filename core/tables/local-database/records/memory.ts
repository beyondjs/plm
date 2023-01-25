import {RecordStoreStructure} from "./records";
import type {RecordData} from "../../data/records/data/record";
import type {Field} from "../../data/records/data/fields/field";
import {CompareObjects} from "../../data/factory/compare-objects";

export class MemoryLocalDBRecords extends Map<string, RecordStoreStructure> {
    generateKey = (pk: string | number, accessToken?: string): string => {
        return CompareObjects.generate(pk, accessToken);
    };

    exists(pk: string | number, accessToken: string): boolean {
        const key = this.generateKey(pk, accessToken);
        return super.has(key);
    }

    load(record: RecordData, accessToken?: string): RecordStoreStructure {
        const pk: Field = record.pk;
        if (!pk.assigned) return;

        const key = this.generateKey(pk.value, accessToken);
        if (!this.has(key)) return;

        return this.get(key);
    }

    save(pk: string | number, accessToken: string, value: RecordStoreStructure) {
        const key = this.generateKey(pk, accessToken);
        super.set(key, value);
    }

    remove(pk: string | number, accessToken: string) {
        const key = this.generateKey(pk, accessToken);
        super.delete(key);
    }
}
