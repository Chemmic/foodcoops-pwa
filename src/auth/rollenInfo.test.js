import {
    describe,
    expect,
    it,
} from "vitest";

import {
    ADMIN_ROLE,
    EINKAEUFER_ROLE,
    ORGANISATOR_ROLE,
} from "./roles.js";

import { rollenInfo } from "./rollenInfo.js";


describe("Rollen-Hilfe", () => {
    it("beschreibt die Rollen der App", () => {
        expect(rollenInfo(EINKAEUFER_ROLE).bereiche.join(" ")).toContain("Bestellung");
        expect(rollenInfo(ORGANISATOR_ROLE).bereiche.join(" ")).toContain("Organisation");
        expect(rollenInfo(ADMIN_ROLE).bereiche.join(" ")).toContain("Verwaltung");
    });

    it("nimmt für unbekannte Rollen die Keycloak-Beschreibung", () => {
        expect(rollenInfo("Kasse", "Macht die Kasse").kurz).toBe("Macht die Kasse");
        expect(rollenInfo("Kasse").kurz).toContain("nicht verwendet");
        expect(rollenInfo("Kasse").bereiche).toEqual([]);
    });
});
