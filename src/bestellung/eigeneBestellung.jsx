import React from "react";

import {
    TableCell,
    TableRow,
    Typography,
} from "@mui/material";

import {
    darken,
    lighten,
} from "@mui/material/styles";


/**
 * ============================================================================
 * Eigene Bestellung der Woche oben in der Bestelltabelle
 * ============================================================================
 *
 * Produkte, die man in dieser Runde schon bestellt hat (gespeichert, nicht
 * nur eingetippt), stehen oben und sind hervorgehoben. Darunter folgen die
 * übrigen Produkte in der gewohnten Reihenfolge.
 */

/** Schon in dieser Runde bestellt (gespeicherte Menge > 0)? */
export const istBestellt = produkt =>
    Number(produkt?.bestellmengeNeu ?? 0) > 0;


/** Bestellte Produkte nach oben – sonst bleibt die Reihenfolge gleich. */
export const eigeneZuerst = produkte => [
    ...produkte.filter(istBestellt),
    ...produkte.filter(produkt => !istBestellt(produkt)),
];


/**
 * Überschrift vor einer Zeile: vor der ersten bestellten und vor der
 * ersten nicht bestellten Zeile. Nur ohne eigene Spaltensortierung – sonst
 * sind die Gruppen aufgelöst.
 */
export const gruppeVor = (zeilen, index, sortiert) => {
    if (sortiert) {
        return null;
    }

    const anzahl =
        zeilen.filter(zeile => istBestellt(zeile.original)).length;

    if (anzahl === 0) {
        return null;
    }

    if (index === 0) {
        return {
            text: "Deine Bestellung diese Woche",
            anzahl,
        };
    }

    if (index === anzahl) {
        return {
            text: "Weitere Produkte",
            anzahl: zeilen.length - anzahl,
        };
    }

    return null;
};


/** Deckende Markierungsfarbe (auch für die fixierte Produktspalte). */
export const markierung = theme =>
    theme.palette.mode === "dark"
        ? darken(theme.palette.primary.main, 0.75)
        : lighten(theme.palette.primary.main, 0.92);


/** Trennzeile mit Überschrift über die ganze Tabellenbreite. */
export function GruppenZeile({ gruppe, spalten }) {
    return (
        <TableRow>
            <TableCell
                colSpan={spalten}
                sx={{
                    py: 0.75,
                    bgcolor: "action.hover",
                    borderBottom: 1,
                    borderColor: "divider",
                }}
            >
                <Typography
                    variant="caption"
                    sx={{
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: 0.4,
                        color: "text.secondary",
                        // Auf schmalen Bildschirmen beim Scrollen sichtbar bleiben
                        position: "sticky",
                        left: 16,
                    }}
                >
                    {gruppe.text} ({gruppe.anzahl})
                </Typography>
            </TableCell>
        </TableRow>
    );
}
