import {FieldSource} from "./source";
import {Field} from "../field";

export class PublishedFieldSource extends FieldSource {
    constructor(field: Field) {
        super(field, {modifiable: false});
    }
}
