import {
    describe,
    expect,
    it,
} from "vitest";

import {
    PFADE,
    istAktiv,
    neuerPfad,
} from "./pfade.js";


describe("alte URLs", () => {
    it("leitet auf die neuen Pfade um", () => {
        expect(neuerPfad("/home")).toBe("/");
        expect(neuerPfad("/mainBestellung")).toBe("/bestellung/frisch");
        expect(neuerPfad("/mainBestellung/brotbestellung")).toBe("/bestellung/brot");
        expect(neuerPfad("/mainAdmin/zuVielzuWenig")).toBe("/konfiguration/zu-viel-zu-wenig");
        expect(neuerPfad("/mainAdmin/orderoverview/")).toBe("/konfiguration/bestelluebersicht");
        expect(neuerPfad("/mainManagement/frischbestandmanagement")).toBe("/produkte/frisch");
        expect(neuerPfad("/mainEinkauf")).toBe("/einkauf");
        expect(neuerPfad("/bestellung-festlegen")).toBe("/organisation/bestellung");
    });

    it("lässt unbekannte und neue Pfade in Ruhe", () => {
        expect(neuerPfad("/gibtsnicht")).toBeNull();
        expect(neuerPfad(PFADE.bestellungFrisch)).toBeNull();
        expect(neuerPfad("/mainAdminXYZ")).toBeNull();
    });
});


describe("aktive Navigation", () => {
    it("vergleicht ganze Pfadsegmente", () => {
        expect(istAktiv("/bestellung/brot", PFADE.bestellung)).toBe(true);
        expect(istAktiv("/bestellung-festlegen", PFADE.bestellung)).toBe(false);
        expect(istAktiv("/organisation/lager", PFADE.organisation)).toBe(true);
        expect(istAktiv("/profil", PFADE.start)).toBe(false);
        expect(istAktiv("/", PFADE.start)).toBe(true);
    });
});
