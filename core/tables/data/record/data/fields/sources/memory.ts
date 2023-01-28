import type {Field} from '../field';
import {FieldSource} from './source';

export class MemoryFieldSource extends FieldSource {
    constructor(field: Field) {
        super(field, {modifiable: true});
    }
}
