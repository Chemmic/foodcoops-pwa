import {
    ADMIN_ROLE,
    EINKAEUFER_ROLE,
    EINKAUFSMANAGEMENT_ROLE,
    ORGANISATOR_ROLE,
} from "./roles.js";


/**
 * ============================================================================
 * Wer darf was sehen?
 * ============================================================================
 *
 * Eine Stelle für Navigation, Routen und die Rollen-Hilfe. Admin darf alles.
 *
 *   Home, Impressum            jeder
 *   Mein Profil                angemeldet
 *   Bestellung, Einkauf        Einkäufer   (immer sichtbar, sonst gesperrt)
 *   Produkt-Management         Organisator
 *   Konfiguration              Einkaufsmanagement, Organisator
 *     Einstellungen, Deadline  nur Admin
 *   Organisation               Organisator
 *   Verwaltung                 nur Admin
 *
 * Muss zum Backend (SecurityConfiguration) passen.
 * ============================================================================
 */
export const RECHTE = {
    bestellung: [EINKAEUFER_ROLE, ADMIN_ROLE],
    einkauf: [EINKAEUFER_ROLE, ADMIN_ROLE],
    produkte: [ORGANISATOR_ROLE, ADMIN_ROLE],
    konfiguration: [EINKAUFSMANAGEMENT_ROLE, ORGANISATOR_ROLE, ADMIN_ROLE],
    einstellungen: [ADMIN_ROLE],
    organisation: [ORGANISATOR_ROLE, ADMIN_ROLE],
    verwaltung: [ADMIN_ROLE],
};


/** Bereiche, die auch ohne Rolle in der Navigation stehen (dann gesperrt). */
const IMMER_SICHTBAR = [
    "bestellung",
    "einkauf",
];


/** Reihenfolge der Hauptnavigation. */
const NAVIGATION = [
    "start",
    "profil",
    "bestellung",
    "einkauf",
    "produkte",
    "konfiguration",
    "organisation",
    "verwaltung",
];


/**
 * Welche Bereiche die Navigation zeigt.
 *
 * darf(rollen) -> true, wenn die Person eine der Rollen hat.
 * Ergebnis: [{ bereich, gesperrt }]
 */
export const sichtbareBereiche = (angemeldet, darf) =>
    NAVIGATION.flatMap(bereich => {
        if (bereich === "start") {
            return [{ bereich, gesperrt: false }];
        }

        if (bereich === "profil") {
            return angemeldet ? [{ bereich, gesperrt: false }] : [];
        }

        const erlaubt =
            angemeldet && darf(RECHTE[bereich]);

        if (erlaubt) {
            return [{ bereich, gesperrt: false }];
        }

        return IMMER_SICHTBAR.includes(bereich)
            ? [{ bereich, gesperrt: true }]
            : [];
    });


/**
 * Rolle(n) für Hinweise wie "Benötigte Rolle: Einkäufer" – Admin nur
 * nennen, wenn es die einzige ist.
 */
export const benoetigteRollen = rollen => {
    const ohneAdmin =
        (rollen ?? []).filter(rolle => rolle !== ADMIN_ROLE);

    return ohneAdmin.length > 0
        ? ohneAdmin
        : (rollen ?? []);
};
