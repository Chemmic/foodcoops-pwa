import {
    ADMIN_ROLE,
    EINKAEUFER_ROLE,
    EINKAUFSMANAGEMENT_ROLE,
    ORGANISATOR_ROLE,
} from "./roles.js";


/**
 * ============================================================================
 * Was darf welche Rolle?
 * ============================================================================
 *
 * Für die Hilfe bei der Rollenvergabe. Muss zu auth/rechte.js und zum
 * Backend (SecurityConfiguration) passen.
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
        ],
    },

    [ORGANISATOR_ROLE]: {
        kurz: "Kümmert sich um Sortiment und Bestellung beim Händler.",
        bereiche: [
            "Organisation → Bestellung beim Händler (Gebinde festlegen, Produkte ergänzen, PDF)",
            "Organisation → Lager auffüllen (Einkaufsliste)",
            "Produkt-Management (Lager, Frisch- und Brot-Sortiment)",
            "Konfiguration → Zu viel / zu wenig, Bestellübersicht, PDF-Übersicht",
        ],
        hinweis: `Zum Bestellen und Einkaufen zusätzlich „${EINKAEUFER_ROLE}“ vergeben.`,
    },

    [EINKAUFSMANAGEMENT_ROLE]: {
        kurz: "Behält die Einkäufe im Blick und bekommt nach jedem Einkauf eine E-Mail.",
        bereiche: [
            "Konfiguration → Zu viel / zu wenig, Bestellübersicht, PDF-Übersicht",
            "E-Mail mit der Kostenübersicht nach jedem Einkauf",
        ],
        hinweis: `Zum Bestellen und Einkaufen zusätzlich „${EINKAEUFER_ROLE}“ vergeben.`,
    },

    [ADMIN_ROLE]: {
        kurz: "Darf alles und verwaltet die Benutzer.",
        bereiche: [
            "Alle Bereiche der anderen Rollen",
            "Konfiguration → Einstellungen und Deadline",
            "Verwaltung (Statistik, Mitglieder, Benutzer & Rollen)",
        ],
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
