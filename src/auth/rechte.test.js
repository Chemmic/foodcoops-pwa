import {
    describe,
    expect,
    it,
} from "vitest";

import {
    ADMIN_ROLE,
    EINKAEUFER_ROLE,
    EINKAUFSMANAGEMENT_ROLE,
    ORGANISATOR_ROLE,
} from "./roles.js";

import {
    benoetigteRollen,
    sichtbareBereiche,
} from "./rechte.js";


const mitRollen = (...eigene) => rollen =>
    rollen.some(rolle => eigene.includes(rolle));

const anzeige = liste =>
    liste.map(({ bereich, gesperrt }) => gesperrt ? `${bereich} (gesperrt)` : bereich);


describe("Sichtbare Bereiche", () => {
    it("zeigt ohne Anmeldung nur Start und gesperrte Bestellung / Einkauf", () => {
        expect(anzeige(sichtbareBereiche(false, mitRollen(ADMIN_ROLE)))).toEqual([
            "start",
            "bestellung (gesperrt)",
            "einkauf (gesperrt)",
        ]);
    });

    it("zeigt angemeldet ohne Rolle das Profil, Bestellung / Einkauf gesperrt", () => {
        expect(anzeige(sichtbareBereiche(true, mitRollen()))).toEqual([
            "start",
            "profil",
            "bestellung (gesperrt)",
            "einkauf (gesperrt)",
        ]);
    });

    it("Einkäufer: bestellen und einkaufen", () => {
        expect(anzeige(sichtbareBereiche(true, mitRollen(EINKAEUFER_ROLE)))).toEqual([
            "start",
            "profil",
            "bestellung",
            "einkauf",
        ]);
    });

    it("Organisator: Produkte, Konfiguration und Organisation", () => {
        expect(anzeige(sichtbareBereiche(true, mitRollen(ORGANISATOR_ROLE)))).toEqual([
            "start",
            "profil",
            "bestellung (gesperrt)",
            "einkauf (gesperrt)",
            "produkte",
            "konfiguration",
            "organisation",
        ]);
    });

    it("Einkaufsmanagement: Konfiguration", () => {
        expect(anzeige(sichtbareBereiche(true, mitRollen(EINKAUFSMANAGEMENT_ROLE)))).toContain("konfiguration");
        expect(anzeige(sichtbareBereiche(true, mitRollen(EINKAUFSMANAGEMENT_ROLE)))).not.toContain("produkte");
    });

    it("Admin: alles", () => {
        expect(anzeige(sichtbareBereiche(true, mitRollen(ADMIN_ROLE)))).toEqual([
            "start",
            "profil",
            "bestellung",
            "einkauf",
            "produkte",
            "konfiguration",
            "organisation",
            "verwaltung",
        ]);
    });

    it("nennt Admin nur, wenn es keine andere Rolle gibt", () => {
        expect(benoetigteRollen([EINKAEUFER_ROLE, ADMIN_ROLE])).toEqual([EINKAEUFER_ROLE]);
        expect(benoetigteRollen([ADMIN_ROLE])).toEqual([ADMIN_ROLE]);
    });
});
