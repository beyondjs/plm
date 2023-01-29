import type {CrudFunctions} from './crud';
import type {PropertySpecsUnion} from './properties';
import type {IndicesSpecs} from './indices/indices';
import {ListsManager} from './data/list/manager';
import {RecordsManager} from './data/record/manager';
import {CountersManager} from './data/counter/manager';
import {Properties} from './properties';
import {LocalDB} from './local-database';
import {Indices} from './indices/indices';
import {Crud} from './crud';

interface CacheSpecs {
    enabled: boolean
    limit?: number
}

export /*bundle*/
interface TableSpecs {
    cache?: CacheSpecs | undefined | boolean;
    crud: CrudFunctions;
    version?: number;
    indices: IndicesSpecs;
    fields: string[];
    properties?: Record<string, PropertySpecsUnion>;
}

/**
 * Table data access
 *
 * @param name {string} The table name
 * @param specs {object} The table specification
 * @constructor
 */
export class Table {
    readonly #name: string;
    readonly #specs: TableSpecs;

    get name() {
        return this.#name;
    }

    get version() {
        return this.#specs.version;
    }

    get cache(): CacheSpecs {
        return <CacheSpecs>this.#specs.cache;
    }

    get fields(): string[] {
        return this.#specs.fields.slice();
    }

    readonly #properties: Properties;
    get properties() {
        return this.#properties;
    }

    readonly #indices: Indices;
    get indices(): Indices {
        return this.#indices;
    }

    readonly #localDB = new LocalDB(this);
    get localDB() {
        return this.#localDB;
    }

    readonly #records = new RecordsManager(this);
    get records() {
        return this.#records;
    }

    readonly #lists = new ListsManager(this);
    get lists() {
        return this.#lists;
    }

    readonly #counters = new CountersManager(this);
    get counters() {
        return this.#counters;
    }

    readonly #crud: Crud;
    get crud() {
        return this.#crud;
    }

    constructor(name: string, specs: TableSpecs) {
        if (typeof specs.crud !== 'object')
            throw new Error(`Invalid crud specification on table "${name}"`);
        if (specs.version && typeof specs.version !== 'number')
            throw new Error('Invalid table version specification');
        if (!(specs.fields instanceof Array))
            throw new Error(`Invalid fields specification on table "${name}"`);
        if (specs.properties && typeof specs.properties !== 'object')
            throw new Error(`Invalid properties specification on table "${name}"`);
        if (specs.indices && typeof specs.indices !== 'object')
            throw new Error(`Invalid indices specification on table "${name}"`);
        if (typeof name !== 'string' || !name)
            throw new Error('Invalid table name parameter');

        specs.version = specs.version ? specs.version : 1;

        this.#name = name;
        this.#specs = specs;

        if (!['boolean', 'object', 'undefined'].includes(typeof this.#specs.cache)) {
            console.warn(`Invalid cache specification on table "${name}"`, specs);
        }
        this.#specs.cache === undefined ? this.#specs.cache = {enabled: false} : null;
        typeof this.#specs.cache === 'boolean' ? this.#specs.cache = {enabled: this.#specs.cache} : null;
        typeof this.#specs.cache === 'object' && !this.#specs.cache.hasOwnProperty('limit') ?
            this.#specs.cache.limit = 30 : null;

        this.#indices = new Indices(this, specs.indices);
        this.#properties = new Properties(this, specs.properties);

        this.#crud = new Crud(this, specs.crud);

        this.#localDB.prepare().catch(exc => console.error(exc.stack));
    }

    validate(): boolean {
        this.#properties.validate();
        return true;
    }
}

export /*bundle*/ type TTable = Table;
