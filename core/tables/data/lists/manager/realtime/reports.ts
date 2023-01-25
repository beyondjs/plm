import type {ListsManager} from "../manager";
import type {ListUpdateFilterReport} from "../../../realtime/reports/list";
import type {FilterSpecs} from "../../../filter/filter";
import {ConditionOperand} from "../../../filter/filter";

export class Reports {
    readonly #manager: ListsManager;

    constructor(manager: ListsManager) {
        this.#manager = manager;
    }

    /**
     * Check if the filter specified in the realtime event fits the filter of the manager
     *
     * @param {ListUpdateFilterReport} realtimeFilter The filter received by the realtime event
     * @param {FilterSpecs} managerFilter The filter being checked
     * @returns {boolean}
     */
    #checkFilter = (realtimeFilter: ListUpdateFilterReport, managerFilter: FilterSpecs) => {
        for (const condition of managerFilter) {
            if (!realtimeFilter.hasOwnProperty(condition.field)) continue;

            switch (condition.operand) {
                case ConditionOperand.Equal:
                    if (realtimeFilter[condition.field] !== condition.value) return false;
                    break;
                case ConditionOperand.Greater:
                    if (realtimeFilter[condition.field] <= condition.value) return false;
                    break;
                case ConditionOperand.GreaterOrEqual:
                    if (realtimeFilter[condition.field] < condition.value) return false;
                    break;
                case ConditionOperand.Lower:
                    if (realtimeFilter[condition.field] >= condition.value) return false;
                    break;
                case ConditionOperand.LowerOrEqual:
                    if (realtimeFilter[condition.field] > condition.value) return false;
                    break;
            }
        }

        return true;
    }

    update(filter: ListUpdateFilterReport) {
        for (const entry of this.#manager.registries.filters.values()) {
            if (filter && entry.filter.specs && !this.#checkFilter(filter, entry.filter.specs)) continue;
            entry.lists.forEach(list => list.landed && list.invalidate());
        }
    }
}
