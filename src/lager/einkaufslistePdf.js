import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

import {
    euro,
    zahl,
} from "../historie/format.js";

import {
    GRAU,
    GRUEN,
    TABELLE,
    TEXT,
    dateiname,
    fuss,
    kopf,
} from "../historie/pdf.js";


const DATUM =
    new Intl.DateTimeFormat("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });


/**
 * Einkaufsliste für das Lager als PDF: nach Kategorie gruppiert, mit
 * Kästchen zum Abhaken, Ist/Soll und geschätztem Preis.
 *
 * liste: Ergebnis von einkaufsliste(produkte)
 * speichern: false = nur das Dokument zurückgeben (z.B. für eine Vorschau)
 */
export function einkaufslisteAlsPdf(
    liste,
    {
        jetzt = new Date(),
        speichern = true,
    } = {}
) {
    const doc =
        new jsPDF();

    let y =
        kopf(
            doc,
            "Einkaufsliste Lager",
            [
                `Stand ${DATUM.format(jetzt)}`,
                `${liste.anzahl} ${liste.anzahl === 1 ? "Produkt" : "Produkte"} unter Soll · ca. ${euro(liste.summe)} zum aktuellen Preis`,
            ]
        );

    const body = [];

    liste.gruppen.forEach(gruppe => {
        // Zwischenzeile je Kategorie
        body.push([
            {
                content: gruppe.kategorie,
                colSpan: 6,
                styles: {
                    fontStyle: "bold",
                    textColor: GRUEN,
                    fillColor: [242, 245, 241],
                    cellPadding: { top: 3, bottom: 2, left: 2, right: 2 },
                },
            },
        ]);

        gruppe.positionen.forEach(p => {
            body.push([
                "",
                p.name,
                {
                    content: `${zahl(p.fehlt)} ${p.einheit}`.trim(),
                    styles: { fontStyle: "bold" },
                },
                `${zahl(p.ist)} / ${zahl(p.soll)}`,
                euro(p.preis),
                euro(p.summe),
            ]);
        });
    });

    autoTable(doc, {
        ...TABELLE,
        startY: y,
        head: [[
            "",
            "Produkt",
            "Kaufen",
            "Ist / Soll",
            "Preis",
            "ca. Summe",
        ]],
        body,
        columnStyles: {
            0: { cellWidth: 8 },
            2: { halign: "right", cellWidth: 26 },
            3: { halign: "right", cellWidth: 26, textColor: GRAU },
            4: { halign: "right", cellWidth: 22, textColor: GRAU },
            5: { halign: "right", cellWidth: 24 },
        },
        // Kästchen zum Abhaken
        didDrawCell: data => {
            if (
                data.section === "body" &&
                data.column.index === 0 &&
                data.row.raw.length === 6
            ) {
                const groesse = 3.2;
                const x = data.cell.x + (data.cell.width - groesse) / 2;
                const yKasten = data.cell.y + (data.cell.height - groesse) / 2;

                doc.setDrawColor(...GRAU);
                doc.setLineWidth(0.3);
                doc.rect(x, yKasten, groesse, groesse);
            }
        },
    });

    y = doc.lastAutoTable.finalY + 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...TEXT);
    doc.text(`Summe ca. ${euro(liste.summe)}`, 196, y, { align: "right" });

    fuss(doc, "Preise sind Schätzungen zum aktuellen Verkaufspreis im Lager.");

    if (speichern) {
        doc.save(
            dateiname("Einkaufsliste_Lager", DATUM.format(jetzt))
        );
    }

    return doc;
}
