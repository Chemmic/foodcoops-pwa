import {
    describe,
    expect,
    it,
} from "vitest";

import {
    chargenVon,
    mehrerePreise,
    naechsterPreis,
    preisFuer,
    preisFuerProdukt,
} from "./chargen.js";


const reis = {
    preis: 3.5,
    lagerbestand: { istLagerbestand: 7 },
    chargen: [
        { menge: 2, preis: 3.0 },
        { menge: 5, preis: 3.5 },
    ],
};


describe("Lagerware zu verschiedenen Preisen", () => {
    it("verkauft die älteste Ware zuerst", () => {
        const { betrag, teile } =
            preisFuerProdukt(reis, 3);

        // 2 × 3,00 + 1 × 3,50
        expect(betrag).toBe(9.5);
        expect(teile).toEqual([
            { menge: 2, preis: 3 },
            { menge: 1, preis: 3.5 },
        ]);
    });

    it("rechnet den Rest zum Ersatzpreis", () => {
        expect(preisFuer([{ menge: 1, preis: 3 }], 1.5, 4).betrag).toBe(5);
        expect(preisFuer([], 2, 1.25).betrag).toBe(2.5);
        expect(preisFuer(reis.chargen, 0).betrag).toBe(0);
    });

    it("kommt ohne Chargen aus (ältere Daten)", () => {
        const alt = {
            preis: 2,
            lagerbestand: { istLagerbestand: 4 },
        };

        expect(chargenVon(alt)).toEqual([{ menge: 4, preis: 2 }]);
        expect(preisFuerProdukt(alt, 3).betrag).toBe(6);
        expect(chargenVon({ preis: 2, lagerbestand: { istLagerbestand: 0 } })).toEqual([]);
    });

    it("erkennt mehrere Preise und den nächsten Preis", () => {
        expect(mehrerePreise(reis.chargen)).toBe(true);
        expect(mehrerePreise([{ menge: 1, preis: 3 }, { menge: 2, preis: 3.0 }])).toBe(false);
        expect(naechsterPreis(reis)).toBe(3);
    });
});
