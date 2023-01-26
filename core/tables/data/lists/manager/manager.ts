import {ListData} from "../list";
import {FilterSpecs} from "../../filter/filter";
import {Factory} from "../../factory/factory";
import {OrderSpecs} from "../order";
import {Registries} from "./registries/registries";
import {Realtime} from "./realtime/realtime";

export class ListsManager extends Factory<ListData> {
    #registries = new Registries(this);
    get registries() {
        return this.#registries;
    }

    #realtime = new Realtime(this);
    get realtime() {
        return this.#realtime;
    }

    protected create(key: string, instanceId: number, filter: FilterSpecs, order: OrderSpecs): ListData {
        return new ListData(this, key, instanceId, filter, order);
    }

    get(filter: FilterSpecs, order: OrderSpecs): ListData {
        const list = super.get(filter, order);
        this.#registries.informListCreated(list);
        return list;
    }

    release(instanceId: number): ListData {
        const list: ListData = <ListData>super.release(instanceId);
        if (!list) return;

        this.#registries.informListDestroyed(list);
        return list;
    }
}
