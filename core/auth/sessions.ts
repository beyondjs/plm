import {PLMSession} from "./session";

export class Sessions extends Map<string, PLMSession> {
    register(name: string) {
        if (!name) throw new Error('Parameter name not set');
        if (super.has(name)) throw new Error(`Session "${name}" already registered`);

        const session = new PLMSession(name);
        super.set(name, session);
        return session;
    }

    unregister(name: string) {
        if (!name) throw new Error('Parameter name not set');
        if (!super.has(name)) throw new Error(`Session "${name}" is not registered`);
        super.delete(name);
    }
}
