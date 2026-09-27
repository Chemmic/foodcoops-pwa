/**
 * Formatierung für Historie, Statistik und PDFs.
 */

const EURO =
    new Intl.NumberFormat(
        "de-DE",
        {
            style: "currency",
            currency: "EUR",
        }
    );

const EURO_KURZ =
    new Intl.NumberFormat(
        "de-DE",
        {
            style: "currency",
            currency: "EUR",
            maximumFractionDigits: 0,
        }
    );

const ZAHL =
    new Intl.NumberFormat(
        "de-DE",
        {
            maximumFractionDigits: 3,
        }
    );

const DATUM =
    new Intl.DateTimeFormat(
        "de-DE",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }
    );

const DATUM_KURZ =
    new Intl.DateTimeFormat(
        "de-DE",
        {
            day: "2-digit",
            month: "2-digit",
        }
    );

const DATUM_ZEIT =
    new Intl.DateTimeFormat(
        "de-DE",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
    );


const toDate = value => {
    if (!value) {
        return null;
    }

    const date =
        value instanceof Date
            ? value
            : new Date(value);

    return Number.isNaN(date.getTime())
        ? null
        : date;
};


export const euro = value =>
    EURO.format(
        Number(value) || 0
    );


export const euroKurz = value =>
    EURO_KURZ.format(
        Number(value) || 0
    );


export const zahl = value =>
    value === null ||
    value === undefined
        ? "–"
        : ZAHL.format(
            Number(value)
        );


export const menge = (
    value,
    einheit
) =>
    value === null ||
    value === undefined
        ? "–"
        : `${zahl(value)} ${einheit ?? ""}`.trim();


export const datum = value => {
    const date =
        toDate(value);

    return date
        ? DATUM.format(date)
        : "–";
};


export const datumKurz = value => {
    const date =
        toDate(value);

    return date
        ? DATUM_KURZ.format(date)
        : "–";
};


export const datumZeit = value => {
    const date =
        toDate(value);

    return date
        ? `${DATUM_ZEIT.format(date)} Uhr`
        : "–";
};


/**
 * ISO-Kalenderwoche, z.B. "KW 39".
 */
export const kalenderwoche = value => {
    const date =
        toDate(value);

    if (!date) {
        return "–";
    }

    const d =
        new Date(
            Date.UTC(
                date.getFullYear(),
                date.getMonth(),
                date.getDate()
            )
        );

    const day =
        d.getUTCDay() || 7;

    d.setUTCDate(
        d.getUTCDate() + 4 - day
    );

    const yearStart =
        new Date(
            Date.UTC(
                d.getUTCFullYear(),
                0,
                1
            )
        );

    const week =
        Math.ceil(
            ((d - yearStart) / 86400000 + 1) / 7
        );

    return `KW ${week}`;
};


export const TYP_LABELS = {
    FRISCH: "Frisch",
    BROT: "Brot",
    LAGER: "Lager",
    ZU_VIEL: "Zu viel",
};


/**
 * Kategorie-Farben (validierte Reihenfolge: blau, orange, aqua, gelb).
 * Nur für Markierungen – Texte bleiben in den Textfarben.
 */
export const TYP_FARBEN = {
    FRISCH: "#2a78d6",
    BROT: "#eb6834",
    LAGER: "#1baf7a",
    ZU_VIEL: "#eda100",
};


export const RUNDEN_STATUS = {
    AKTUELL: {
        label: "Bestellphase",
        color: "info",
    },
    EINKAUF: {
        label: "Jetzt einkaufbar",
        color: "success",
    },
    ABGESCHLOSSEN: {
        label: "Abgeschlossen",
        color: "default",
    },
};


/**
 * Wochen-Beschriftung einer Runde: Ende der Bestellphase.
 */
export const rundenLabel = runde =>
    runde?.ende
        ? `${kalenderwoche(runde.ende)} · bis ${datumKurz(runde.ende)}`
        : kalenderwoche(runde?.start);
