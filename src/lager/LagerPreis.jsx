import React from "react";

import {
    Box,
    Chip,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";

import { euro } from "../historie/format.js";

import {
    chargenVon,
    mehrerePreise,
    naechsterPreis,
} from "./chargen.js";


const DATUM =
    new Intl.DateTimeFormat("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });

const MENGE =
    new Intl.NumberFormat("de-DE", {
        maximumFractionDigits: 3,
    });


const seit = charge => {
    if (!charge.eingelagertAm) {
        return null;
    }

    const datum =
        new Date(charge.eingelagertAm);

    // Altbestand von vor der Umstellung hat kein echtes Datum
    return Number.isNaN(datum.getTime()) || datum.getFullYear() <= 2000
        ? "Altbestand"
        : `seit ${DATUM.format(datum)}`;
};


/**
 * Bestand nach Preisen, älteste Lieferung zuerst (wird zuerst verkauft).
 */
export function ChargenListe({ produkt, dicht = false }) {
    const chargen =
        chargenVon(produkt);

    const einheit =
        produkt?.lagerbestand?.einheit?.name ?? "";

    if (chargen.length === 0) {
        return (
            <Typography
                variant="body2"
                color="text.secondary"
            >
                Kein Bestand.
            </Typography>
        );
    }

    return (
        <Stack
            component="ol"
            spacing={dicht ? 0.25 : 0.5}
            sx={{
                m: 0,
                p: 0,
                listStyle: "none",
            }}
        >
            {chargen.map((charge, index) => (
                <Stack
                    component="li"
                    key={`${index}-${charge.preis}`}
                    direction="row"
                    spacing={1}
                    sx={{
                        alignItems: "baseline",
                    }}
                >
                    <Typography
                        variant="body2"
                        sx={{
                            fontVariantNumeric: "tabular-nums",
                        }}
                    >
                        {MENGE.format(charge.menge)}{" "}{einheit} à {euro(charge.preis)}
                    </Typography>

                    {!dicht && seit(charge) && (
                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            {seit(charge)}
                        </Typography>
                    )}

                    {index === 0 && chargen.length > 1 && (
                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            · wird zuerst verkauft
                        </Typography>
                    )}
                </Stack>
            ))}
        </Stack>
    );
}


/**
 * Preis in Tabellen: der Preis, zu dem als Nächstes verkauft wird.
 * Bei Ware zu mehreren Preisen mit Hinweis und Aufschlüsselung.
 */
export function LagerPreis({ produkt }) {
    const chargen =
        chargenVon(produkt);

    if (!mehrerePreise(chargen)) {
        return (
            <span>
                {euro(naechsterPreis(produkt))}
            </span>
        );
    }

    return (
        <Tooltip
            arrow
            title={
                <Box sx={{ p: 0.5 }}>
                    <Typography
                        variant="caption"
                        sx={{
                            display: "block",
                            fontWeight: 700,
                            mb: 0.5,
                        }}
                    >
                        Ware zu verschiedenen Preisen
                    </Typography>

                    <ChargenListe
                        produkt={produkt}
                        dicht
                    />
                </Box>
            }
        >
            <Stack
                direction="row"
                spacing={0.75}
                sx={{
                    alignItems: "center",
                }}
            >
                <span>
                    {euro(naechsterPreis(produkt))}
                </span>

                <Chip
                    size="small"
                    variant="outlined"
                    label={`${new Set(chargen.map(c => Number(c.preis).toFixed(2))).size} Preise`}
                    sx={{
                        height: 20,
                        fontSize: 11,
                    }}
                />
            </Stack>
        </Tooltip>
    );
}
