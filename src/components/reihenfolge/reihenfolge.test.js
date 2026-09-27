import {
    describe,
    expect,
    it,
} from "vitest";

import {
    anPlatz,
    geaendert,
    verschieben,
    zielIndex,
} from "./reihenfolge.js";


const liste = ["A", "B", "C", "D"].map(id => ({ id }));
const ids = l => l.map(e => e.id).join("");


describe("Reihenfolge", () => {
    it("verschiebt nach oben und unten", () => {
        expect(ids(verschieben(liste, 3, 0))).toBe("DABC");
        expect(ids(verschieben(liste, 0, 2))).toBe("BCAD");
        expect(ids(verschieben(liste, 1, 99))).toBe("ACDB");
        expect(verschieben(liste, 2, 2)).toBe(liste);
    });

    it("setzt an einen Platz (1 = oben)", () => {
        expect(ids(anPlatz(liste, 3, 2))).toBe("ADBC");
        expect(ids(anPlatz(liste, 0, 0))).toBe("ABCD");
        expect(ids(anPlatz(liste, 0, "4"))).toBe("BCDA");
        expect(anPlatz(liste, 0, "abc")).toBe(liste);
    });

    it("findet das Ziel beim Ziehen", () => {
        const mitten = [10, 30, 50, 70];

        // A (0) zwischen B und C ziehen -> Index 1
        expect(zielIndex(mitten, 35, 0)).toBe(1);
        // D (3) ganz nach oben
        expect(zielIndex(mitten, 0, 3)).toBe(0);
        // B (1) ganz nach unten
        expect(zielIndex(mitten, 200, 1)).toBe(3);
        // kaum bewegt -> bleibt
        expect(zielIndex(mitten, 28, 1)).toBe(1);
    });

    it("erkennt Änderungen", () => {
        expect(geaendert(liste, [...liste])).toBe(false);
        expect(geaendert(liste, verschieben(liste, 0, 1))).toBe(true);
    });
});
