import {
    apiUrl,
    authFetch,
    JSON_HEADERS,
} from "../apiClient.js";

import { zahl } from "../historie/format.js";


/**
 * ============================================================================
 * Organisation: Bestellung festlegen – Daten & Logik
 * ============================================================================
 *
 *   GET    /organisation/bestellung               aktuelle Bestellübersicht
 *   PUT    /organisation/bestellung/produkte/{id} Gebinde setzen
 *   POST   /organisation/bestellung/produkte      Produkt ergänzen
 *   DELETE /organisation/bestellung/produkte/{id} ergänztes Produkt entfernen
 *   GET    /pdf/download/bestellUebersicht        PDF der Bestellung
 *   GET    /frischBestand                         Produkte zum Ergänzen
 *   GET    /produkte                              Lagerprodukte (Einkaufsliste)
 */


const EPSILON = 0.0005;


// =============================================================================
// Backend
// =============================================================================

const fehlertext = async response => {
    try {
        const message =
            (await response.json())?.message;

        if (message) {
            return message;
        }
    } catch {
        // keine JSON-Antwort
    }

    return response.status === 401
        ? "Anmeldung nicht akzeptiert. Bitte neu anmelden."
        : response.status === 403
            ? "Dafür fehlt dir die Rolle Organisator."
            : response.status === 404
                ? "Diese Funktion gibt es im Backend noch nicht – bitte das Backend neu starten."
                : `Unerwarteter Fehler (HTTP ${response.status}).`;
};


const senden = async (url, options) => {
    let response;

    try {
        response =
            await authFetch(url, options);
    } catch {
        throw new Error(
            "Das Backend ist nicht erreichbar."
        );
    }

    if (!response.ok) {
        throw new Error(
            await fehlertext(response)
        );
    }

    return response;
};


const produktUrl = produktId =>
    apiUrl(
        "organisation",
        "bestellung",
        "produkte",
        encodeURIComponent(produktId)
    );


export const getBestellung = async (verlauf = 12) =>
    (await senden(
        `${apiUrl("organisation", "bestellung")}?verlauf=${verlauf}`
    )).json();


export const setGebinde = async (produktId, gebinde) =>
    (await senden(
        produktUrl(produktId),
        {
            method: "PUT",
            headers: JSON_HEADERS,
            body: JSON.stringify({ gebinde }),
        }
    )).json();


export const addProdukt = async (produktId, gebinde) =>
    (await senden(
        apiUrl("organisation", "bestellung", "produkte"),
        {
            method: "POST",
            headers: JSON_HEADERS,
            body: JSON.stringify({ produktId, gebinde }),
        }
    )).json();


export const removeProdukt = async produktId => {
    await senden(
        produktUrl(produktId),
        {
            method: "DELETE",
        }
    );
};


/** Lagerprodukte in der Reihenfolge des Lagers (für die Einkaufsliste). */
export const getLagerprodukte = async () =>
    (await senden(
        apiUrl("produkte")
    )).json();


export const getFrischProdukte = async () =>
    (await senden(
        apiUrl("frischBestand")
    )).json();


export const downloadPdf = async dateiname => {
    const blob =
        await (await senden(
            apiUrl("pdf", "download", "bestellUebersicht")
        )).blob();

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;
    link.download = dateiname;
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
};


// =============================================================================
// Logik
// =============================================================================

/** Einheit, in der bestellt wird (Spezialfall: Stück, abgerechnet nach kg). */
export const bestellEinheit = position =>
    position.spezialfall
        ? "Stück"
        : position.einheit ?? "";


export const wirdBestellt = position =>
    position.zuBestellendeGebinde > EPSILON;


export const nachtraeglich = position =>
    position.gewollteMenge <= EPSILON;


/** Menge, die mit den Gebinden geliefert wird. */
export const bestellteMenge = position =>
    position.zuBestellendeGebinde *
    (position.gebindegroesse > 0 ? position.gebindegroesse : 1);


/** Zu viel / zu wenig als kurzer Text mit Richtung. */
export const differenzText = position => {
    const einheit =
        bestellEinheit(position);

    const differenz =
        position.zuVielZuWenig;

    if (differenz > EPSILON) {
        return {
            text: `${zahl(differenz)} ${einheit} zu viel`,
            richtung: "zuViel",
        };
    }

    if (differenz < -EPSILON) {
        return {
            text: `${zahl(-differenz)} ${einheit} zu wenig`,
            richtung: "zuWenig",
        };
    }

    return {
        text: "geht genau auf",
        richtung: "genau",
    };
};


/** Verlauf in Worten, z.B. "seit 5 Wochen gekauft". */
export const verlaufTexte = position => {
    const {
        gekauftInFolge,
        gewuenschtInFolge,
        davonOhneGebinde,
    } = position.verlauf;

    const texte = [];

    if (gekauftInFolge > 0) {
        texte.push(
            gekauftInFolge === 1
                ? "letzte Woche gekauft"
                : `seit ${gekauftInFolge} Wochen gekauft`
        );
    }

    if (gewuenschtInFolge > 1 && davonOhneGebinde > 0) {
        texte.push(
            `seit ${gewuenschtInFolge} Wochen gewünscht, ${davonOhneGebinde}× nicht bestellt`
        );
    }

    return texte;
};


/** Summen einer Kategorie: gewünscht vs. bestellt (für mischbare Sorten). */
export const kategorieSumme = kategorie => {
    const gewollt =
        kategorie.positionen.reduce((acc, p) => acc + p.gewollteMenge, 0);

    const bestellt =
        kategorie.positionen.reduce((acc, p) => acc + bestellteMenge(p), 0);

    const einheiten =
        [...new Set(kategorie.positionen.map(bestellEinheit))];

    return {
        gewollt,
        bestellt,
        differenz: bestellt - gewollt,
        einheit: einheiten.length === 1 ? einheiten[0] : "",
    };
};


/** Position nach der Antwort des Backends aktualisieren (Verlauf bleibt). */
export const mitAntwort = (position, antwort) => ({
    ...position,
    zuBestellendeGebinde: antwort.zuBestellendeGebinde,
    zuVielZuWenig: antwort.zuVielZuWenig,
});


/** Neu ergänzte Position in die passende Kategorie einsortieren. */
export const positionEinfuegen = (kategorien, antwort, produkt) => {
    const name =
        produkt?.kategorie?.name ?? "Ohne Kategorie";

    const position = {
        ...antwort,
        besteller: 0,
        verlauf: {
            runden: [],
            gekauftInFolge: 0,
            gewuenschtInFolge: 0,
            davonOhneGebinde: 0,
        },
    };

    const vorhanden =
        kategorien.some(k => k.name === name);

    const neu =
        vorhanden
            ? kategorien
            : [
                ...kategorien,
                {
                    name,
                    mischbar: Boolean(produkt?.kategorie?.mixable),
                    positionen: [],
                },
            ];

    return neu.map(k =>
        k.name === name
            ? {
                ...k,
                positionen: [...k.positionen, position].sort((a, b) =>
                    a.produkt.localeCompare(b.produkt, "de")
                ),
            }
            : k
    );
};
