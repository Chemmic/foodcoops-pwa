import React, {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    InputBase,
    Stack,
    Tooltip,
    Typography,
    useMediaQuery,
} from "@mui/material";

import { alpha } from "@mui/material/styles";

import ArrowDownwardOutlinedIcon from "@mui/icons-material/ArrowDownwardOutlined";
import ArrowUpwardOutlinedIcon from "@mui/icons-material/ArrowUpwardOutlined";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

import {
    anPlatz,
    geaendert,
    verschieben,
    zielIndex,
} from "./reihenfolge.js";


const STANDARD_BESCHREIBUNG =
    "So erscheinen die Produkte in den Listen und im PDF. Ziehe ein Produkt am Griff oder tippe den gewünschten Platz ein.";


/**
 * Reihenfolge einer Produktliste festlegen (Frisch, Brot, Lager) – z.B. wie
 * in der Liste des Händlers. Verschieben per Ziehen (Griff links),
 * Pfeiltasten oder durch Eintippen des Platzes.
 *
 * untertitel: zweite Zeile je Produkt (Standard: Kategorie)
 */
export function ReihenfolgeDialog({
    offen,
    produkte,
    onClose,
    onSpeichern,
    titel = "Reihenfolge",
    beschreibung = STANDARD_BESCHREIBUNG,
    untertitel = produkt => produkt.kategorie?.name,
}) {
    const vollbild =
        useMediaQuery(theme => theme.breakpoints.down("sm"));

    const [
        liste,
        setListe,
    ] = useState([]);

    const [
        ziehen,
        setZiehen,
    ] = useState(null);

    const [
        speichert,
        setSpeichert,
    ] = useState(false);

    const zeilen =
        useRef([]);

    const bereich =
        useRef(null);


    useEffect(() => {
        if (offen) {
            setListe(produkte);
            setZiehen(null);
        }
    }, [offen, produkte]);


    // =========================================================================
    // Ziehen (Maus und Touch)
    // =========================================================================

    const start =
        (event, index) => {
            event.preventDefault();
            event.currentTarget.setPointerCapture(event.pointerId);

            setZiehen({
                von: index,
                nach: index,
            });
        };


    const bewegen =
        event => {
            if (!ziehen) {
                return;
            }

            const mitten =
                zeilen.current
                    .slice(0, liste.length)
                    .map(zeile => {
                        const rect = zeile.getBoundingClientRect();
                        return rect.top + rect.height / 2;
                    });

            const nach =
                zielIndex(mitten, event.clientY, ziehen.von);

            if (nach !== ziehen.nach) {
                setZiehen({
                    ...ziehen,
                    nach,
                });
            }

            // Am Rand mitscrollen
            const rect =
                bereich.current?.getBoundingClientRect();

            if (rect) {
                if (event.clientY < rect.top + 48) {
                    bereich.current.scrollTop -= 16;
                } else if (event.clientY > rect.bottom - 48) {
                    bereich.current.scrollTop += 16;
                }
            }
        };


    const ende =
        () => {
            if (ziehen) {
                setListe(l => verschieben(l, ziehen.von, ziehen.nach));
            }

            setZiehen(null);
        };


    // =========================================================================
    // Speichern
    // =========================================================================

    const speichern =
        async () => {
            setSpeichert(true);

            try {
                await onSpeichern(liste.map(p => p.id));
            } finally {
                setSpeichert(false);
            }
        };


    const hatAenderungen =
        geaendert(produkte, liste);


    return (
        <Dialog
            open={offen}
            onClose={speichert ? undefined : onClose}
            fullWidth
            maxWidth="sm"
            fullScreen={vollbild}
        >
            <DialogTitle>
                {titel}
            </DialogTitle>

            <DialogContent
                ref={bereich}
                dividers
                sx={{
                    p: 0,
                }}
            >
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        px: 2.5,
                        py: 1.5,
                    }}
                >
                    {beschreibung}
                </Typography>

                <Box
                    component="ol"
                    aria-label="Frischwaren in Reihenfolge"
                    sx={{
                        m: 0,
                        p: 0,
                        listStyle: "none",
                        userSelect: ziehen ? "none" : "auto",
                    }}
                >
                    {liste.map((produkt, index) => {
                        const gezogen =
                            ziehen?.von === index;

                        const linieOben =
                            ziehen &&
                            !gezogen &&
                            ziehen.nach === index &&
                            ziehen.nach < ziehen.von;

                        const linieUnten =
                            ziehen &&
                            !gezogen &&
                            ziehen.nach === index &&
                            ziehen.nach > ziehen.von;

                        return (
                            <Box
                                component="li"
                                key={produkt.id}
                                ref={element => {
                                    zeilen.current[index] = element;
                                }}
                                sx={theme => ({
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    px: 1,
                                    py: 0.5,
                                    borderTop: 1,
                                    borderColor: "divider",
                                    opacity: gezogen ? 0.45 : 1,
                                    bgcolor: gezogen
                                        ? alpha(theme.palette.primary.main, 0.08)
                                        : "transparent",
                                    boxShadow: linieOben
                                        ? `inset 0 3px 0 ${theme.palette.primary.main}`
                                        : linieUnten
                                            ? `inset 0 -3px 0 ${theme.palette.primary.main}`
                                            : "none",
                                })}
                            >
                                <Box
                                    role="button"
                                    tabIndex={-1}
                                    aria-label={`${produkt.name} ziehen`}
                                    onPointerDown={event =>
                                        start(event, index)
                                    }
                                    onPointerMove={bewegen}
                                    onPointerUp={ende}
                                    onPointerCancel={ende}
                                    sx={{
                                        display: "flex",
                                        p: 1,
                                        cursor: ziehen ? "grabbing" : "grab",
                                        color: "text.secondary",
                                        touchAction: "none",
                                    }}
                                >
                                    <DragIndicatorIcon fontSize="small" />
                                </Box>

                                <PlatzFeld
                                    platz={index + 1}
                                    max={liste.length}
                                    name={produkt.name}
                                    onChange={platz =>
                                        setListe(l => anPlatz(l, index, platz))
                                    }
                                />

                                <Box
                                    sx={{
                                        flexGrow: 1,
                                        minWidth: 0,
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: 600,
                                        }}
                                        noWrap
                                    >
                                        {produkt.name}
                                    </Typography>

                                    {untertitel(produkt) && (
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            noWrap
                                            component="div"
                                        >
                                            {untertitel(produkt)}
                                        </Typography>
                                    )}
                                </Box>

                                <Stack direction="row">
                                    <Tooltip title="Nach oben">
                                        <span>
                                            <IconButton
                                                size="small"
                                                aria-label={`${produkt.name} nach oben`}
                                                disabled={index === 0}
                                                onClick={() =>
                                                    setListe(l => verschieben(l, index, index - 1))
                                                }
                                            >
                                                <ArrowUpwardOutlinedIcon fontSize="small" />
                                            </IconButton>
                                        </span>
                                    </Tooltip>

                                    <Tooltip title="Nach unten">
                                        <span>
                                            <IconButton
                                                size="small"
                                                aria-label={`${produkt.name} nach unten`}
                                                disabled={index === liste.length - 1}
                                                onClick={() =>
                                                    setListe(l => verschieben(l, index, index + 1))
                                                }
                                            >
                                                <ArrowDownwardOutlinedIcon fontSize="small" />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                </Stack>
                            </Box>
                        );
                    })}
                </Box>
            </DialogContent>

            <DialogActions>
                <Button
                    onClick={onClose}
                    disabled={speichert}
                >
                    Abbrechen
                </Button>

                <Button
                    variant="contained"
                    onClick={speichern}
                    disabled={!hatAenderungen || speichert}
                    startIcon={
                        speichert
                            ? <CircularProgress size={16} />
                            : null
                    }
                >
                    Reihenfolge speichern
                </Button>
            </DialogActions>
        </Dialog>
    );
}


/**
 * Platz-Nummer zum Eintippen: übernimmt bei Enter oder beim Verlassen.
 */
function PlatzFeld({ platz, max, name, onChange }) {
    const [
        wert,
        setWert,
    ] = useState(String(platz));

    useEffect(() => {
        setWert(String(platz));
    }, [platz]);


    const uebernehmen =
        () => {
            if (wert !== String(platz) && wert.trim() !== "") {
                onChange(wert);
            } else {
                setWert(String(platz));
            }
        };


    return (
        <InputBase
            value={wert}
            onChange={event =>
                setWert(event.target.value.replace(/[^0-9]/g, ""))
            }
            onBlur={uebernehmen}
            onKeyDown={event => {
                if (event.key === "Enter") {
                    event.preventDefault();
                    uebernehmen();
                }
            }}
            slotProps={{
                input: {
                    inputMode: "numeric",
                    "aria-label": `Platz von ${name} (1 bis ${max})`,
                },
            }}
            sx={{
                width: 48,
                flexShrink: 0,
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                fontSize: 14,
                fontVariantNumeric: "tabular-nums",

                "& input": {
                    textAlign: "center",
                    py: 0.5,
                },
            }}
        />
    );
}
