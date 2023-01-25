import {Table, TableSpecs} from "./table";

export class Tables extends Map<string, Table> {
    register(name: string, specs: TableSpecs) {
        if (this.has(name)) throw new Error(`Table ${name} is already registered`);

        const table = new Table(name, specs);
        super.set(name, table);
        return table;
    }

    validate(): boolean {
        this.forEach(table => table.validate());
        return true;
    }
}

export /*bundle*/
const tables = new Tables();
