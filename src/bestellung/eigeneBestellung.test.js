import {
    describe,
    expect,
    it,
} from "vitest";

import {
    eigeneZuerst,
    gruppeVor,
} from "./eigeneBestellung.jsx";


const produkte = [
    { id: "a", bestellmengeNeu: 0 },
    { id: "b", bestellmengeNeu: 2 },
    { id: "c", bestellmengeNeu: 0 },
    { id: "d", bestellmengeNeu: 1 },
];

const zeilen = liste => liste.map(original => ({ original }));


describe("eigene Bestellung oben", () => {
    it("stellt Bestelltes nach oben und behält sonst die Reihenfolge", () => {
        expect(eigeneZuerst(produkte).map(p => p.id)).toEqual(["b", "d", "a", "c"]);
    });

    it("setzt Überschriften vor die beiden Gruppen", () => {
        const sortiert = zeilen(eigeneZuerst(produkte));

        expect(gruppeVor(sortiert, 0, false)).toEqual({ text: "Deine Bestellung diese Woche", anzahl: 2 });
        expect(gruppeVor(sortiert, 1, false)).toBeNull();
        expect(gruppeVor(sortiert, 2, false)).toEqual({ text: "Weitere Produkte", anzahl: 2 });
    });

    it("ohne Bestellung oder bei eigener Sortierung keine Überschriften", () => {
        expect(gruppeVor(zeilen([{ bestellmengeNeu: 0 }]), 0, false)).toBeNull();
        expect(gruppeVor(zeilen(eigeneZuerst(produkte)), 0, true)).toBeNull();
    });
});
