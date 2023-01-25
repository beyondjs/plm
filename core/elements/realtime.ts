import {Element} from "./element";

export class Realtime {
    #element: Element<any>;

    #update = () => {
        this.#element.active &&
        this.#element.fetch(false)
            .then(() => this.#element.fill())
            .catch((exc: Error) => {
                console.error(exc.stack);
                console.error(`Collection fill error on realtime event.\n\n`);
            });
    }

    constructor(element: Element<any>) {
        this.#element = element;
        this.#element.data.on('invalidated', this.#update);
    }

    destroy() {
        this.#element.data.off('invalidated', this.#update);
    }
}