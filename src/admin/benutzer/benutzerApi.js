import {
    apiUrl,
    authFetch,
    JSON_HEADERS,
} from "../../apiClient.js";


/**
 * ============================================================================
 * Benutzerverwaltung (Keycloak über das Backend)
 * ============================================================================
 *
 * Das Frontend darf keinen vertraulichen Keycloak-Client und kein
 * Client Secret enthalten. Deshalb läuft alles über das Backend:
 *
 *   Browser  ->  /keycloak/admin/...  ->  Backend  ->  Keycloak Admin API
 *
 * Das Backend prüft die Admin-Rolle anhand des mitgeschickten Tokens.
 *
 * Alle Funktionen werfen bei Fehlern einen Error mit einer
 * verständlichen Meldung (vom Backend, falls vorhanden).
 */

const KEYCLOAK = "keycloak";
const ADMIN = "admin";
const USERS = "users";
const ROLES = "roles";


const request = async (
    url,
    options = {}
) => {
    let response;

    try {
        response =
            await authFetch(
                url,
                options
            );
    } catch {
        throw new Error(
            "Das Backend ist nicht erreichbar."
        );
    }


    if (response.ok) {
        if (
            response.status === 204
        ) {
            return null;
        }

        const text =
            await response.text();

        return text
            ? JSON.parse(text)
            : null;
    }


    let message = null;

    try {
        const body =
            await response.json();

        message =
            body?.message ?? null;
    } catch {
        // Keine JSON-Antwort
    }


    if (!message) {
        if (
            response.status === 401
        ) {
            message =
                "Anmeldung nicht akzeptiert. Bitte neu anmelden.";
        } else if (
            response.status === 403
        ) {
            message =
                "Dafür fehlt dir die nötige Berechtigung.";
        } else {
            message =
                `Unerwarteter Fehler (HTTP ${response.status}).`;
        }
    }


    const error =
        new Error(message);

    error.status =
        response.status;

    throw error;
};


const send = (
    method,
    url,
    body
) =>
    request(
        url,
        {
            method,
            headers:
                JSON_HEADERS,

            body:
                body === undefined
                    ? undefined
                    : JSON.stringify(
                        body
                    ),
        }
    );


const adminUrl = (...parts) =>
    apiUrl(
        KEYCLOAK,
        ADMIN,
        ...parts.map(
            part =>
                encodeURIComponent(
                    part
                )
        )
    );


// =============================================================================
// Benutzer
// =============================================================================

export const listUsers = () =>
    request(
        adminUrl(USERS)
    );


export const getUser = id =>
    request(
        adminUrl(USERS, id)
    );


export const createUser = data =>
    send(
        "POST",
        adminUrl(USERS),
        data
    );


export const updateUser = (
    id,
    data
) =>
    send(
        "PUT",
        adminUrl(USERS, id),
        data
    );


export const deleteUser = id =>
    send(
        "DELETE",
        adminUrl(USERS, id)
    );


export const setUserRoles = (
    id,
    roles
) =>
    send(
        "PUT",
        adminUrl(USERS, id, "roles"),
        { roles }
    );


export const setUserPassword = (
    id,
    password,
    temporary
) =>
    send(
        "PUT",
        adminUrl(USERS, id, "password"),
        {
            password,
            temporary,
        }
    );


/**
 * Keycloak verschickt eine E-Mail mit Link, z.B. zum Setzen
 * eines neuen Passworts (UPDATE_PASSWORD).
 */
export const sendActionsEmail = (
    id,
    actions
) =>
    send(
        "POST",
        adminUrl(USERS, id, "actions-email"),
        { actions }
    );


export const logoutUser = id =>
    send(
        "POST",
        adminUrl(USERS, id, "logout")
    );


// =============================================================================
// Rollen
// =============================================================================

export const listRoles = () =>
    request(
        adminUrl(ROLES)
    );


// =============================================================================
// Benutzer einer Rolle (für Einkäufer, z.B. Mail an Einkaufsmanagement)
// =============================================================================

export const getUsersOfRole =
    async roleName => {
        if (
            !roleName ||
            typeof roleName !==
                "string" ||
            !roleName.trim()
        ) {
            throw new Error(
                "roleName must not be empty"
            );
        }


        try {
            const data =
                await request(
                    apiUrl(
                        KEYCLOAK,
                        ROLES,
                        encodeURIComponent(
                            roleName.trim()
                        ),
                        USERS
                    )
                );

            return Array.isArray(data)
                ? data
                : [];
        } catch (error) {
            console.error(
                "[Keycloak] Benutzer der Rolle konnten nicht geladen werden:",
                error
            );

            return [];
        }
    };
