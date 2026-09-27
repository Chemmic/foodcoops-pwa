import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Alert,
    Box,
    Button,
    CircularProgress,
    IconButton,
    LinearProgress,
    Paper,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";

import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";

import { StatTile } from "../charts/StatTile.jsx";

import {
    euro,
    zahl,
} from "../historie/format.js";

import { einkaufsliste } from "../lager/einkaufsliste.js";
import { einkaufslisteAlsPdf } from "../lager/einkaufslistePdf.js";

import { getLagerprodukte } from "./bestellung.js";


/**
 * ============================================================================
 * Lager auffüllen
 * ============================================================================
 *
 * Auf einen Blick: was muss gekauft werden, um den Soll-Bestand zu
 * erreichen? Produkte mit Ist ≥ Soll erscheinen nicht. Dieselbe Liste gibt
 * es als PDF zum Mitnehmen.
 */
export function LagerAuffuellen() {
    const [
        produkte,
        setProdukte,
    ] = useState(null);

    const [
        laedt,
        setLaedt,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState(null);


    const laden = useCallback(() => {
        let aktiv = true;

        setLaedt(true);

        getLagerprodukte()
            .then(data => {
                if (aktiv) {
                    setProdukte(Array.isArray(data) ? data : []);
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
    }, []);


    useEffect(
        () => laden(),
        [laden]
    );


    const liste =
        useMemo(
            () => einkaufsliste(produkte ?? []),
            [produkte]
        );


    if (!produkte && laedt) {
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


    if (error && !produkte) {
        return (
            <Alert
                severity="error"
                action={
                    <Button
                        color="inherit"
                        size="small"
                        onClick={laden}
                    >
                        Erneut laden
                    </Button>
                }
            >
                {error}
            </Alert>
        );
    }


    return (
        <Stack
            spacing={2}
            sx={{
                opacity: laedt ? 0.6 : 1,
                transition: "opacity 150ms",
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    p: {
                        xs: 2,
                        sm: 2.5,
                    },
                    border: 1,
                    borderColor: "divider",
                }}
            >
                <Stack
                    direction={{
                        xs: "column",
                        sm: "row",
                    }}
                    spacing={2}
                    sx={{
                        alignItems: {
                            sm: "flex-start",
                        },
                        justifyContent: "space-between",
                    }}
                >
                    <Box>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 700,
                            }}
                        >
                            Lager auffüllen
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Was gekauft werden muss, um den Soll-Bestand zu erreichen.
                            Produkte, die schon genug da sind, erscheinen nicht.
                        </Typography>
                    </Box>

                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                            flexShrink: 0,
                        }}
                    >
                        <Button
                            variant="contained"
                            startIcon={<DownloadOutlinedIcon />}
                            disabled={liste.anzahl === 0}
                            onClick={() =>
                                einkaufslisteAlsPdf(liste)
                            }
                        >
                            Einkaufsliste als PDF
                        </Button>

                        <Tooltip title="Neu laden">
                            <IconButton
                                onClick={laden}
                                aria-label="Neu laden"
                            >
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Stack>
            </Paper>


            <Box
                sx={{
                    display: "grid",
                    gap: 2,
                    gridTemplateColumns: {
                        xs: "repeat(2, minmax(0, 1fr))",
                        md: "repeat(4, minmax(0, 1fr))",
                    },
                }}
            >
                <StatTile
                    label="Zu kaufen"
                    value={liste.anzahl}
                    hint={liste.anzahl === 1 ? "Produkt unter Soll" : "Produkte unter Soll"}
                />

                <StatTile
                    label="Kosten ca."
                    value={euro(liste.summe)}
                    hint="zum aktuellen Preis"
                />

                <StatTile
                    label="Kategorien"
                    value={liste.gruppen.length}
                    hint="mit fehlender Ware"
                />

                <StatTile
                    label="Lagerprodukte"
                    value={produkte.length}
                    hint={`${produkte.length - liste.anzahl} ausreichend vorhanden`}
                />
            </Box>


            {liste.anzahl === 0 ? (
                <Alert severity="success">
                    Alles aufgefüllt – im Moment muss nichts gekauft werden.
                </Alert>
            ) : (
                liste.gruppen.map(gruppe => (
                    <Paper
                        key={gruppe.kategorie}
                        elevation={0}
                        sx={{
                            border: 1,
                            borderColor: "divider",
                            overflow: "hidden",
                        }}
                    >
                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight: 700,
                                px: {
                                    xs: 2,
                                    sm: 2.5,
                                },
                                py: 1.25,
                                bgcolor: "action.hover",
                            }}
                        >
                            {gruppe.kategorie}
                        </Typography>

                        <Stack
                            divider={
                                <Box
                                    sx={{
                                        borderTop: 1,
                                        borderColor: "divider",
                                    }}
                                />
                            }
                        >
                            {gruppe.positionen.map(position => (
                                <Box
                                    key={position.id}
                                    sx={{
                                        px: {
                                            xs: 2,
                                            sm: 2.5,
                                        },
                                        py: 1.5,
                                        display: "grid",
                                        gap: {
                                            xs: 1,
                                            sm: 2,
                                        },
                                        alignItems: "center",
                                        gridTemplateColumns: {
                                            xs: "minmax(0, 1fr) auto",
                                            sm: "minmax(0, 1.5fr) minmax(0, 1.5fr) auto",
                                        },
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontWeight: 600,
                                            minWidth: 0,
                                        }}
                                    >
                                        {position.name}
                                    </Typography>

                                    <Box
                                        sx={{
                                            gridColumn: {
                                                xs: "1 / -1",
                                                sm: "auto",
                                            },
                                            gridRow: {
                                                xs: 2,
                                                sm: "auto",
                                            },
                                        }}
                                    >
                                        <LinearProgress
                                            variant="determinate"
                                            value={position.fuellstand * 100}
                                            color={position.fuellstand < 0.25 ? "error" : "warning"}
                                            aria-label={`${position.name}: ${zahl(position.ist)} von ${zahl(position.soll)} ${position.einheit}`}
                                            sx={{
                                                height: 8,
                                                borderRadius: 4,
                                                bgcolor: "action.hover",
                                            }}
                                        />

                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Ist {zahl(position.ist)} von Soll {zahl(position.soll)} {position.einheit}
                                        </Typography>
                                    </Box>

                                    <Box
                                        sx={{
                                            textAlign: "right",
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                fontWeight: 700,
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {zahl(position.fehlt)}{" "}{position.einheit} kaufen
                                        </Typography>

                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            ca. {euro(position.summe)}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Stack>
                    </Paper>
                ))
            )}
        </Stack>
    );
}
