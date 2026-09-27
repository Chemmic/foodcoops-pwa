/**
 * Reihenfolge der Frischwaren (wie die Frischwaren-Liste des Händlers).
 */

/** Eintrag von Index `von` an Index `nach` verschieben (neue Liste). */
export const verschieben = (liste, von, nach) => {
    if (
        von === nach ||
        von < 0 ||
        von >= liste.length
    ) {
        return liste;
    }

    const ziel =
        Math.max(0, Math.min(liste.length - 1, nach));

    const neu =
        [...liste];

    const [eintrag] =
        neu.splice(von, 1);

    neu.splice(ziel, 0, eintrag);

    return neu;
};


/** Eintrag an einen Platz setzen (1 = oben); ungültige Plätze werden begrenzt. */
export const anPlatz = (liste, index, platz) => {
    const zahl =
        Math.round(Number(platz));

    if (!Number.isFinite(zahl)) {
        return liste;
    }

    return verschieben(liste, index, zahl - 1);
};


/**
 * Neuer Index beim Ziehen: Wie viele Zeilen-Mitten liegen über dem Zeiger?
 * Die gezogene Zeile selbst wird dabei herausgerechnet.
 *
 * mitten: vertikale Mitte jeder Zeile (in Bildschirmkoordinaten)
 */
export const zielIndex = (mitten, y, von) => {
    const erste =
        mitten.findIndex(mitte => y < mitte);

    const luecke =
        erste === -1
            ? mitten.length
            : erste;

    return luecke > von
        ? luecke - 1
        : luecke;
};


/** Hat sich die Reihenfolge gegenüber vorher geändert? */
export const geaendert = (vorher, nachher) =>
    vorher.length !== nachher.length ||
    vorher.some((eintrag, index) => eintrag.id !== nachher[index].id);
