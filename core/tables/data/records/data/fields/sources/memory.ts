import {FieldSource} from "./source";
import {Field} from "../field";

export class MemoryFieldSource extends FieldSource {
    constructor(field: Field) {
        super(field, {modifiable: true});
    }
}
