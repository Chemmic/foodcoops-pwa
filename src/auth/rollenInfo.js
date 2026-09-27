import {
    ADMIN_ROLE,
    EINKAEUFER_ROLE,
    ORGANISATOR_ROLE,
} from "./roles.js";


/**
 * ============================================================================
 * Was darf welche Rolle?
 * ============================================================================
 *
 * Für die Hilfe bei der Rollenvergabe. Muss zu den Rollen-Prüfungen im
 * Router (AppRouter.jsx) und im Backend (SecurityConfiguration) passen.
 */

/** Was jede angemeldete Person sieht – auch ganz ohne Rolle. */
export const OHNE_ROLLE = [
    "Start",
    "Mein Profil (eigene Bestellungen, Einkäufe und Rechnungen)",
    "Impressum",
];


const INFOS = {
    [EINKAEUFER_ROLE]: {
        kurz: "Normales Mitglied: bestellen und einkaufen.",
        bereiche: [
            "Bestellung (Frisch und Brot)",
            "Einkauf (Bestellungen abholen, Lagerware, Zu viel)",
            "Produkte (Lager, Frisch- und Brot-Sortiment verwalten)",
            "Konfiguration (Zu viel / zu wenig, Bestellübersicht, PDFs, Einstellungen, Deadline)",
        ],
    },

    [ORGANISATOR_ROLE]: {
        kurz: "Legt fest, was beim Händler bestellt wird.",
        bereiche: [
            "Organisation → Bestellung beim Händler (Gebinde festlegen, Produkte ergänzen, PDF)",
            "Organisation → Lager auffüllen (Einkaufsliste)",
        ],
        hinweis: `Zum Bestellen und Einkaufen zusätzlich „${EINKAEUFER_ROLE}" vergeben.`,
    },

    [ADMIN_ROLE]: {
        kurz: "Verwaltet die Foodcoop und die Benutzer.",
        bereiche: [
            "Verwaltung (Statistik, Mitglieder, Benutzer & Rollen)",
            "Organisation (wie Organisator)",
            "Konfiguration",
        ],
        hinweis: `Zum Bestellen, Einkaufen und für die Produkte zusätzlich „${EINKAEUFER_ROLE}" vergeben.`,
    },

    Einkaufsmanagement: {
        kurz: "Bekommt nach jedem Einkauf eine E-Mail.",
        bereiche: [
            "Keine zusätzlichen Seiten",
        ],
        hinweis: "Der Text der E-Mail steht unter Konfiguration → Einstellungen.",
    },
};


/**
 * Beschreibung einer Rolle. Für unbekannte Rollen: die Beschreibung aus
 * Keycloak, sonst ein Hinweis, dass die App sie nicht verwendet.
 */
export const rollenInfo = (name, keycloakBeschreibung = null) =>
    INFOS[name] ?? {
        kurz: keycloakBeschreibung || "Diese Rolle wird in der App nicht verwendet.",
        bereiche: [],
    };
