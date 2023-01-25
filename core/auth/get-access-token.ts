import {auth} from "./auth";

/**
 * Gets the session object from the session name
 *
 * @param session {string} The plm session name
 */
export async function getAccessToken(session: string) {
    if (!session) throw new Error('Session not set');

    const errors = Object.freeze({
        'NOT_LOGGED_IN': () => new Error(`User is not logged in on session "${session}"`)
    });

    if (!auth.sessions.has(session)) throw errors.NOT_LOGGED_IN();

    let s = auth.sessions.get(session);
    if (!s) throw errors.NOT_LOGGED_IN();

    const accessToken = s.accessToken;
    if (!accessToken) throw errors.NOT_LOGGED_IN();

    return accessToken;
}