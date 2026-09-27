import React, {
    useState,
} from "react";

import {
    Avatar,
    Box,
    Button,
    Chip,
    Paper,
    Stack,
    Tab,
    Tabs,
    Typography,
} from "@mui/material";

import { alpha } from "@mui/material/styles";

import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";

import { Link } from "react-router";

import {
    datum,
    datumZeit,
    euro,
    kalenderwoche,
    menge,
} from "./format.js";

import { PersonStatistik } from "./PersonStatistik.jsx";
import { RundenListe } from "./RundenListe.jsx";

import {
    PFADE,
} from "../router/pfade.js";


const MAX_PRODUKTE = 6;


// =============================================================================
// Statuskarte
// =============================================================================

function StatusKarte({
    icon,
    titel,
    untertitel,
    chip,
    gedimmt = false,
    children,
    aktion,
}) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: {
                    xs: 2,
                    sm: 2.5,
                },
                border: 1,
                borderColor: "divider",
                borderRadius: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 2,
            }}
        >
            <Stack
                direction="row"
                spacing={1.5}
                sx={{
                    alignItems: "flex-start",
                }}
            >
                <Avatar
                    variant="rounded"
                    sx={theme => ({
                        width: 44,
                        height: 44,
                        borderRadius: 2.5,
                        bgcolor: gedimmt
                            ? "action.hover"
                            : alpha(theme.palette.primary.main, 0.12),
                        color: gedimmt
                            ? "text.secondary"
                            : "primary.dark",
                    })}
                >
                    {icon}
                </Avatar>

                <Box
                    sx={{
                        flexGrow: 1,
                        minWidth: 0,
                    }}
                >
                    <Stack
                        direction="row"
                        spacing={1}
                        useFlexGap
                        sx={{
                            alignItems: "center",
                            flexWrap: "wrap",
                        }}
                    >
                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight: 700,
                                lineHeight: 1.3,
                            }}
                        >
                            {titel}
                        </Typography>

                        {chip && (
                            <Chip
                                size="small"
                                color={chip.color}
                                variant="outlined"
                                label={chip.label}
                            />
                        )}
                    </Stack>

                    {untertitel && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                mt: 0.25,
                            }}
                        >
                            {untertitel}
                        </Typography>
                    )}
                </Box>
            </Stack>

            {children && (
                <Box
                    sx={{
                        flexGrow: 1,
                    }}
                >
                    {children}
                </Box>
            )}

            {aktion && (
                <Box>
                    {aktion}
                </Box>
            )}
        </Paper>
    );
}


function ProduktChips({ runde }) {
    const sichtbar =
        runde.bestellungen.slice(0, MAX_PRODUKTE);

    const rest =
        runde.bestellungen.length - sichtbar.length;

    return (
        <Box>
            <Stack
                direction="row"
                spacing={1}
                useFlexGap
                sx={{
                    alignItems: "baseline",
                    mb: 1,
                }}
            >
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 700,
                    }}
                >
                    {runde.bestellungen.length}{" "}
                    {runde.bestellungen.length === 1 ? "Produkt" : "Produkte"}
                </Typography>

                <Typography color="text.secondary">
                    ca. {euro(runde.geschaetzterBestellwert)}
                </Typography>
            </Stack>

            <Stack
                direction="row"
                spacing={0.75}
                useFlexGap
                sx={{
                    flexWrap: "wrap",
                }}
            >
                {sichtbar.map(p => (
                    <Chip
                        key={p.bestellungId}
                        size="small"
                        variant="outlined"
                        label={`${p.produkt} · ${menge(p.bestellt, p.spezialfall ? "Stück" : p.einheit)}`}
                        sx={{
                            fontWeight: 500,
                        }}
                    />
                ))}

                {rest > 0 && (
                    <Chip
                        size="small"
                        label={`+${rest} weitere`}
                        sx={{
                            fontWeight: 500,
                        }}
                    />
                )}
            </Stack>
        </Box>
    );
}


// =============================================================================
// Ansicht
// =============================================================================

/**
 * Historie einer Person: aktuelle Runden, Statistik und alle
 * Bestellrunden. Wird im Profil und in der Verwaltung verwendet.
 *
 * eigene: im eigenen Profil (mit Links zu Bestellung / Einkauf)
 */
export function HistorieAnsicht({
    historie,
    personId,
    personName,
    eigene = false,
}) {
    const [
        tab,
        setTab,
    ] = useState("runden");


    const aktuell =
        historie.runden.find(r => r.status === "AKTUELL");

    const letzte =
        historie.runden.find(r => r.status === "EINKAUF");

    const hatBestellt =
        aktuell &&
        aktuell.bestellungen.length > 0;

    const abholbereit =
        letzte &&
        letzte.bestellungen.length > 0 &&
        letzte.einkaeufe.length === 0;

    const abgeholt =
        letzte &&
        letzte.einkaeufe.length > 0;

    const letzterEinkauf =
        abgeholt
            ? letzte.einkaeufe[letzte.einkaeufe.length - 1]
            : null;


    // "Diese Woche" / "Letzte Woche" – Karte 1: laufende Bestellung
    const bestellKarte = (
        <StatusKarte
            icon={<EditNoteOutlinedIcon />}
            titel={eigene ? "Deine Bestellung diese Woche" : "Bestellung diese Woche"}
            untertitel={
                aktuell?.ende
                    ? `Bestellen und ändern bis ${datumZeit(aktuell.ende)}`
                    : "Die Bestellphase läuft."
            }
            chip={{
                label: "noch änderbar",
                color: "info",
            }}
            gedimmt={!hatBestellt}
            aktion={
                eigene && (
                    <Button
                        size="small"
                        variant={hatBestellt ? "outlined" : "contained"}
                        component={Link}
                        to={PFADE.bestellungFrisch}
                    >
                        {hatBestellt ? "Bestellung ändern" : "Jetzt bestellen"}
                    </Button>
                )
            }
        >
            {hatBestellt ? (
                <ProduktChips runde={aktuell} />
            ) : (
                <Typography color="text.secondary">
                    {eigene
                        ? "Du hast diese Woche noch nichts bestellt."
                        : "Diese Woche noch nichts bestellt."}
                </Typography>
            )}
        </StatusKarte>
    );


    // Karte 2: Bestellung der letzten Runde abholen und bezahlen
    let abholKarte;

    if (abholbereit) {
        abholKarte = (
            <StatusKarte
                icon={<ShoppingBagOutlinedIcon />}
                titel="Liegt zum Abholen bereit"
                untertitel={`Deine Bestellung aus ${kalenderwoche(letzte.ende ?? letzte.start)} ist da. Beim Abholen trägst du im Einkauf ein, was du mitnimmst – danach wird abgerechnet.`}
                chip={{
                    label: "offen",
                    color: "warning",
                }}
                aktion={
                    eigene && (
                        <Button
                            size="small"
                            variant="contained"
                            component={Link}
                            to={PFADE.einkauf}
                        >
                            Zum Einkauf
                        </Button>
                    )
                }
            >
                <ProduktChips runde={letzte} />
            </StatusKarte>
        );
    } else if (abgeholt) {
        abholKarte = (
            <StatusKarte
                icon={<TaskAltOutlinedIcon />}
                titel="Letzte Bestellung abgeholt"
                untertitel={`Eingekauft am ${datum(letzterEinkauf.datum)}`}
                chip={{
                    label: "erledigt",
                    color: "success",
                }}
                aktion={
                    <Button
                        size="small"
                        onClick={() =>
                            setTab("runden")
                        }
                        sx={{
                            ml: -1,
                        }}
                    >
                        Details & Rechnung
                    </Button>
                }
            >
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 700,
                    }}
                >
                    {euro(letzte.ausgegeben)}
                </Typography>
            </StatusKarte>
        );
    } else {
        abholKarte = (
            <StatusKarte
                icon={<ShoppingBagOutlinedIcon />}
                titel="Nichts abzuholen"
                untertitel="In der letzten Bestellrunde gab es keine Bestellung."
                gedimmt
            />
        );
    }


    return (
        <Stack spacing={2}>
            <Box
                sx={{
                    display: "grid",
                    gap: 2,
                    gridTemplateColumns: {
                        xs: "minmax(0, 1fr)",
                        md: "repeat(2, minmax(0, 1fr))",
                    },
                }}
            >
                {bestellKarte}
                {abholKarte}
            </Box>


            <Tabs
                value={tab}
                onChange={(_, next) =>
                    setTab(next)
                }
                sx={{
                    borderBottom: 1,
                    borderColor: "divider",
                }}
            >
                <Tab
                    value="runden"
                    label={
                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{ alignItems: "center" }}
                        >
                            <span>Bestellrunden</span>

                            <Chip
                                size="small"
                                label={historie.runden.length}
                            />
                        </Stack>
                    }
                />

                <Tab
                    value="uebersicht"
                    label="Statistik"
                />
            </Tabs>


            {tab === "runden" ? (
                <RundenListe
                    runden={historie.runden}
                    personId={personId}
                    personName={personName}
                />
            ) : (
                <PersonStatistik historie={historie} />
            )}
        </Stack>
    );
}
