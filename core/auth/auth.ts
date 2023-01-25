import {Sessions} from "./sessions";

export /*bundle*/
const auth = new class {
    #sessions = new Sessions();
    get sessions() {
        return this.#sessions;
    }

    set(sessionName: string, accessToken: string) {
        if (!this.#sessions.has(sessionName)) {
            throw new Error(`Session "${sessionName}" is not registered`);
        }

        const session = this.#sessions.get(sessionName);
        session.accessToken = accessToken;
    }
}
