import {
    getAccessToken,
} from "./auth/Keycloak.js";


// =============================================================================
// Backend URL
// =============================================================================
//
// Lokal:
//
//   VITE_BACKEND_URL=http://localhost:8080/
//
// Produktion:
//
//   VITE_BACKEND_URL=/api/
//
// Der abschließende Slash wird hier entfernt.
// apiUrl(...) setzt die Pfade danach sauber zusammen.
//
// =============================================================================

const BACKEND_URL = (
    import.meta.env.VITE_BACKEND_URL || "/api/"
).replace(/\/+$/, "");


export const apiUrl = (...parts) => {
    const path = parts
        .filter(
            part =>
                part !== undefined &&
                part !== null &&
                part !== ""
        )
        .map(
            part =>
                String(part)
                    .replace(/^\/+/, "")
                    .replace(/\/+$/, "")
        )
        .join("/");

    return path
        ? `${BACKEND_URL}/${path}`
        : BACKEND_URL;
};


export const JSON_HEADERS = {
    "Content-Type": "application/json"
};


// =============================================================================
// fetch mit Keycloak-Token
// =============================================================================
//
// Wie fetch(...), hängt aber – falls angemeldet – das aktuelle
// Keycloak Access Token als "Authorization: Bearer ..." an.
//
// Das Token wird vorher bei Bedarf erneuert (siehe getAccessToken).
//
// =============================================================================

export const authFetch = async (
    url,
    options = {}
) => {
    const token =
        await getAccessToken();

    if (!token) {
        return fetch(
            url,
            options
        );
    }

    const headers =
        new Headers(
            options.headers ?? {}
        );

    headers.set(
        "Authorization",
        `Bearer ${token}`
    );

    return fetch(
        url,
        {
            ...options,
            headers,
        }
    );
};
