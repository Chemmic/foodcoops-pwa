import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

import {
    TYP_LABELS,
    datum,
    datumZeit,
    euro,
    kalenderwoche,
    menge,
    zahl,
} from "./format.js";


const FOODCOOP = "FoodCoop MiKa";

export const GRUEN = [63, 111, 80];
export const TEXT = [31, 40, 34];
export const GRAU = [104, 113, 107];


export function kopf(
    doc,
    titel,
    zeilen
) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...GRUEN);
    doc.text(FOODCOOP, 14, 16);

    doc.setFontSize(20);
    doc.setTextColor(...TEXT);
    doc.text(titel, 14, 27);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...GRAU);

    zeilen.forEach((zeile, index) =>
        doc.text(zeile, 14, 35 + index * 5)
    );

    doc.setDrawColor(226, 230, 225);
    doc.line(14, 38 + zeilen.length * 5, 196, 38 + zeilen.length * 5);

    return 44 + zeilen.length * 5;
}


export function fuss(doc, hinweis) {
    const seiten =
        doc.getNumberOfPages();

    for (let i = 1; i <= seiten; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...GRAU);

        if (hinweis) {
            doc.text(hinweis, 14, 284, { maxWidth: 150 });
        }

        doc.text(
            `Seite ${i} von ${seiten}`,
            196,
            284,
            { align: "right" }
        );
    }
}


export const TABELLE = {
    theme: "plain",
    styles: {
        font: "helvetica",
        fontSize: 9,
        textColor: TEXT,
        cellPadding: { top: 2, bottom: 2, left: 2, right: 2 },
    },
    headStyles: {
        fontStyle: "bold",
        textColor: GRAU,
        lineWidth: { bottom: 0.3 },
        lineColor: [226, 230, 225],
    },
    bodyStyles: {
        lineWidth: { bottom: 0.1 },
        lineColor: [236, 239, 235],
    },
    margin: { left: 14, right: 14 },
};


export function dateiname(...teile) {
    return `${teile
        .filter(Boolean)
        .join("_")
        .replace(/[^\p{L}\p{N}_.-]+/gu, "-")}.pdf`;
}


// =============================================================================
// Rechnung zu einem Einkauf
// =============================================================================

export function rechnungAlsPdf({
    einkauf,
    runde,
    personId,
    personName,
}) {
    const doc =
        new jsPDF();

    let y =
        kopf(
            doc,
            "Rechnung",
            [
                `Mitglied: ${personName ? `${personName} (${personId})` : personId}`,
                `Eingekauft am ${datumZeit(einkauf.datum)}`,
                `Bestellrunde ${kalenderwoche(runde?.ende ?? runde?.start)} (bis ${datum(runde?.ende)})`,
            ]
        );


    autoTable(doc, {
        ...TABELLE,
        startY: y,
        head: [[
            "Art",
            "Produkt",
            "Bestellt",
            "Menge",
            "Einzelpreis",
            "Summe",
        ]],
        body: einkauf.positionen.map(p => [
            TYP_LABELS[p.typ] ?? p.typ,
            p.produkt,
            p.bestellt === null
                ? "–"
                : menge(p.bestellt, p.spezialfall ? "Stück" : p.einheit),
            menge(p.menge, p.einheit),
            p.preis === null ? "–" : euro(p.preis),
            p.summe === null ? "–" : euro(p.summe),
        ]),
        columnStyles: {
            2: { halign: "right" },
            3: { halign: "right" },
            4: { halign: "right" },
            5: { halign: "right" },
        },
    });


    y = doc.lastAutoTable.finalY + 8;

    const summen = [
        ["Frischware", einkauf.frisch],
        ["Brot", einkauf.brot],
        ["Lagerware", einkauf.lager],
        ["Zu viel", einkauf.zuViel],
    ].filter(([, betrag]) => betrag > 0);

    autoTable(doc, {
        ...TABELLE,
        startY: y,
        margin: { left: 110, right: 14 },
        body: [
            ...summen.map(([label, betrag]) => [label, euro(betrag)]),
            ["Lieferkosten", euro(einkauf.lieferkosten)],
            [
                {
                    content: "Gesamt",
                    styles: { fontStyle: "bold", fontSize: 11 },
                },
                {
                    content: euro(einkauf.gesamt),
                    styles: { fontStyle: "bold", fontSize: 11 },
                },
            ],
        ],
        columnStyles: {
            1: { halign: "right" },
        },
    });


    fuss(
        doc,
        "Einzelpreise nach Preisstand der Einkaufswoche. Maßgeblich sind die beim Einkauf berechneten Summen."
    );

    doc.save(
        dateiname(
            "Rechnung",
            personId,
            datum(einkauf.datum)
        )
    );
}


// =============================================================================
// Bestellübersicht einer Runde
// =============================================================================

export function bestelluebersichtAlsPdf({
    runde,
    personId,
    personName,
}) {
    const doc =
        new jsPDF();

    let y =
        kopf(
            doc,
            "Bestellübersicht",
            [
                `Mitglied: ${personName ? `${personName} (${personId})` : personId}`,
                `Bestellrunde ${kalenderwoche(runde.ende ?? runde.start)}: ${datum(runde.start)} bis ${datum(runde.ende)}`,
            ]
        );


    const STATUS = {
        OFFEN: "offen",
        GENOMMEN: "genommen",
        NICHT_ABGEHOLT: "nicht abgeholt",
    };

    autoTable(doc, {
        ...TABELLE,
        startY: y,
        head: [[
            "Art",
            "Produkt",
            "Bestellt",
            "Genommen",
            "Differenz",
            "Preis",
            "Status",
        ]],
        body: runde.bestellungen.map(p => [
            TYP_LABELS[p.typ] ?? p.typ,
            p.produkt,
            menge(p.bestellt, p.spezialfall ? "Stück" : p.einheit),
            p.genommen === null ? "–" : menge(p.genommen, p.einheit),
            p.differenz === null || p.differenz === 0
                ? "–"
                : `${p.differenz > 0 ? "+" : ""}${zahl(p.differenz)}`,
            p.preis === null ? "–" : `${euro(p.preis)}/${p.einheit ?? "Stück"}`,
            STATUS[p.status] ?? p.status,
        ]),
        columnStyles: {
            2: { halign: "right" },
            3: { halign: "right" },
            4: { halign: "right" },
            5: { halign: "right" },
        },
    });


    y = doc.lastAutoTable.finalY + 8;

    autoTable(doc, {
        ...TABELLE,
        startY: y,
        margin: { left: 110, right: 14 },
        body: [
            ["Geschätzter Bestellwert", euro(runde.geschaetzterBestellwert)],
            [
                {
                    content: "Tatsächlich ausgegeben",
                    styles: { fontStyle: "bold" },
                },
                {
                    content: euro(runde.ausgegeben),
                    styles: { fontStyle: "bold" },
                },
            ],
        ],
        columnStyles: {
            1: { halign: "right" },
        },
    });


    fuss(
        doc,
        "Der geschätzte Bestellwert enthält keine Lieferkosten und keine Produkte, die nach Gewicht abgerechnet werden."
    );

    doc.save(
        dateiname(
            "Bestelluebersicht",
            personId,
            kalenderwoche(runde.ende ?? runde.start)
        )
    );
}
