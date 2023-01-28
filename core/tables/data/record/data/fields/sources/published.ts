import type {Field} from '../field';
import {FieldSource} from './source';

export class PublishedFieldSource extends FieldSource {
    constructor(field: Field) {
        super(field, {modifiable: false});
    }
}
