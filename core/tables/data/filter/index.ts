import type {Table} from "../../table";
import type {RecordData} from "../record/data";

export /*bundle*/ enum ConditionOperand {
    Equal,
    Greater,
    GreaterOrEqual,
    Lower,
    LowerOrEqual
}

export /*bundle*/ type Condition = {
    field: string,
    operand: ConditionOperand,
    value: string | number | boolean
}

export /*bundle*/ type FilterSpecs = Condition[];

export class Filter {
    readonly #table: Table
    get table() {
        return this.#table
    }

    readonly #specs: FilterSpecs
    get specs() {
        return this.#specs
    }

    readonly #fields: Set<string> = new Set()
    get fields() {
        return new Set(this.#fields);
    }

    #validate = () => {
        if (!this.#specs) return true;

        if (!(this.#specs instanceof Array)) {
            throw new Error('Invalid filter specification');
        }
        for (const condition of this.#specs) {
            if (!condition || typeof condition !== 'object') {
                console.error('Filter condition', condition);
                throw new Error('At least one of the conditions of the filter is invalid');
            }
            const {field, operand, value} = condition;
            this.#fields.add(field);

            if (!field || typeof field !== 'string') {
                throw new Error(`Condition field attribute "${field}" is invalid`);
            }

            const co = ConditionOperand;
            const operands = [co.Equal, co.Greater, co.GreaterOrEqual, co.Lower, co.LowerOrEqual];
            if ((!operand && operand !== 0) || !operands.includes(operand)) {
                throw new Error(`Condition operand "${operand}" is invalid`);
            }

            if (!value) {
                throw new Error(`Condition value "${value}" is invalid`);
            }
        }
    }

    /**
     * Checks if the record should be included in the list or not
     * @param {RecordData} record
     */
    applies(record: RecordData): boolean {
        return false;
    }

    constructor(table: Table, specs: FilterSpecs) {
        this.#table = table;
        this.#specs = specs;
        this.#validate();
    }
}
