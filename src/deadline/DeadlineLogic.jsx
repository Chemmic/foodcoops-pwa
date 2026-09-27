import React, {
    useEffect,
    useState,
} from "react";

import {
    Box,
    Chip,
    CircularProgress,
    Collapse,
    IconButton,
    Paper,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";

import { alpha } from "@mui/material/styles";

import AlarmOutlinedIcon from "@mui/icons-material/AlarmOutlined";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { useApi } from "../ApiService.jsx";


const WOCHENTAG_DATUM =
    new Intl.DateTimeFormat("de-DE", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
    });

const UHRZEIT =
    new Intl.DateTimeFormat("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
    });


/**
 * Restzeit bis zur Deadline in Worten, z.B. "2 Tage 4 Std." – null, wenn
 * die Deadline vorbei ist.
 */
export const restzeit = (deadline, jetzt) => {
    const ms =
        deadline.getTime() - jetzt.getTime();

    if (ms <= 0) {
        return null;
    }

    const minuten = Math.floor(ms / 60000);
    const tage = Math.floor(minuten / 1440);
    const stunden = Math.floor((minuten % 1440) / 60);
    const rest = minuten % 60;

    if (tage > 0) {
        return `${tage} ${tage === 1 ? "Tag" : "Tage"} ${stunden} Std.`;
    }

    if (stunden > 0) {
        return `${stunden} Std. ${rest} Min.`;
    }

    return `${Math.max(1, rest)} Min.`;
};


/**
 * Farbe nach Dringlichkeit: genug Zeit (primary), unter 24 Std. (warning),
 * unter 3 Std. oder vorbei (error).
 */
export const dringlichkeit = (deadline, jetzt) => {
    const stunden =
        (deadline.getTime() - jetzt.getTime()) / 3600000;

    if (stunden <= 3) {
        return "error";
    }

    if (stunden <= 24) {
        return "warning";
    }

    return "primary";
};


/**
 * Zeigt die aktuelle Bestell-Deadline als gut sichtbare, einzeilige
 * Leiste mit Countdown. Ein optionaler Hinweis (info) lässt sich über das
 * (i) aufklappen.
 */
export function DeadlineLogic({
    info = null,
}) {
    const api = useApi();

    const [
        infoOpen,
        setInfoOpen,
    ] = useState(false);

    const [
        isLoadingDeadline,
        setIsLoadingDeadline,
    ] = useState(true);

    const [
        deadline,
        setDeadline,
    ] = useState(null);


    // =========================================================================
    // Deadline laden
    // =========================================================================

    useEffect(() => {
        let active = true;


        const fetchDeadline =
            async () => {
                setIsLoadingDeadline(
                    true
                );

                try {
                    const lastResponse =
                        await api.readLastDeadline();

                    if (!lastResponse.ok) {
                        return;
                    }

                    const lastDeadline =
                        await lastResponse.json();

                    if (
                        !lastDeadline?.id ||
                        !active
                    ) {
                        return;
                    }

                    const currentResponse =
                        await api.readCurrentDeadline(
                            lastDeadline.id
                        );

                    if (!currentResponse.ok) {
                        return;
                    }

                    const currentDeadline =
                        await currentResponse.json();

                    if (active) {
                        setDeadline(
                            currentDeadline
                        );
                    }
                } catch (error) {
                    console.error(
                        "Fehler beim Laden der Deadline:",
                        error
                    );
                } finally {
                    if (active) {
                        setIsLoadingDeadline(
                            false
                        );
                    }
                }
            };


        fetchDeadline();


        return () => {
            active = false;
        };
    }, [api]);


    // =========================================================================
    // Loading
    // =========================================================================

    if (isLoadingDeadline) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    py: 1,
                }}
            >
                <CircularProgress size={22} />
            </Box>
        );
    }


    // =========================================================================
    // Datum prüfen
    // =========================================================================

    let date =
        deadline
            ? new Date(deadline)
            : null;

    if (
        date &&
        Number.isNaN(date.getTime())
    ) {
        console.warn(
            "Ungültiges Deadline-Datum:",
            deadline
        );

        date = null;
    }

    if (!date && !info) {
        return null;
    }


    return (
        <DeadlineLeiste
            date={date}
            info={info}
            infoOpen={infoOpen}
            onToggleInfo={() =>
                setInfoOpen(value => !value)
            }
        />
    );
}


// =============================================================================
// Leiste
// =============================================================================

function DeadlineLeiste({
    date,
    info,
    infoOpen,
    onToggleInfo,
}) {
    // Countdown aktuell halten
    const [
        jetzt,
        setJetzt,
    ] = useState(() => new Date());

    useEffect(() => {
        const timer =
            setInterval(
                () => setJetzt(new Date()),
                30000
            );

        return () => clearInterval(timer);
    }, []);


    const noch =
        date
            ? restzeit(date, jetzt)
            : null;

    const farbe =
        date
            ? dringlichkeit(date, jetzt)
            : "primary";

    const vorbei =
        Boolean(date) &&
        !noch;


    return (
        <Paper
            elevation={0}
            sx={theme => {
                const haupt =
                    theme.palette[farbe].main;

                return {
                    my: {
                        xs: 0.5,
                        sm: 1,
                    },
                    px: {
                        xs: 1.25,
                        sm: 2,
                    },
                    py: {
                        xs: 1,
                        sm: 1.25,
                    },
                    border: 1,
                    borderColor: alpha(haupt, 0.35),
                    borderRadius: 2,
                    bgcolor: alpha(haupt, 0.07),
                    // Farbiger Balken links
                    boxShadow: `inset 4px 0 0 ${haupt}`,
                };
            }}
        >
            <Stack
                direction="row"
                spacing={{
                    xs: 1.25,
                    sm: 1.75,
                }}
                sx={{
                    alignItems: "center",
                }}
            >
                {/* Symbol */}
                <Box
                    sx={theme => ({
                        width: {
                            xs: 36,
                            sm: 42,
                        },
                        height: {
                            xs: 36,
                            sm: 42,
                        },
                        flexShrink: 0,
                        borderRadius: 2,
                        display: "grid",
                        placeItems: "center",
                        bgcolor: alpha(theme.palette[farbe].main, 0.15),
                        color: `${farbe}.dark`,
                    })}
                >
                    {vorbei
                        ? <EventBusyOutlinedIcon />
                        : <AlarmOutlinedIcon />}
                </Box>


                {/* Datum */}
                <Box
                    sx={{
                        flexGrow: 1,
                        minWidth: 0,
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{
                            display: "block",
                            fontWeight: 700,
                            letterSpacing: 0.6,
                            textTransform: "uppercase",
                            color: "text.secondary",
                            lineHeight: 1.3,
                        }}
                    >
                        {date
                            ? vorbei
                                ? "Bestellschluss war"
                                : "Bestellschluss"
                            : "Hinweis zur Bestellung"}
                    </Typography>

                    {date && (
                        <Typography
                            noWrap
                            sx={{
                                fontWeight: 800,
                                lineHeight: 1.25,
                                fontSize: {
                                    xs: "1rem",
                                    sm: "1.15rem",
                                },
                            }}
                        >
                            {WOCHENTAG_DATUM.format(date)}
                            <Box
                                component="span"
                                sx={{
                                    color: "text.secondary",
                                    fontWeight: 500,
                                    mx: 0.75,
                                }}
                            >
                                ·
                            </Box>
                            {UHRZEIT.format(date)} Uhr
                        </Typography>
                    )}
                </Box>


                {/* Countdown */}
                {date && (
                    <Chip
                        color={farbe}
                        variant={
                            farbe === "primary"
                                ? "outlined"
                                : "filled"
                        }
                        label={
                            vorbei
                                ? "abgelaufen"
                                : `noch ${noch}`
                        }
                        sx={{
                            flexShrink: 0,
                            fontWeight: 700,
                            height: {
                                xs: 28,
                                sm: 32,
                            },
                            fontSize: {
                                xs: "0.75rem",
                                sm: "0.85rem",
                            },
                            bgcolor:
                                farbe === "primary"
                                    ? "background.paper"
                                    : undefined,
                        }}
                    />
                )}


                {/* Hinweis */}
                {info && (
                    <Tooltip
                        title={
                            infoOpen
                                ? "Hinweis ausblenden"
                                : "Hinweis anzeigen"
                        }
                    >
                        <IconButton
                            size="small"
                            aria-label={
                                infoOpen
                                    ? "Hinweis ausblenden"
                                    : "Hinweis anzeigen"
                            }
                            aria-expanded={infoOpen}
                            onClick={onToggleInfo}
                            sx={{
                                flexShrink: 0,
                                color: "text.secondary",
                                mr: -0.5,
                            }}
                        >
                            <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
            </Stack>


            {info && (
                <Collapse
                    in={infoOpen}
                    timeout="auto"
                    unmountOnExit
                >
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            pt: 1,
                            pl: {
                                xs: 0,
                                sm: 7.5,
                            },
                        }}
                    >
                        {info}
                    </Typography>
                </Collapse>
            )}
        </Paper>
    );
}
