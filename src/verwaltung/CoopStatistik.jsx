import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Alert,
    Box,
    CircularProgress,
    Typography,
} from "@mui/material";

import {
    ChartCard,
    ChartTable,
} from "../charts/ChartCard.jsx";
import { ColumnChart } from "../charts/ColumnChart.jsx";
import { FilterChips } from "../charts/FilterChips.jsx";
import { RankedBars } from "../charts/RankedBars.jsx";
import { StatTile } from "../charts/StatTile.jsx";

import {
    TYP_LABELS,
    datumKurz,
    euro,
    euroKurz,
    kalenderwoche,
    zahl,
} from "../historie/format.js";
import { getStatistik } from "../historie/historieApi.js";
import { AUSGABEN_SERIEN } from "../historie/PersonStatistik.jsx";


const ZEITRAEUME = [
    { value: 12, label: "12 Wochen" },
    { value: 26, label: "26 Wochen" },
    { value: 52, label: "1 Jahr" },
];

const MITGLIEDER_SERIE = [
    { key: "aktiv", label: "Aktive Mitglieder", color: "#2a78d6" },
];


export function CoopStatistik() {
    const [
        zeitraum,
        setZeitraum,
    ] = useState(12);

    const [
        statistik,
        setStatistik,
    ] = useState(null);

    const [
        laedt,
        setLaedt,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState(null);

    const [
        rangliste,
        setRangliste,
    ] = useState("bestellungen");


    useEffect(() => {
        let aktiv = true;

        setLaedt(true);

        // +1: die laufende Runde wird unten herausgefiltert
        getStatistik(zeitraum + 1)
            .then(data => {
                if (aktiv) {
                    setStatistik(data);
                    setError(null);
                }
            })
            .catch(loadError => {
                if (aktiv) {
                    setError(loadError.message);
                }
            })
            .finally(() => {
                if (aktiv) {
                    setLaedt(false);
                }
            });

        return () => {
            aktiv = false;
        };
    }, [zeitraum]);


    // Laufende Bestellrunde ausnehmen – dort wurde noch nicht eingekauft
    const wochen =
        useMemo(
            () =>
                (statistik?.runden ?? [])
                    .filter(r => r.status !== "AKTUELL")
                    .slice()
                    .reverse()
                    .map(r => ({
                        key: r.deadlineId,
                        label: kalenderwoche(r.ende ?? r.start),
                        tooltipTitle: `${kalenderwoche(r.ende ?? r.start)} (bis ${datumKurz(r.ende)})`,
                        values: {
                            frisch: r.frisch,
                            brot: r.brot,
                            lager: r.lager,
                            zuViel: r.zuViel,
                            lieferkosten: r.lieferkosten,
                            aktiv: r.aktiveMitglieder,
                        },
                        runde: r,
                    })),
            [statistik]
        );


    const kennzahlen =
        useMemo(
            () => {
                const mitEinkauf =
                    wochen.filter(w => w.runde.einkaeufe > 0);

                const umsatz =
                    wochen.reduce((acc, w) => acc + w.runde.gesamt, 0);

                const einkaeufe =
                    wochen.reduce((acc, w) => acc + w.runde.einkaeufe, 0);

                const letzte =
                    mitEinkauf[mitEinkauf.length - 1]?.runde;

                const vorher =
                    mitEinkauf[mitEinkauf.length - 2]?.runde;

                return {
                    umsatz,
                    schnitt:
                        mitEinkauf.length
                            ? umsatz / mitEinkauf.length
                            : 0,
                    proEinkauf:
                        einkaeufe
                            ? umsatz / einkaeufe
                            : 0,
                    letzte,
                    vorher,
                };
            },
            [wochen]
        );


    const produkte =
        useMemo(
            () =>
                [...(statistik?.topProdukte ?? [])]
                    .sort((a, b) =>
                        rangliste === "umsatz"
                            ? b.umsatz - a.umsatz
                            : b.bestellungen - a.bestellungen
                    )
                    .slice(0, 10)
                    .map(p => ({
                        key: p.produktId,
                        label: p.produkt,
                        value:
                            rangliste === "umsatz"
                                ? p.umsatz
                                : p.bestellungen,
                        detail: `${TYP_LABELS[p.typ] ?? p.typ} · ${p.bestellungen}× bestellt von ${p.besteller} ${p.besteller === 1 ? "Person" : "Personen"}${p.menge ? ` · ${zahl(p.menge)} ${p.einheit ?? ""}` : ""}`,
                    })),
            [
                statistik,
                rangliste,
            ]
        );


    if (!statistik && laedt) {
        return (
            <Box
                sx={{
                    py: 8,
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }


    if (error && !statistik) {
        return (
            <Alert severity="error">
                {error}
            </Alert>
        );
    }


    const differenz =
        kennzahlen.letzte && kennzahlen.vorher
            ? kennzahlen.letzte.gesamt - kennzahlen.vorher.gesamt
            : null;


    return (
        <Box
            sx={{
                // Beim Nachladen den bisherigen Stand gedimmt stehen lassen
                opacity: laedt ? 0.5 : 1,
                transition: "opacity 150ms",
            }}
        >
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
                    label="Umsatz im Zeitraum"
                    value={euro(kennzahlen.umsatz)}
                    hint="inkl. Lieferkosten"
                />

                <StatTile
                    label="Ø Umsatz pro Woche"
                    value={euro(kennzahlen.schnitt)}
                    hint="Wochen mit Einkauf"
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
                    label="Mitglieder"
                    value={statistik.mitgliederGesamt}
                    hint={
                        kennzahlen.letzte
                            ? `${kennzahlen.letzte.aktiveMitglieder} aktiv in der letzten Einkaufswoche`
                            : undefined
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
                    title="Umsatz pro Woche"
                    subtitle={`Alle Einkäufe nach Bestellrunde · Ø pro Einkauf ${euro(kennzahlen.proEinkauf)}`}
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
                                { key: "gesamt", label: "Gesamt", align: "right", format: (_, row) => euro(row.runde.gesamt) },
                                { key: "einkaeufe", label: "Einkäufe", align: "right", format: (_, row) => row.runde.einkaeufe },
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
                            Im Zeitraum gibt es noch keine abgeschlossenen Runden.
                        </Typography>
                    ) : (
                        <ColumnChart
                            data={wochen}
                            series={AUSGABEN_SERIEN}
                            formatValue={euro}
                            formatTick={euroKurz}
                            ariaLabel="Umsatz pro Woche"
                        />
                    )}
                </ChartCard>


                <ChartCard
                    title="Beliebteste Produkte"
                    subtitle={
                        rangliste === "umsatz"
                            ? "Nach Umsatz (aktuelle Preise)"
                            : "Nach Anzahl Bestellungen"
                    }
                >
                    <FilterChips
                        options={[
                            { value: "bestellungen", label: "Bestellungen" },
                            { value: "umsatz", label: "Umsatz" },
                        ]}
                        value={rangliste}
                        onChange={setRangliste}
                        ariaLabel="Rangliste nach"
                        sx={{
                            mb: 2,
                        }}
                    />

                    <RankedBars
                        items={produkte}
                        formatValue={value =>
                            rangliste === "umsatz"
                                ? euroKurz(value)
                                : `${value}×`
                        }
                        emptyText="Im Zeitraum wurde nichts bestellt."
                    />
                </ChartCard>


                <ChartCard
                    title="Aktive Mitglieder pro Woche"
                    subtitle="Personen, die bestellt oder eingekauft haben"
                    table={
                        <ChartTable
                            columns={[
                                { key: "label", label: "Woche" },
                                { key: "aktiv", label: "Aktiv", align: "right", format: (_, row) => row.values.aktiv },
                                { key: "bestellungen", label: "Bestellungen", align: "right", format: (_, row) => row.runde.bestellungen },
                            ]}
                            rows={[...wochen].reverse()}
                        />
                    }
                    sx={{
                        gridColumn: {
                            lg: "1 / -1",
                        },
                    }}
                >
                    <ColumnChart
                        data={wochen}
                        series={MITGLIEDER_SERIE}
                        height={200}
                        formatValue={value => zahl(value)}
                        ariaLabel="Aktive Mitglieder pro Woche"
                    />
                </ChartCard>
            </Box>
        </Box>
    );
}
