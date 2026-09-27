import {
    describe,
    expect,
    it,
} from "vitest";

import {
    einkaufsliste,
    fehlmenge,
} from "./einkaufsliste.js";


const produkt = (id, name, ist, soll, extra = {}) => ({
    id,
    name,
    preis: 2,
    kategorie: { name: "Nudeln" },
    lagerbestand: {
        istLagerbestand: ist,
        sollLagerbestand: soll,
        einheit: { name: "kg" },
    },
    ...extra,
});


describe("Einkaufsliste Lager", () => {
    it("zeigt nur, was unter Soll ist", () => {
        expect(fehlmenge(produkt("p", "Penne", 9, 10))).toMatchObject({
            fehlt: 1,
            summe: 2,
        });

        // Soll erreicht oder überschritten -> nichts kaufen
        expect(fehlmenge(produkt("p", "Penne", 10, 10))).toBeNull();
        expect(fehlmenge(produkt("p", "Penne", 20, 10))).toBeNull();
        expect(fehlmenge(produkt("p", "Penne", 0, 0))).toBeNull();
    });

    it("gruppiert nach Kategorie in der Reihenfolge des Lagers", () => {
        const liste =
            einkaufsliste([
                produkt("s", "Spaghetti", 1, 5, { sortierung: 2 }),
                produkt("r", "Reis", 0, 3, { sortierung: 3, kategorie: { name: "Getreide" } }),
                produkt("p", "Penne", 9, 10, { sortierung: 1 }),
                produkt("f", "Fusilli", 8, 5, { sortierung: 4 }),
            ]);

        expect(liste.gruppen.map(g => g.kategorie)).toEqual(["Nudeln", "Getreide"]);
        expect(liste.gruppen[0].positionen.map(p => p.name)).toEqual(["Penne", "Spaghetti"]);
        expect(liste.anzahl).toBe(3);
        // 1 + 4 + 3 kg zu je 2 €
        expect(liste.summe).toBe(16);
    });

    it("rundet Kommazahlen sauber", () => {
        expect(fehlmenge(produkt("h", "Hafer", 0.7, 1)).fehlt).toBe(0.3);
    });
});
