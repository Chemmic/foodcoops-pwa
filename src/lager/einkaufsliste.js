/**
 * ============================================================================
 * Einkaufsliste für das Lager
 * ============================================================================
 *
 * Was muss gekauft werden, um den Soll-Bestand aufzufüllen? Nur Produkte
 * unter Soll erscheinen – bei Ist ≥ Soll fehlt nichts.
 *
 * Reihenfolge wie im Lager (Platz in der Liste), gruppiert nach Kategorie.
 */

const EPSILON = 0.0005;


const runden3 = wert =>
    Math.round(wert * 1000) / 1000;


/** Eine Position der Einkaufsliste oder null, wenn nichts fehlt. */
export const fehlmenge = produkt => {
    const ist =
        Number(produkt?.lagerbestand?.istLagerbestand ?? 0);

    const soll =
        Number(produkt?.lagerbestand?.sollLagerbestand ?? 0);

    const fehlt =
        runden3(soll - ist);

    if (!(fehlt > EPSILON)) {
        return null;
    }

    const preis =
        Number(produkt?.preis ?? 0);

    return {
        id: produkt.id,
        name: produkt.name,
        kategorie: produkt.kategorie?.name ?? "Ohne Kategorie",
        einheit: produkt.lagerbestand?.einheit?.name ?? "",
        ist,
        soll,
        fehlt,
        preis,
        // Schätzung zum aktuellen Preis
        summe: Math.round(fehlt * preis * 100) / 100,
        fuellstand: soll > 0 ? Math.max(0, Math.min(1, ist / soll)) : 0,
    };
};


/**
 * Einkaufsliste aus allen Lagerprodukten.
 *
 * Liefert { gruppen: [{ kategorie, positionen }], anzahl, summe }.
 */
export const einkaufsliste = produkte => {
    const gruppen =
        new Map();

    [...(produkte ?? [])]
        .sort((a, b) =>
            (a.sortierung ?? Infinity) - (b.sortierung ?? Infinity) ||
            (a.name ?? "").localeCompare(b.name ?? "", "de")
        )
        .map(fehlmenge)
        .filter(Boolean)
        .forEach(position => {
            const gruppe =
                gruppen.get(position.kategorie) ?? {
                    kategorie: position.kategorie,
                    positionen: [],
                };

            gruppe.positionen.push(position);
            gruppen.set(position.kategorie, gruppe);
        });

    const liste =
        [...gruppen.values()];

    const positionen =
        liste.flatMap(g => g.positionen);

    return {
        gruppen: liste,
        anzahl: positionen.length,
        summe: Math.round(positionen.reduce((acc, p) => acc + p.summe, 0) * 100) / 100,
    };
};
