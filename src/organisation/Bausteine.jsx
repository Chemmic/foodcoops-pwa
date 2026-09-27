import React from "react";

import {
    Box,
    CircularProgress,
    IconButton,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

import {
    kalenderwoche,
    zahl,
} from "../historie/format.js";

import { wirdBestellt } from "./bestellung.js";


// =============================================================================
// Verlauf
// =============================================================================

const STAND = {
    gekauft: {
        text: "bestellt",
        sx: {
            bgcolor: "success.main",
        },
    },
    offen: {
        text: "gewünscht, nicht bestellt",
        sx: {
            bgcolor: "warning.main",
        },
    },
    leer: {
        text: "nicht gewünscht",
        sx: {
            border: 1.5,
            borderColor: "divider",
        },
    },
};


const standVon = runde =>
    !runde
        ? "leer"
        : runde.gekauft
            ? "gekauft"
            : runde.gewuenscht
                ? "offen"
                : "leer";


function Punkt({ stand, titel, aktuell = false }) {
    return (
        <Tooltip
            title={titel}
            arrow
        >
            <Box
                component="span"
                sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    flexShrink: 0,
                    boxSizing: "border-box",
                    ...STAND[stand].sx,
                    ...(aktuell && {
                        outline: 2,
                        outlineColor: "text.primary",
                        outlineOffset: "1.5px",
                    }),
                }}
            />
        </Tooltip>
    );
}


/**
 * Ein Punkt je Woche: älteste links, diese Runde rechts (umrandet).
 * grün = bestellt, gelb = gewünscht aber nicht bestellt, hohl = kein Wunsch.
 */
export function VerlaufPunkte({ verlaufRunden, position }) {
    const eintraege =
        verlaufRunden
            .map((ende, index) => ({
                ende,
                stand: standVon(position.verlauf.runden?.[index]),
            }))
            .reverse();

    const aktuell =
        standVon({
            gewuenscht: position.gewollteMenge > 0,
            gekauft: wirdBestellt(position),
        });

    return (
        <Stack
            direction="row"
            spacing={0.75}
            role="img"
            aria-label={`Verlauf ${position.produkt}`}
            sx={{
                alignItems: "center",
                py: 0.5,
            }}
        >
            {eintraege.map(({ ende, stand }) => (
                <Punkt
                    key={ende}
                    stand={stand}
                    titel={`${kalenderwoche(ende)}: ${STAND[stand].text}`}
                />
            ))}

            <Punkt
                stand={aktuell}
                aktuell
                titel={`Diese Runde: ${STAND[aktuell].text}`}
            />
        </Stack>
    );
}


export function VerlaufLegende() {
    return (
        <Stack
            direction="row"
            spacing={1.5}
            useFlexGap
            sx={{
                flexWrap: "wrap",
                alignItems: "center",
            }}
        >
            {Object.entries(STAND).map(([stand, { text }]) => (
                <Stack
                    key={stand}
                    direction="row"
                    spacing={0.5}
                    sx={{
                        alignItems: "center",
                    }}
                >
                    <Punkt
                        stand={stand}
                        titel={text}
                    />

                    <Typography
                        variant="caption"
                        color="text.secondary"
                    >
                        {text}
                    </Typography>
                </Stack>
            ))}

            <Typography
                variant="caption"
                color="text.secondary"
            >
                · umrandet = diese Runde
            </Typography>
        </Stack>
    );
}


// =============================================================================
// Gebinde
// =============================================================================

export function GebindeStepper({ position, speichert, onChange }) {
    const gebinde =
        position.zuBestellendeGebinde ?? 0;

    return (
        <Stack
            direction="row"
            spacing={0.5}
            sx={{
                alignItems: "center",
                border: 1,
                borderColor: "divider",
                borderRadius: 5,
                px: 0.5,
                width: "fit-content",
                bgcolor: "background.paper",
            }}
        >
            <IconButton
                size="small"
                aria-label={`Ein Gebinde ${position.produkt} weniger`}
                disabled={speichert || gebinde <= 0}
                onClick={() =>
                    onChange(position, Math.max(0, Math.ceil(gebinde) - 1))
                }
            >
                <RemoveIcon fontSize="small" />
            </IconButton>

            <Box
                sx={{
                    minWidth: 76,
                    textAlign: "center",
                }}
            >
                {speichert ? (
                    <CircularProgress size={16} />
                ) : (
                    <Typography
                        variant="body2"
                        sx={{
                            fontWeight: 700,
                            fontVariantNumeric: "tabular-nums",
                        }}
                    >
                        {zahl(gebinde)}
                        <Box
                            component="span"
                            sx={{
                                color: "text.secondary",
                                fontWeight: 400,
                                ml: 0.5,
                            }}
                        >
                            Gebinde
                        </Box>
                    </Typography>
                )}
            </Box>

            <IconButton
                size="small"
                aria-label={`Ein Gebinde ${position.produkt} mehr`}
                disabled={speichert}
                onClick={() =>
                    onChange(position, Math.floor(gebinde) + 1)
                }
            >
                <AddIcon fontSize="small" />
            </IconButton>
        </Stack>
    );
}
