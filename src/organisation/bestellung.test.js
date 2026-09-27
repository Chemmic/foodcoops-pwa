import {
    afterEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

vi.mock(
    "../auth/Keycloak.js",
    () => ({
        getAccessToken:
            vi.fn(async () => "token-123"),
    })
);

import {
    differenzText,
    getBestellung,
    kategorieSumme,
    mitAntwort,
    positionEinfuegen,
    setGebinde,
    verlaufTexte,
} from "./bestellung.js";


const position = (produkt, gebinde, gewollt, extra = {}) => ({
    produktId: produkt.toLowerCase(),
    produkt,
    einheit: "Stück",
    spezialfall: false,
    gebindegroesse: 10,
    gewollteMenge: gewollt,
    zuBestellendeGebinde: gebinde,
    zuVielZuWenig: gebinde * 10 - gewollt,
    besteller: 1,
    verlauf: {
        runden: [],
        gekauftInFolge: 0,
        gewuenschtInFolge: 1,
        davonOhneGebinde: 0,
    },
    ...extra,
});


afterEach(() => {
    vi.restoreAllMocks();
});


describe("Anzeige", () => {
    it("beschreibt zu viel und zu wenig", () => {
        expect(differenzText(position("Eichblatt", 1, 8))).toEqual({
            text: "2 Stück zu viel",
            richtung: "zuViel",
        });

        expect(differenzText(position("Kopfsalat", 0, 3)).richtung).toBe("zuWenig");
        expect(differenzText(position("Rucola", 1, 10)).text).toBe("geht genau auf");
    });

    it("fasst den Verlauf in Worten zusammen", () => {
        expect(verlaufTexte(position("Eichblatt", 1, 8, {
            verlauf: { runden: [], gekauftInFolge: 5, gewuenschtInFolge: 6, davonOhneGebinde: 0 },
        }))).toEqual(["seit 5 Wochen gekauft"]);

        expect(verlaufTexte(position("Kopfsalat", 0, 2, {
            verlauf: { runden: [], gekauftInFolge: 0, gewuenschtInFolge: 3, davonOhneGebinde: 2 },
        }))).toEqual(["seit 3 Wochen gewünscht, 2× nicht bestellt"]);

        expect(verlaufTexte(position("Rucola", 1, 2, {
            verlauf: { runden: [], gekauftInFolge: 1, gewuenschtInFolge: 1, davonOhneGebinde: 0 },
        }))).toEqual(["letzte Woche gekauft"]);
    });

    it("summiert eine mischbare Kategorie", () => {
        const summe =
            kategorieSumme({
                positionen: [
                    position("Eichblatt", 1, 8),
                    position("Kopfsalat", 0, 3),
                ],
            });

        expect(summe).toEqual({
            gewollt: 11,
            bestellt: 10,
            differenz: -1,
            einheit: "Stück",
        });
    });
});


describe("Ändern", () => {
    it("übernimmt nur die Gebinde aus der Antwort", () => {
        const vorher =
            position("Kopfsalat", 0, 3, {
                besteller: 2,
                verlauf: { runden: [null], gekauftInFolge: 0, gewuenschtInFolge: 3, davonOhneGebinde: 2 },
            });

        const nachher =
            mitAntwort(vorher, {
                ...position("Kopfsalat", 1, 3),
                besteller: 0,
            });

        expect(nachher.zuBestellendeGebinde).toBe(1);
        expect(nachher.zuVielZuWenig).toBe(7);
        expect(nachher.besteller).toBe(2);
        expect(nachher.verlauf.davonOhneGebinde).toBe(2);
    });

    it("sortiert ergänzte Produkte in ihre Kategorie ein", () => {
        const kategorien = [
            { name: "Salat", mischbar: true, positionen: [position("Kopfsalat", 0, 3)] },
        ];

        const neu =
            positionEinfuegen(
                kategorien,
                position("Eichblatt", 1, 0),
                { kategorie: { name: "Salat", mixable: true } }
            );

        expect(neu[0].positionen.map(p => p.produkt)).toEqual(["Eichblatt", "Kopfsalat"]);

        const mitNeuerKategorie =
            positionEinfuegen(
                kategorien,
                position("Lauch", 1, 0),
                { kategorie: { name: "Gemüse", mixable: false } }
            );

        expect(mitNeuerKategorie.map(k => k.name)).toEqual(["Salat", "Gemüse"]);
    });

    it("schickt die Gebinde als JSON mit Token", async () => {
        const fetchMock =
            vi.spyOn(globalThis, "fetch").mockResolvedValue(
                new Response(JSON.stringify(position("Kopfsalat", 1, 3)), { status: 200 })
            );

        await setGebinde("kopf salat", 1);

        const [url, options] =
            fetchMock.mock.calls[0];

        expect(url).toMatch(/organisation\/bestellung\/produkte\/kopf%20salat$/);
        expect(options.method).toBe("PUT");
        expect(JSON.parse(options.body)).toEqual({ gebinde: 1 });
        expect(options.headers.get("Authorization")).toBe("Bearer token-123");
    });

    it("meldet fehlende Rolle verständlich", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(null, { status: 403 })
        );

        await expect(getBestellung()).rejects.toThrow(
            "Dafür fehlt dir die Rolle Organisator."
        );
    });
});
