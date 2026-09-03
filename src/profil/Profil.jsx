import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    CircularProgress,
    Divider,
    Paper,
    Stack,
    Typography,
} from "@mui/material";

import ExpandMoreOutlinedIcon
    from "@mui/icons-material/ExpandMoreOutlined";
import ReceiptLongOutlinedIcon
    from "@mui/icons-material/ReceiptLongOutlined";
import ShoppingBasketOutlinedIcon
    from "@mui/icons-material/ShoppingBasketOutlined";
import EuroOutlinedIcon
    from "@mui/icons-material/EuroOutlined";

import {
    useApi,
} from "../ApiService.jsx";

import {
    useAuth,
} from "../auth/AuthContext.jsx";


const moneyFormatter =
    new Intl.NumberFormat(
        "de-DE",
        {
            style: "currency",
            currency: "EUR",
        }
    );


const dateFormatter =
    new Intl.DateTimeFormat(
        "de-DE",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }
    );


function extractCollection(
    data
) {
    if (
        Array.isArray(data)
    ) {
        return data;
    }

    if (
        !data?._embedded
    ) {
        return [];
    }

    const embeddedValues =
        Object.values(
            data._embedded
        );

    const collection =
        embeddedValues.find(
            Array.isArray
        );

    return collection ?? [];
}


async function readJson(
    response
) {
    if (
        !response.ok
    ) {
        throw new Error(
            `Backend request failed: ${response.status}`
        );
    }

    return response.json();
}


function formatMoney(
    value
) {
    if (
        value === null ||
        value === undefined ||
        Number.isNaN(
            Number(value)
        )
    ) {
        return "–";
    }

    return moneyFormatter.format(
        Number(value)
    );
}


function formatDate(
    value
) {
    if (
        !value
    ) {
        return "Unbekannte Deadline";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "Unbekannte Deadline";
    }

    return dateFormatter.format(
        date
    );
}


function StatistikKarte({
    icon,
    label,
    value,
}) {
    return (
        <Paper
            variant="outlined"
            sx={{
                p: 2,
                flex: "1 1 180px",
                minWidth: 0,
            }}
        >
            <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                            "center",

                        width: 40,
                        height: 40,

                        borderRadius: 2,
                        bgcolor:
                            "action.hover",
                    }}
                >
                    {icon}
                </Box>

                <Box
                    sx={{
                        minWidth: 0,
                    }}
                >
                    <Typography
                        variant="caption"
                        color="text.secondary"
                    >
                        {label}
                    </Typography>

                    <Typography
                        variant="h6"
                        sx={{
                            lineHeight: 1.25,
                        }}
                    >
                        {value}
                    </Typography>
                </Box>
            </Stack>
        </Paper>
    );
}


export function Profil({
    personId:
        providedPersonId = null,

    displayName = null,
}) {
    const api =
        useApi();

    const {
        username,
    } =
        useAuth();


    /*
     * Normales Profil:
     *
     * providedPersonId === null
     * → eigener Username
     *
     * Admin:
     *
     * providedPersonId gesetzt
     * → Profil des ausgewählten Users
     */
    const personId =
        providedPersonId ??
        username;


    const [
        loading,
        setLoading,
    ] =
        useState(true);

    const [
        error,
        setError,
    ] =
        useState(null);

    const [
        bestellRunden,
        setBestellRunden,
    ] =
        useState([]);


    useEffect(
        () => {
            if (
                !personId
            ) {
                return;
            }

            let cancelled =
                false;


            const load =
                async () => {
                    setLoading(
                        true
                    );

                    setError(
                        null
                    );

                    try {
                        /*
                         * Diese beiden Calls existieren
                         * in deinem ApiService bereits.
                         *
                         * Trotz des etwas alten Namens
                         * holen sie /person/{personId}.
                         */
                        const [
                            frischResponse,
                            brotResponse,
                        ] =
                            await Promise.all([
                                api
                                    .readFrischBestellungBetweenDatesProPerson(
                                        personId
                                    ),

                                api
                                    .readBrotBestellungBetweenDatesProPerson(
                                        personId
                                    ),
                            ]);


                        const [
                            frischJson,
                            brotJson,
                        ] =
                            await Promise.all([
                                readJson(
                                    frischResponse
                                ),

                                readJson(
                                    brotResponse
                                ),
                            ]);


                        const frischBestellungen =
                            extractCollection(
                                frischJson
                            );

                        const brotBestellungen =
                            extractCollection(
                                brotJson
                            );


                        /*
                         * Alle Produkte bestimmen,
                         * die der User jemals bestellt hat.
                         */
                        const bestandIds =
                            new Set();


                        frischBestellungen
                            .forEach(
                                bestellung => {
                                    const id =
                                        bestellung
                                            ?.frischbestand
                                            ?.id;

                                    if (
                                        id
                                    ) {
                                        bestandIds.add(
                                            id
                                        );
                                    }
                                }
                            );


                        brotBestellungen
                            .forEach(
                                bestellung => {
                                    const id =
                                        bestellung
                                            ?.brotbestand
                                            ?.id;

                                    if (
                                        id
                                    ) {
                                        bestandIds.add(
                                            id
                                        );
                                    }
                                }
                            );


                        /*
                         * Preis-History jedes vorkommenden
                         * Produkts einmal laden.
                         */
                        const histories =
                            await Promise.all(
                                Array
                                    .from(
                                        bestandIds
                                    )
                                    .map(
                                        async bestandId => {
                                            const response =
                                                await api
                                                    .readPreisHistorie(
                                                        bestandId
                                                    );

                                            const json =
                                                await readJson(
                                                    response
                                                );

                                            return extractCollection(
                                                json
                                            );
                                        }
                                    )
                            );


                        /*
                         * Schneller Lookup:
                         *
                         * bestandId:deadlineId
                         * →
                         * PreisHistorie-Eintrag
                         */
                        const preisMap =
                            new Map();


                        histories
                            .flat()
                            .forEach(
                                eintrag => {
                                    if (
                                        !eintrag
                                            ?.bestandId ||
                                        !eintrag
                                            ?.deadlineId
                                    ) {
                                        return;
                                    }

                                    preisMap.set(
                                        `${eintrag.bestandId}:${eintrag.deadlineId}`,
                                        eintrag
                                    );
                                }
                            );


                        const normalisierteBestellungen =
                            [];


                        frischBestellungen
                            .forEach(
                                bestellung => {
                                    const bestand =
                                        bestellung
                                            ?.frischbestand;

                                    if (
                                        !bestand
                                    ) {
                                        return;
                                    }


                                    const historie =
                                        bestellung
                                            ?.deadlineId
                                            ? preisMap.get(
                                                `${bestand.id}:${bestellung.deadlineId}`
                                            )
                                            : null;


                                    const menge =
                                        Number(
                                            bestellung
                                                ?.bestellmenge ??
                                            0
                                        );


                                    const preis =
                                        historie
                                            ? Number(
                                                historie.preis
                                            )
                                            : null;


                                    normalisierteBestellungen.push({
                                        id:
                                            bestellung.id,

                                        art:
                                            "Frisch",

                                        bestandId:
                                            bestand.id,

                                        name:
                                            bestand.name,

                                        menge,

                                        einheit:
                                            bestand
                                                ?.einheit
                                                ?.name ??
                                            null,

                                        deadlineId:
                                            bestellung
                                                .deadlineId ??
                                            null,

                                        deadline:
                                            historie
                                                ?.deadline ??
                                            bestellung
                                                ?.datum ??
                                            null,

                                        preis,

                                        gesamt:
                                            preis !==
                                            null
                                                ? menge *
                                                  preis
                                                : null,
                                    });
                                }
                            );


                        brotBestellungen
                            .forEach(
                                bestellung => {
                                    const bestand =
                                        bestellung
                                            ?.brotbestand;

                                    if (
                                        !bestand
                                    ) {
                                        return;
                                    }


                                    const historie =
                                        bestellung
                                            ?.deadlineId
                                            ? preisMap.get(
                                                `${bestand.id}:${bestellung.deadlineId}`
                                            )
                                            : null;


                                    const menge =
                                        Number(
                                            bestellung
                                                ?.bestellmenge ??
                                            0
                                        );


                                    const preis =
                                        historie
                                            ? Number(
                                                historie.preis
                                            )
                                            : null;


                                    normalisierteBestellungen.push({
                                        id:
                                            bestellung.id,

                                        art:
                                            "Brot",

                                        bestandId:
                                            bestand.id,

                                        name:
                                            bestand.name,

                                        menge,

                                        einheit:
                                            "Stück",

                                        deadlineId:
                                            bestellung
                                                .deadlineId ??
                                            null,

                                        deadline:
                                            historie
                                                ?.deadline ??
                                            bestellung
                                                ?.datum ??
                                            null,

                                        preis,

                                        gesamt:
                                            preis !==
                                            null
                                                ? menge *
                                                  preis
                                                : null,
                                    });
                                }
                            );


                        /*
                         * Nach Deadline gruppieren.
                         */
                        const gruppen =
                            new Map();


                        normalisierteBestellungen
                            .forEach(
                                bestellung => {
                                    const key =
                                        bestellung
                                            .deadlineId ??
                                        `legacy-${bestellung.deadline}`;


                                    if (
                                        !gruppen.has(
                                            key
                                        )
                                    ) {
                                        gruppen.set(
                                            key,
                                            {
                                                id:
                                                    key,

                                                deadline:
                                                    bestellung
                                                        .deadline,

                                                bestellungen:
                                                    [],

                                                gesamt:
                                                    0,

                                                preisUnvollstaendig:
                                                    false,
                                            }
                                        );
                                    }


                                    const gruppe =
                                        gruppen.get(
                                            key
                                        );


                                    gruppe
                                        .bestellungen
                                        .push(
                                            bestellung
                                        );


                                    if (
                                        bestellung
                                            .gesamt ===
                                        null
                                    ) {
                                        gruppe
                                            .preisUnvollstaendig =
                                            true;
                                    } else {
                                        gruppe.gesamt +=
                                            bestellung
                                                .gesamt;
                                    }
                                }
                            );


                        const result =
                            Array
                                .from(
                                    gruppen.values()
                                )
                                .sort(
                                    (
                                        a,
                                        b
                                    ) => {
                                        const dateA =
                                            a.deadline
                                                ? new Date(
                                                    a.deadline
                                                )
                                                : new Date(
                                                    0
                                                );

                                        const dateB =
                                            b.deadline
                                                ? new Date(
                                                    b.deadline
                                                )
                                                : new Date(
                                                    0
                                                );

                                        return (
                                            dateB -
                                            dateA
                                        );
                                    }
                                );


                        if (
                            !cancelled
                        ) {
                            setBestellRunden(
                                result
                            );
                        }
                    } catch (
                        loadError
                    ) {
                        console.error(
                            "[Profil] Profil konnte nicht geladen werden:",
                            loadError
                        );

                        if (
                            !cancelled
                        ) {
                            setError(
                                "Die Bestellhistorie konnte nicht geladen werden."
                            );
                        }
                    } finally {
                        if (
                            !cancelled
                        ) {
                            setLoading(
                                false
                            );
                        }
                    }
                };


            load();


            return () => {
                cancelled =
                    true;
            };
        },
        [
            personId,
            api,
        ]
    );


    const statistik =
        useMemo(
            () => {
                let summe =
                    0;

                let anzahl =
                    0;

                const produkte =
                    new Set();


                bestellRunden
                    .forEach(
                        runde => {
                            runde
                                .bestellungen
                                .forEach(
                                    bestellung => {
                                        anzahl++;

                                        produkte.add(
                                            bestellung
                                                .bestandId
                                        );

                                        if (
                                            bestellung
                                                .gesamt !==
                                            null
                                        ) {
                                            summe +=
                                                bestellung
                                                    .gesamt;
                                        }
                                    }
                                );
                        }
                    );


                return {
                    summe,
                    anzahl,
                    produkte:
                        produkte.size,
                };
            },
            [
                bestellRunden,
            ]
        );


    if (
        loading
    ) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent:
                        "center",

                    py: 8,
                }}
            >
                <CircularProgress />
            </Box>
        );
    }


    return (
        <Stack
            spacing={3}
            sx={{
                width: "100%",
                maxWidth: 1100,
                mx: "auto",
                pb: 4,
            }}
        >
            <Box>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 700,
                    }}
                >
                    {displayName
                        ? displayName
                        : "Mein Profil"}
                </Typography>

                <Typography
                    color="text.secondary"
                >
                    Bestellungen und historische
                    Preise
                </Typography>
            </Box>


            {error && (
                <Alert
                    severity="error"
                >
                    {error}
                </Alert>
            )}


            <Stack
                direction={{
                    xs: "column",
                    sm: "row",
                }}
                spacing={2}
                flexWrap="wrap"
                useFlexGap
            >
                <StatistikKarte
                    icon={
                        <EuroOutlinedIcon />
                    }
                    label="Historische Ausgaben"
                    value={
                        formatMoney(
                            statistik.summe
                        )
                    }
                />

                <StatistikKarte
                    icon={
                        <ReceiptLongOutlinedIcon />
                    }
                    label="Bestellpositionen"
                    value={
                        statistik.anzahl
                    }
                />

                <StatistikKarte
                    icon={
                        <ShoppingBasketOutlinedIcon />
                    }
                    label="Verschiedene Produkte"
                    value={
                        statistik.produkte
                    }
                />
            </Stack>


            <Box>
                <Typography
                    variant="h6"
                    sx={{
                        mb: 1.5,
                    }}
                >
                    Bestellhistorie
                </Typography>


                {bestellRunden.length ===
                0 ? (
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 3,
                        }}
                    >
                        <Typography
                            color="text.secondary"
                        >
                            Noch keine vergangenen
                            Bestellungen vorhanden.
                        </Typography>
                    </Paper>
                ) : (
                    <Stack
                        spacing={1}
                    >
                        {bestellRunden.map(
                            runde => (
                                <Accordion
                                    key={
                                        runde.id
                                    }
                                    disableGutters
                                    elevation={0}
                                    sx={{
                                        border: 1,
                                        borderColor:
                                            "divider",

                                        "&:before":
                                            {
                                                display:
                                                    "none",
                                            },
                                    }}
                                >
                                    <AccordionSummary
                                        expandIcon={
                                            <ExpandMoreOutlinedIcon />
                                        }
                                    >
                                        <Stack
                                            direction="row"
                                            justifyContent="space-between"
                                            alignItems="center"
                                            sx={{
                                                width:
                                                    "100%",
                                                pr: 2,
                                            }}
                                        >
                                            <Box>
                                                <Typography
                                                    sx={{
                                                        fontWeight:
                                                            650,
                                                    }}
                                                >
                                                    Bestellrunde{" "}
                                                    {
                                                        formatDate(
                                                            runde.deadline
                                                        )
                                                    }
                                                </Typography>

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    {
                                                        runde
                                                            .bestellungen
                                                            .length
                                                    }{" "}
                                                    Positionen
                                                </Typography>
                                            </Box>

                                            <Typography
                                                sx={{
                                                    fontWeight:
                                                        700,
                                                }}
                                            >
                                                {
                                                    formatMoney(
                                                        runde.gesamt
                                                    )
                                                }
                                                {runde
                                                    .preisUnvollstaendig
                                                    ? " *"
                                                    : ""}
                                            </Typography>
                                        </Stack>
                                    </AccordionSummary>


                                    <AccordionDetails>
                                        <Stack
                                            spacing={1.5}
                                        >
                                            {runde
                                                .bestellungen
                                                .map(
                                                    bestellung => (
                                                        <React.Fragment
                                                            key={
                                                                bestellung.id
                                                            }
                                                        >
                                                            <Stack
                                                                direction={{
                                                                    xs:
                                                                        "column",
                                                                    sm:
                                                                        "row",
                                                                }}
                                                                justifyContent="space-between"
                                                                spacing={1}
                                                            >
                                                                <Box>
                                                                    <Typography
                                                                        sx={{
                                                                            fontWeight:
                                                                                600,
                                                                        }}
                                                                    >
                                                                        {
                                                                            bestellung.name
                                                                        }
                                                                    </Typography>

                                                                    <Typography
                                                                        variant="body2"
                                                                        color="text.secondary"
                                                                    >
                                                                        {
                                                                            bestellung.art
                                                                        }
                                                                    </Typography>
                                                                </Box>


                                                                <Box
                                                                    sx={{
                                                                        textAlign: {
                                                                            xs:
                                                                                "left",
                                                                            sm:
                                                                                "right",
                                                                        },
                                                                    }}
                                                                >
                                                                    {bestellung.preis !==
                                                                    null ? (
                                                                        <>
                                                                            <Typography>
                                                                                {
                                                                                    bestellung.menge
                                                                                }
                                                                                {bestellung.einheit
                                                                                    ? ` ${bestellung.einheit}`
                                                                                    : ""}
                                                                                {" × "}
                                                                                {
                                                                                    formatMoney(
                                                                                        bestellung.preis
                                                                                    )
                                                                                }
                                                                            </Typography>

                                                                            <Typography
                                                                                sx={{
                                                                                    fontWeight:
                                                                                        700,
                                                                                }}
                                                                            >
                                                                                {
                                                                                    formatMoney(
                                                                                        bestellung.gesamt
                                                                                    )
                                                                                }
                                                                            </Typography>
                                                                        </>
                                                                    ) : (
                                                                        <Typography
                                                                            color="text.secondary"
                                                                        >
                                                                            Historischer
                                                                            Preis
                                                                            nicht
                                                                            verfügbar
                                                                        </Typography>
                                                                    )}
                                                                </Box>
                                                            </Stack>

                                                            <Divider />
                                                        </React.Fragment>
                                                    )
                                                )}


                                            {runde
                                                .preisUnvollstaendig && (
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    * Für mindestens
                                                    eine ältere
                                                    Bestellung fehlt
                                                    noch ein historischer
                                                    Preis.
                                                </Typography>
                                            )}
                                        </Stack>
                                    </AccordionDetails>
                                </Accordion>
                            )
                        )}
                    </Stack>
                )}
            </Box>
        </Stack>
    );
}