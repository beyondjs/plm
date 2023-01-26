import {RecordStoreStructure} from "./records";
import type {RecordData} from "../../data/records/data/record";
import type {Field} from "../../data/records/data/fields/field";
import {CompareObjects} from "../../data/factory/compare-objects";

export class MemoryLocalDBRecords extends Map<string, RecordStoreStructure> {
    generateKey = (pk: string | number): string => {
        return CompareObjects.generate(pk);
    }

    exists(pk: string | number): boolean {
        const key = this.generateKey(pk);
        return super.has(key);
    }

    load(record: RecordData): RecordStoreStructure {
        const pk: Field = record.pk;
        if (!pk.assigned) return;

        const key = this.generateKey(pk.value);
        if (!this.has(key)) return;

        return this.get(key);
    }

    save(pk: string | number, value: RecordStoreStructure) {
        const key = this.generateKey(pk);
        super.set(key, value);
    }

    remove(pk: string | number) {
        const key = this.generateKey(pk);
        super.delete(key);
    }
}
