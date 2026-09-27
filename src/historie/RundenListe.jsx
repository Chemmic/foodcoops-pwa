import React, {
    useMemo,
    useState,
} from "react";

import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Chip,
    InputAdornment,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

import {
    RUNDEN_STATUS,
    TYP_FARBEN,
    TYP_LABELS,
    datum,
    datumZeit,
    euro,
    menge,
    rundenLabel,
    zahl,
} from "./format.js";

import {
    bestelluebersichtAlsPdf,
    rechnungAlsPdf,
} from "./pdf.js";


// =============================================================================
// Kleine Bausteine
// =============================================================================

function TypPunkt({ typ }) {
    return (
        <Tooltip title={TYP_LABELS[typ] ?? typ}>
            <Box
                component="span"
                aria-label={TYP_LABELS[typ] ?? typ}
                sx={{
                    display: "inline-block",
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: TYP_FARBEN[typ] ?? "text.disabled",
                    mr: 1,
                    flexShrink: 0,
                }}
            />
        </Tooltip>
    );
}


/**
 * Abweichung zwischen bestellter und genommener Menge.
 * Mehr/weniger ist keine Wertung – deshalb neutrale Farben.
 */
function DifferenzChip({ position }) {
    if (position.spezialfall && position.genommen !== null) {
        return (
            <Tooltip title="In Stück bestellt, nach Gewicht abgerechnet – nicht direkt vergleichbar.">
                <Chip
                    size="small"
                    variant="outlined"
                    label="nach Gewicht"
                />
            </Tooltip>
        );
    }

    if (
        position.differenz === null ||
        Math.abs(position.differenz) < 0.0005
    ) {
        return null;
    }

    const mehr =
        position.differenz > 0;

    return (
        <Chip
            size="small"
            color={mehr ? "info" : "warning"}
            variant="outlined"
            label={`${mehr ? "+" : ""}${zahl(position.differenz)} ${position.einheit ?? ""} ${mehr ? "mehr" : "weniger"}`}
        />
    );
}


const STATUS_CHIP = {
    OFFEN: {
        label: "offen",
        color: "default",
    },
    GENOMMEN: {
        label: "genommen",
        color: "success",
    },
    NICHT_ABGEHOLT: {
        label: "nicht abgeholt",
        color: "error",
    },
};


function zusammenfassung(runde) {
    const mehr =
        runde.bestellungen.filter(p => p.differenz > 0.0005).length;

    const weniger =
        runde.bestellungen.filter(p => p.differenz < -0.0005).length;

    const nichtAbgeholt =
        runde.bestellungen.filter(p => p.status === "NICHT_ABGEHOLT").length;

    const zuViel =
        runde.einkaeufe
            .flatMap(e => e.positionen)
            .filter(p => p.typ === "ZU_VIEL").length;

    return {
        mehr,
        weniger,
        nichtAbgeholt,
        zuViel,
    };
}


// =============================================================================
// Bestellungen einer Runde
// =============================================================================

function BestellTabelle({ runde }) {
    if (!runde.bestellungen.length) {
        return (
            <Typography
                variant="body2"
                color="text.secondary"
            >
                In dieser Runde wurde nichts bestellt.
            </Typography>
        );
    }

    return (
        <TableContainer
            sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 2,
            }}
        >
            <Table
                size="small"
                sx={{
                    minWidth: 560,
                }}
            >
                <TableHead>
                    <TableRow>
                        <TableCell>Produkt</TableCell>
                        <TableCell align="right">Bestellt</TableCell>
                        <TableCell align="right">Genommen</TableCell>
                        <TableCell>Abweichung</TableCell>
                        <TableCell>Status</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {runde.bestellungen.map(position => {
                        const status =
                            STATUS_CHIP[position.status] ??
                            STATUS_CHIP.OFFEN;

                        return (
                            <TableRow key={position.bestellungId}>
                                <TableCell>
                                    <Stack
                                        direction="row"
                                        sx={{ alignItems: "center" }}
                                    >
                                        <TypPunkt typ={position.typ} />

                                        <Box>
                                            <Typography variant="body2">
                                                {position.produkt}
                                            </Typography>

                                            {position.kategorie && (
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    {position.kategorie}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Stack>
                                </TableCell>

                                <TableCell
                                    align="right"
                                    sx={{ whiteSpace: "nowrap" }}
                                >
                                    {menge(
                                        position.bestellt,
                                        position.spezialfall ? "Stück" : position.einheit
                                    )}
                                </TableCell>

                                <TableCell
                                    align="right"
                                    sx={{ whiteSpace: "nowrap" }}
                                >
                                    {position.genommen === null
                                        ? "–"
                                        : menge(position.genommen, position.einheit)}
                                </TableCell>

                                <TableCell>
                                    <DifferenzChip position={position} />
                                </TableCell>

                                <TableCell>
                                    <Chip
                                        size="small"
                                        color={status.color}
                                        variant={
                                            status.color === "default"
                                                ? "outlined"
                                                : "filled"
                                        }
                                        label={status.label}
                                    />
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}


// =============================================================================
// Einkäufe einer Runde
// =============================================================================

function EinkaufKarte({
    einkauf,
    runde,
    personId,
    personName,
}) {
    const [
        offen,
        setOffen,
    ] = useState(false);

    const anteile = [
        ["FRISCH", einkauf.frisch],
        ["BROT", einkauf.brot],
        ["LAGER", einkauf.lager],
        ["ZU_VIEL", einkauf.zuViel],
    ].filter(([, betrag]) => betrag > 0);


    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                border: 1,
                borderColor: "divider",
            }}
        >
            <Stack
                direction={{
                    xs: "column",
                    sm: "row",
                }}
                spacing={1.5}
                sx={{
                    justifyContent: "space-between",
                    alignItems: {
                        xs: "flex-start",
                        sm: "center",
                    },
                }}
            >
                <Box>
                    <Typography sx={{ fontWeight: 700 }}>
                        Einkauf vom {datumZeit(einkauf.datum)}
                    </Typography>

                    <Stack
                        direction="row"
                        spacing={1.5}
                        useFlexGap
                        sx={{
                            flexWrap: "wrap",
                            mt: 0.5,
                        }}
                    >
                        {anteile.map(([typ, betrag]) => (
                            <Stack
                                key={typ}
                                direction="row"
                                sx={{ alignItems: "center" }}
                            >
                                <TypPunkt typ={typ} />

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {TYP_LABELS[typ]} {euro(betrag)}
                                </Typography>
                            </Stack>
                        ))}

                        {einkauf.lieferkosten > 0 && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Lieferkosten {euro(einkauf.lieferkosten)}
                            </Typography>
                        )}
                    </Stack>
                </Box>

                <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: "center" }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            fontVariantNumeric: "tabular-nums",
                            mr: 1,
                        }}
                    >
                        {euro(einkauf.gesamt)}
                    </Typography>

                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ReceiptLongOutlinedIcon />}
                        onClick={() =>
                            rechnungAlsPdf({
                                einkauf,
                                runde,
                                personId,
                                personName,
                            })
                        }
                    >
                        Rechnung
                    </Button>
                </Stack>
            </Stack>


            <Button
                size="small"
                onClick={() =>
                    setOffen(value => !value)
                }
                endIcon={
                    <ExpandMoreIcon
                        sx={{
                            transform: offen ? "rotate(180deg)" : "none",
                            transition: "transform 150ms",
                        }}
                    />
                }
                sx={{
                    mt: 1,
                    ml: -1,
                }}
            >
                {offen
                    ? "Positionen ausblenden"
                    : `${einkauf.positionen.length} Positionen anzeigen`}
            </Button>


            {offen && (
                <TableContainer
                    sx={{
                        mt: 1,
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 2,
                    }}
                >
                    <Table
                        size="small"
                        sx={{
                            minWidth: 520,
                        }}
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell>Produkt</TableCell>
                                <TableCell align="right">Menge</TableCell>
                                <TableCell align="right">Preis</TableCell>
                                <TableCell align="right">Summe</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {einkauf.positionen.map((position, index) => (
                                <TableRow key={`${position.produkt}-${index}`}>
                                    <TableCell>
                                        <Stack
                                            direction="row"
                                            sx={{ alignItems: "center" }}
                                            spacing={1}
                                        >
                                            <TypPunkt typ={position.typ} />

                                            <span>{position.produkt}</span>

                                            {position.typ === "ZU_VIEL" && (
                                                <Chip
                                                    size="small"
                                                    variant="outlined"
                                                    label="aus „Zu viel“"
                                                />
                                            )}
                                        </Stack>
                                    </TableCell>

                                    <TableCell
                                        align="right"
                                        sx={{ whiteSpace: "nowrap" }}
                                    >
                                        {menge(position.menge, position.einheit)}
                                    </TableCell>

                                    <TableCell
                                        align="right"
                                        sx={{ whiteSpace: "nowrap" }}
                                    >
                                        {position.preis === null ? "–" : euro(position.preis)}
                                    </TableCell>

                                    <TableCell
                                        align="right"
                                        sx={{ whiteSpace: "nowrap" }}
                                    >
                                        {position.summe === null ? "–" : euro(position.summe)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Paper>
    );
}


// =============================================================================
// Eine Runde
// =============================================================================

function RundeAccordion({
    runde,
    personId,
    personName,
    defaultExpanded,
}) {
    const status =
        RUNDEN_STATUS[runde.status] ??
        RUNDEN_STATUS.ABGESCHLOSSEN;

    const info =
        zusammenfassung(runde);


    return (
        <Accordion
            defaultExpanded={defaultExpanded}
            disableGutters
            elevation={0}
            slotProps={{
                transition: {
                    unmountOnExit: true,
                },
            }}
            sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 2,
                "&::before": {
                    display: "none",
                },
                "&:not(:last-of-type)": {
                    mb: 1.5,
                },
            }}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
            >
                <Stack
                    direction={{
                        xs: "column",
                        sm: "row",
                    }}
                    spacing={{
                        xs: 0.75,
                        sm: 2,
                    }}
                    sx={{
                        alignItems: {
                            xs: "flex-start",
                            sm: "center",
                        },
                        width: "100%",
                        pr: 1,
                    }}
                >
                    <Box
                        sx={{
                            flexGrow: 1,
                            minWidth: 0,
                        }}
                    >
                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{ alignItems: "center", flexWrap: "wrap" }}
                            useFlexGap
                        >
                            <Typography sx={{ fontWeight: 700 }}>
                                {rundenLabel(runde)}
                            </Typography>

                            <Chip
                                size="small"
                                color={status.color}
                                variant={
                                    status.color === "default"
                                        ? "outlined"
                                        : "filled"
                                }
                                label={status.label}
                            />
                        </Stack>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            {runde.bestellungen.length} Bestellungen
                            {" · "}
                            {runde.einkaeufe.length === 1
                                ? "1 Einkauf"
                                : `${runde.einkaeufe.length} Einkäufe`}
                            {info.mehr + info.weniger > 0 &&
                                ` · ${info.mehr + info.weniger}× abweichend genommen`}
                            {info.nichtAbgeholt > 0 &&
                                ` · ${info.nichtAbgeholt} nicht abgeholt`}
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            textAlign: {
                                xs: "left",
                                sm: "right",
                            },
                        }}
                    >
                        <Typography
                            sx={{
                                fontWeight: 700,
                                fontVariantNumeric: "tabular-nums",
                            }}
                        >
                            {runde.einkaeufe.length
                                ? euro(runde.ausgegeben)
                                : "–"}
                        </Typography>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            {runde.einkaeufe.length
                                ? "ausgegeben"
                                : `ca. ${euro(runde.geschaetzterBestellwert)} bestellt`}
                        </Typography>
                    </Box>
                </Stack>
            </AccordionSummary>


            <AccordionDetails>
                <Stack spacing={3}>
                    <Box>
                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 1,
                            }}
                        >
                            <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 700 }}
                            >
                                Bestellt
                                <Typography
                                    component="span"
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {" "}({datum(runde.start)} – {datum(runde.ende)})
                                </Typography>
                            </Typography>

                            {runde.bestellungen.length > 0 && (
                                <Button
                                    size="small"
                                    startIcon={<PictureAsPdfOutlinedIcon />}
                                    onClick={() =>
                                        bestelluebersichtAlsPdf({
                                            runde,
                                            personId,
                                            personName,
                                        })
                                    }
                                >
                                    Bestellübersicht
                                </Button>
                            )}
                        </Stack>

                        <BestellTabelle runde={runde} />
                    </Box>


                    <Box>
                        <Typography
                            variant="subtitle2"
                            sx={{
                                fontWeight: 700,
                                mb: 1,
                            }}
                        >
                            Einkäufe
                        </Typography>

                        {runde.einkaeufe.length === 0 ? (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                {runde.status === "AKTUELL"
                                    ? "Diese Runde läuft noch – eingekauft wird nach der Deadline."
                                    : runde.status === "EINKAUF"
                                        ? "Noch nicht eingekauft – die Bestellung kann jetzt abgeholt werden."
                                        : "Zu dieser Runde gibt es keinen Einkauf."}
                            </Typography>
                        ) : (
                            <Stack spacing={1.5}>
                                {runde.einkaeufe.map(einkauf => (
                                    <EinkaufKarte
                                        key={einkauf.id}
                                        einkauf={einkauf}
                                        runde={runde}
                                        personId={personId}
                                        personName={personName}
                                    />
                                ))}
                            </Stack>
                        )}

                        {info.zuViel > 0 && (
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                    display: "block",
                                    mt: 1,
                                }}
                            >
                                {info.zuViel === 1
                                    ? "1 Produkt"
                                    : `${info.zuViel} Produkte`} zusätzlich aus der „Zu viel“-Liste genommen.
                            </Typography>
                        )}
                    </Box>
                </Stack>
            </AccordionDetails>
        </Accordion>
    );
}


// =============================================================================
// Liste
// =============================================================================

export function RundenListe({
    runden,
    personId,
    personName,
}) {
    const [
        suche,
        setSuche,
    ] = useState("");


    const gefiltert =
        useMemo(
            () => {
                const term =
                    suche
                        .trim()
                        .toLowerCase();

                if (!term) {
                    return runden;
                }

                return runden.filter(runde =>
                    runde.bestellungen.some(p =>
                        p.produkt?.toLowerCase().includes(term)
                    ) ||
                    runde.einkaeufe.some(e =>
                        e.positionen.some(p =>
                            p.produkt?.toLowerCase().includes(term)
                        )
                    )
                );
            },
            [
                runden,
                suche,
            ]
        );


    if (!runden.length) {
        return (
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    border: 1,
                    borderColor: "divider",
                    textAlign: "center",
                }}
            >
                <Typography color="text.secondary">
                    Noch keine Bestellungen oder Einkäufe vorhanden.
                </Typography>
            </Paper>
        );
    }


    return (
        <Stack spacing={2}>
            <TextField
                size="small"
                placeholder="Nach Produkt suchen"
                value={suche}
                onChange={event =>
                    setSuche(event.target.value)
                }
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchOutlinedIcon fontSize="small" />
                            </InputAdornment>
                        ),
                    },
                }}
                sx={{
                    maxWidth: 360,
                }}
            />

            {gefiltert.length === 0 ? (
                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    Keine Runde enthält „{suche}“.
                </Typography>
            ) : (
                <Box>
                    {gefiltert.map((runde, index) => (
                        <RundeAccordion
                            key={runde.deadlineId}
                            runde={runde}
                            personId={personId}
                            personName={personName}
                            defaultExpanded={index === 0 && !suche}
                        />
                    ))}
                </Box>
            )}
        </Stack>
    );
}
