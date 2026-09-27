import {
    apiUrl,
    authFetch,
} from "../apiClient.js";


/**
 * ============================================================================
 * Bestellhistorie & Statistik
 * ============================================================================
 *
 *   /me/historie                       eigene Runden (Person aus dem Token)
 *   /admin/mitglieder                  Übersicht aller Mitglieder (Admin)
 *   /admin/mitglieder/{id}/historie    Historie eines Mitglieds (Admin)
 *   /admin/statistik?runden=n          Foodcoop-Statistik (Admin)
 */

const load = async url => {
    let response;

    try {
        response =
            await authFetch(url);
    } catch {
        throw new Error(
            "Das Backend ist nicht erreichbar."
        );
    }


    if (response.ok) {
        return response.json();
    }


    let message = null;

    try {
        message =
            (await response.json())
                ?.message ?? null;
    } catch {
        // keine JSON-Antwort
    }


    if (!message) {
        message =
            response.status === 401
                ? "Anmeldung nicht akzeptiert. Bitte neu anmelden."
                : response.status === 403
                    ? "Dafür fehlt dir die nötige Rolle."
                    : response.status === 404
                        ? "Diese Funktion gibt es im Backend noch nicht – bitte das Backend neu starten."
                        : `Unerwarteter Fehler (HTTP ${response.status}).`;
    }


    throw new Error(message);
};


export const getMeineHistorie = () =>
    load(
        apiUrl("me", "historie")
    );


export const getMitglieder = () =>
    load(
        apiUrl("admin", "mitglieder")
    );


export const getMitgliedHistorie = personId =>
    load(
        apiUrl(
            "admin",
            "mitglieder",
            encodeURIComponent(personId),
            "historie"
        )
    );


export const getStatistik = (runden = 12) =>
    load(
        `${apiUrl("admin", "statistik")}?runden=${runden}`
    );
