import React, {
    useMemo,
    useState,
} from "react";

import {
    Box,
    Typography,
} from "@mui/material";

import {
    ChartCard,
    ChartTable,
} from "../charts/ChartCard.jsx";
import { ColumnChart } from "../charts/ColumnChart.jsx";
import { FilterChips } from "../charts/FilterChips.jsx";
import { LineChart } from "../charts/LineChart.jsx";
import { RankedBars } from "../charts/RankedBars.jsx";
import { StatTile } from "../charts/StatTile.jsx";

import {
    TYP_FARBEN,
    TYP_LABELS,
    datumKurz,
    euro,
    euroKurz,
    kalenderwoche,
    zahl,
} from "./format.js";


// Validierte Kategorie-Reihenfolge; Lieferkosten als neutrales Grau
export const AUSGABEN_SERIEN = [
    { key: "frisch", label: TYP_LABELS.FRISCH, color: TYP_FARBEN.FRISCH },
    { key: "brot", label: TYP_LABELS.BROT, color: TYP_FARBEN.BROT },
    { key: "lager", label: TYP_LABELS.LAGER, color: TYP_FARBEN.LAGER },
    { key: "zuViel", label: TYP_LABELS.ZU_VIEL, color: TYP_FARBEN.ZU_VIEL },
    { key: "lieferkosten", label: "Lieferkosten", color: "#9AA39D" },
];

// Linien: Kategorie-Palette in fester Reihenfolge
const LINIEN_FARBEN = [
    "#2a78d6",
    "#eb6834",
    "#1baf7a",
    "#eda100",
    "#e87ba4",
];

const ZEITRAEUME = [
    { value: 12, label: "12 Wochen" },
    { value: 26, label: "26 Wochen" },
    { value: 0, label: "Alles" },
];


const prozent = value =>
    `${value > 0 ? "+" : ""}${zahl(Math.round(value * 10) / 10)} %`;


/**
 * Statistik für eine Person (eigenes Profil oder Admin-Ansicht).
 */
export function PersonStatistik({
    historie,
}) {
    const [
        zeitraum,
        setZeitraum,
    ] = useState(12);


    const runden =
        useMemo(
            () => {
                const sortiert =
                    [...historie.runden].sort(
                        (a, b) =>
                            new Date(a.start) - new Date(b.start)
                    );

                return zeitraum
                    ? sortiert.slice(-zeitraum)
                    : sortiert;
            },
            [
                historie,
                zeitraum,
            ]
        );


    // Ausgaben je Runde, aufgeteilt nach Kategorie
    const wochen =
        useMemo(
            () =>
                runden
                    .filter(runde => runde.einkaeufe.length > 0)
                    .map(runde => {
                        const summe = key =>
                            runde.einkaeufe.reduce(
                                (acc, einkauf) => acc + (einkauf[key] || 0),
                                0
                            );

                        return {
                            key: runde.deadlineId,
                            label: kalenderwoche(runde.ende ?? runde.start),
                            tooltipTitle: `${kalenderwoche(runde.ende ?? runde.start)} (bis ${datumKurz(runde.ende)})`,
                            values: {
                                frisch: summe("frisch"),
                                brot: summe("brot"),
                                lager: summe("lager"),
                                zuViel: summe("zuViel"),
                                lieferkosten: summe("lieferkosten"),
                            },
                            gesamt: runde.ausgegeben,
                        };
                    }),
            [runden]
        );


    const kennzahlen =
        useMemo(
            () => {
                const gesamt =
                    wochen.reduce((acc, w) => acc + w.gesamt, 0);

                const letzte =
                    wochen[wochen.length - 1];

                const vorher =
                    wochen[wochen.length - 2];

                const positionen =
                    runden.flatMap(r => r.bestellungen);

                const vergleichbar =
                    positionen.filter(p => p.differenz !== null);

                // ±5 % Toleranz: Gewichtsware trifft selten aufs Gramm
                const genau =
                    vergleichbar.filter(p =>
                        Math.abs(p.differenz) <= Math.max(0.0005, p.bestellt * 0.05)
                    );

                return {
                    gesamt,
                    schnitt:
                        wochen.length
                            ? gesamt / wochen.length
                            : 0,
                    letzte,
                    vorher,
                    genauigkeit:
                        vergleichbar.length
                            ? genau.length / vergleichbar.length
                            : null,
                    nichtAbgeholt:
                        positionen.filter(p => p.status === "NICHT_ABGEHOLT").length,
                };
            },
            [
                wochen,
                runden,
            ]
        );


    // Preisentwicklung, indexiert: Veränderung in % seit dem ersten Wert
    const preisSerien =
        useMemo(
            () =>
                historie.preisVerlauf.map((verlauf, index) => {
                    const basis =
                        Number(verlauf.punkte[0]?.preis) || 1;

                    return {
                        key: verlauf.produktId,
                        label: verlauf.produkt,
                        color: LINIEN_FARBEN[index % LINIEN_FARBEN.length],
                        points: verlauf.punkte.map(punkt => {
                            const preis =
                                Number(punkt.preis);

                            const veraenderung =
                                (preis / basis - 1) * 100;

                            return {
                                x: punkt.datum,
                                y: veraenderung,
                                tooltip: `${euro(preis)}/${verlauf.einheit ?? "Stück"} (${prozent(veraenderung)})`,
                            };
                        }),
                    };
                }),
            [historie]
        );


    const lieblingsprodukte =
        useMemo(
            () => {
                const zaehler =
                    new Map();

                runden
                    .flatMap(r => r.bestellungen)
                    .forEach(p => {
                        const eintrag =
                            zaehler.get(p.produkt) ?? {
                                anzahl: 0,
                                typ: p.typ,
                            };

                        eintrag.anzahl += 1;
                        zaehler.set(p.produkt, eintrag);
                    });

                return [...zaehler.entries()]
                    .sort((a, b) => b[1].anzahl - a[1].anzahl)
                    .slice(0, 8)
                    .map(([produkt, eintrag]) => ({
                        key: produkt,
                        label: produkt,
                        value: eintrag.anzahl,
                        detail: `${eintrag.anzahl}× bestellt (${TYP_LABELS[eintrag.typ]})`,
                    }));
            },
            [runden]
        );


    const differenz =
        kennzahlen.letzte && kennzahlen.vorher
            ? kennzahlen.letzte.gesamt - kennzahlen.vorher.gesamt
            : null;


    return (
        <Box>
            {/* Zeitraum gilt für alle Kennzahlen und Diagramme darunter */}
            <FilterChips
                options={ZEITRAEUME}
                value={zeitraum}
                onChange={setZeitraum}
                ariaLabel="Zeitraum"
                sx={{
                    mb: 2,
                }}
            />


            <Box
                sx={{
                    display: "grid",
                    gap: 2,
                    gridTemplateColumns: {
                        xs: "repeat(2, minmax(0, 1fr))",
                        md: "repeat(4, minmax(0, 1fr))",
                    },
                    mb: 2,
                }}
            >
                <StatTile
                    label="Ausgegeben"
                    value={euro(kennzahlen.gesamt)}
                    hint={`${wochen.length} Einkaufswochen`}
                />

                <StatTile
                    label="Ø pro Woche"
                    value={euro(kennzahlen.schnitt)}
                    hint="nur Wochen mit Einkauf"
                />

                <StatTile
                    label="Letzte Einkaufswoche"
                    value={
                        kennzahlen.letzte
                            ? euro(kennzahlen.letzte.gesamt)
                            : "–"
                    }
                    delta={
                        differenz === null
                            ? undefined
                            : {
                                text: `${differenz >= 0 ? "+" : "−"}${euro(Math.abs(differenz))} zur Woche davor`,
                                direction:
                                    Math.abs(differenz) < 0.005
                                        ? "flat"
                                        : differenz > 0
                                            ? "up"
                                            : "down",
                            }
                    }
                    hint="noch kein Vergleich"
                />

                <StatTile
                    label="Wie bestellt genommen"
                    value={
                        kennzahlen.genauigkeit === null
                            ? "–"
                            : `${Math.round(kennzahlen.genauigkeit * 100)} %`
                    }
                    hint={
                        kennzahlen.nichtAbgeholt
                            ? `${kennzahlen.nichtAbgeholt} Positionen nicht abgeholt`
                            : "Positionen mit höchstens ±5 % Abweichung"
                    }
                />
            </Box>


            <Box
                sx={{
                    display: "grid",
                    gap: 2,
                    gridTemplateColumns: {
                        xs: "minmax(0, 1fr)",
                        lg: "minmax(0, 3fr) minmax(0, 2fr)",
                    },
                }}
            >
                <ChartCard
                    title="Ausgaben pro Woche"
                    subtitle="Nach Bestellrunde, aufgeteilt nach Kategorie"
                    legend={AUSGABEN_SERIEN.map(s => ({ ...s, shape: "rect" }))}
                    table={
                        <ChartTable
                            columns={[
                                { key: "label", label: "Woche" },
                                ...AUSGABEN_SERIEN.map(s => ({
                                    key: s.key,
                                    label: s.label,
                                    align: "right",
                                    format: (_, row) => euro(row.values[s.key]),
                                })),
                                { key: "gesamt", label: "Gesamt", align: "right", format: v => euro(v) },
                            ]}
                            rows={[...wochen].reverse()}
                        />
                    }
                >
                    {wochen.length === 0 ? (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                py: 6,
                                textAlign: "center",
                            }}
                        >
                            Im Zeitraum gibt es noch keine Einkäufe.
                        </Typography>
                    ) : (
                        <ColumnChart
                            data={wochen}
                            series={AUSGABEN_SERIEN}
                            formatValue={euro}
                            formatTick={euroKurz}
                            ariaLabel="Ausgaben pro Woche"
                        />
                    )}
                </ChartCard>


                <ChartCard
                    title="Deine häufigsten Produkte"
                    subtitle="Anzahl Bestellungen im Zeitraum"
                >
                    <RankedBars
                        items={lieblingsprodukte}
                        formatValue={value => `${value}×`}
                        emptyText="Im Zeitraum wurde nichts bestellt."
                    />
                </ChartCard>


                {preisSerien.length > 0 && (
                    <ChartCard
                        title="Preisentwicklung deiner Produkte"
                        subtitle="Veränderung seit dem ersten erfassten Preis – so siehst du, ob Preise steigen"
                        legend={preisSerien.map(s => ({ label: s.label, color: s.color, shape: "line" }))}
                        table={
                            <ChartTable
                                columns={[
                                    { key: "produkt", label: "Produkt" },
                                    { key: "erster", label: "Erster Preis", align: "right" },
                                    { key: "aktuell", label: "Aktuell", align: "right" },
                                    { key: "veraenderung", label: "Veränderung", align: "right" },
                                ]}
                                rows={historie.preisVerlauf.map(v => {
                                    const erster = Number(v.punkte[0]?.preis) || 0;
                                    const aktuell = Number(v.punkte[v.punkte.length - 1]?.preis) || 0;

                                    return {
                                        key: v.produktId,
                                        produkt: v.produkt,
                                        erster: euro(erster),
                                        aktuell: euro(aktuell),
                                        veraenderung: erster ? prozent((aktuell / erster - 1) * 100) : "–",
                                    };
                                })}
                            />
                        }
                        sx={{
                            gridColumn: {
                                lg: "1 / -1",
                            },
                        }}
                    >
                        <LineChart
                            series={preisSerien}
                            baseline={0}
                            formatValue={prozent}
                            formatTick={value => `${zahl(value)} %`}
                            formatX={datumKurz}
                            ariaLabel="Preisentwicklung"
                        />
                    </ChartCard>
                )}
            </Box>
        </Box>
    );
}
