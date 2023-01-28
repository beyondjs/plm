import type {Field} from '../field';
import {NotSet} from '../../../../../../constants';

interface FieldSourceSpecs {
    // Is the field source is not modifiable, the only way to change ths source value
    // is by calling the .overwrite method
    // The purpose of this specification is to forbid the consumer to change the value
    // Only plm internally changes the value by calling the .overwrite method
    modifiable?: boolean
}

/**
 * FieldSource instances are the memory and published properties of each record field
 */
export class FieldSource {
    readonly #field: Field
    protected get field() {
        return this.#field;
    }

    readonly #specs: FieldSourceSpecs

    #value: any;
    get value() {
        return this.#value;
    }

    set value(value) {
        if (!this.#specs.modifiable) {
            throw new Error('Field source should only be modified internally by plm');
        }

        // Avoid to modify the value if the field is present in the initial identifier
        // and the record is not still persisted
        const {record} = this.#field;
        if (!record.persisted) {
            const initialIdentifier = record.identifiers.initial;
            if (initialIdentifier?.hasOwnProperty(this.#field.name)) {
                throw new Error(`Value of field "${this.#field.name}" cannot be set as ` +
                    `it is a field present in the initial identifier`);
            }
        }

        // Primary key cannot be set nor modified
        const pk = record.table.indices.primary.fields[0];
        if (this.#field.name === pk) {
            throw new Error(`Primary key field "${pk}" cannot be set nor modified`);
        }

        this.#value = value;
        record.trigger('change');
    }

    get assigned() {
        return ![NotSet, undefined].includes(this.value)
    }

    constructor(field: Field, specs?: FieldSourceSpecs) {
        specs = specs ? specs : {};
        specs.modifiable = !!specs.modifiable;
        this.#field = field;
        this.#specs = specs;
    }

    /**
     * Set the value of the field directly, without triggering events nor making any validation,
     * it is used internally by plm, .. consumers should not use it
     */
    overwrite(value: any) {
        this.#value = value;
    }

    discard() {
        this.value = NotSet;
    }
}
