import type {RecordData} from '../../data/record/data';
import type {Field} from '../../data/record/data/fields/field';
import type {RecordStoreStructure} from './';
import {CompareObjects} from '../../data/factory/compare-objects';

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
