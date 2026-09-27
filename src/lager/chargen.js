/**
 * ============================================================================
 * Lagerware zu unterschiedlichen Preisen
 * ============================================================================
 *
 * Jede Lieferung ist eine Charge { menge, preis }, älteste zuerst. Beim
 * Einkauf wird die älteste zuerst verkauft – gleiche Rechnung wie im
 * Backend (LagerChargenService.preisFuer), damit Anzeige und Abrechnung
 * übereinstimmen.
 */

const EPSILON = 0.0005;


const runden2 = wert =>
    Math.round(wert * 100) / 100;


/** Chargen eines Produkts; ohne Angabe: der ganze Bestand zum aktuellen Preis. */
export const chargenVon = produkt => {
    if (Array.isArray(produkt?.chargen) && produkt.chargen.length > 0) {
        return produkt.chargen;
    }

    const ist =
        Number(produkt?.lagerbestand?.istLagerbestand ?? 0);

    return ist > EPSILON
        ? [{ menge: ist, preis: Number(produkt?.preis ?? 0) }]
        : [];
};


/**
 * Betrag für eine Menge: älteste Chargen zuerst, Rest zum Ersatzpreis.
 * Liefert { betrag, teile: [{ menge, preis }] }.
 */
export const preisFuer = (chargen, menge, ersatzpreis = 0) => {
    const teile = [];
    let rest = Number(menge) || 0;

    for (const charge of chargen) {
        if (rest <= EPSILON) {
            break;
        }

        const genommen =
            Math.min(rest, Number(charge.menge) || 0);

        if (genommen > EPSILON) {
            teile.push({
                menge: genommen,
                preis: Number(charge.preis) || 0,
            });

            rest -= genommen;
        }
    }

    if (rest > EPSILON) {
        teile.push({
            menge: rest,
            preis: Number(ersatzpreis) || 0,
        });
    }

    return {
        betrag: runden2(
            teile.reduce((acc, t) => acc + t.menge * t.preis, 0)
        ),
        teile,
    };
};


/** Preis für die Menge eines Produkts. */
export const preisFuerProdukt = (produkt, menge) =>
    preisFuer(
        chargenVon(produkt),
        menge,
        produkt?.preis
    );


/** Gibt es Ware zu verschiedenen Preisen? */
export const mehrerePreise = chargen =>
    new Set(
        chargen.map(c => Number(c.preis).toFixed(2))
    ).size > 1;


/** Preis, zu dem als Nächstes verkauft wird (älteste Charge). */
export const naechsterPreis = produkt =>
    chargenVon(produkt)[0]?.preis ??
    produkt?.preis ??
    0;
