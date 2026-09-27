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
    Chip,
    CircularProgress,
    IconButton,
    Paper,
    Stack,
    Tab,
    Tabs,
    Tooltip,
    Typography,
} from "@mui/material";

import { alpha } from "@mui/material/styles";

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";

import { toast } from "react-toastify";

import { StatTile } from "../charts/StatTile.jsx";

import {
    datum,
    datumZeit,
    kalenderwoche,
    zahl,
} from "../historie/format.js";

import {
    GebindeStepper,
    VerlaufLegende,
    VerlaufPunkte,
} from "./Bausteine.jsx";

import {
    bestellEinheit,
    differenzText,
    downloadPdf,
    getBestellung,
    kategorieSumme,
    mitAntwort,
    nachtraeglich,
    positionEinfuegen,
    removeProdukt,
    setGebinde,
    verlaufTexte,
    wirdBestellt,
} from "./bestellung.js";

import { ProduktHinzufuegen } from "./ProduktHinzufuegen.jsx";


const DIFFERENZ_FARBE = {
    zuViel: "warning.dark",
    zuWenig: "error.main",
    genau: "success.main",
};


/**
 * ============================================================================
 * Bestellung festlegen (Rolle Organisator)
 * ============================================================================
 *
 * Nach der Deadline wird hier festgelegt, was aus der abgelaufenen Runde
 * beim Händler bestellt wird und im PDF landet. Geändert werden nur die
 * Gebinde – die Bestellungen der Mitglieder bleiben unverändert.
 */
export function BestellungFestlegen() {
    const [
        bestellung,
        setBestellung,
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
        speichert,
        setSpeichert,
    ] = useState({});

    const [
        dialogOffen,
        setDialogOffen,
    ] = useState(false);

    const [
        pdfLaedt,
        setPdfLaedt,
    ] = useState(false);

    const [
        bereich,
        setBereich,
    ] = useState("frisch");


    const laden = useCallback(() => {
        let aktiv = true;

        setLaedt(true);

        getBestellung()
            .then(data => {
                if (aktiv) {
                    setBestellung(data);
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


    const aktualisiere = (produktId, aendern) =>
        setBestellung(b => ({
            ...b,
            kategorien: b.kategorien.map(k => ({
                ...k,
                positionen: k.positionen.map(p =>
                    p.produktId === produktId
                        ? aendern(p)
                        : p
                ),
            })),
        }));


    const aendereGebinde =
        async (position, anzahl) => {
            setSpeichert(s => ({ ...s, [position.produktId]: true }));

            try {
                const antwort =
                    await setGebinde(position.produktId, anzahl);

                aktualisiere(
                    position.produktId,
                    p => mitAntwort(p, antwort)
                );
            } catch (saveError) {
                toast.error(`${position.produkt}: ${saveError.message}`);
            } finally {
                setSpeichert(s => ({ ...s, [position.produktId]: false }));
            }
        };


    const entferne =
        async position => {
            setSpeichert(s => ({ ...s, [position.produktId]: true }));

            try {
                await removeProdukt(position.produktId);

                setBestellung(b => ({
                    ...b,
                    kategorien: b.kategorien
                        .map(k => ({
                            ...k,
                            positionen: k.positionen.filter(p => p.produktId !== position.produktId),
                        }))
                        .filter(k => k.positionen.length > 0),
                }));

                toast.success(`${position.produkt} entfernt.`);
            } catch (saveError) {
                toast.error(`${position.produkt}: ${saveError.message}`);
                setSpeichert(s => ({ ...s, [position.produktId]: false }));
            }
        };


    const hinzugefuegt =
        (antwort, produkt) => {
            setBestellung(b => ({
                ...b,
                kategorien: positionEinfuegen(b.kategorien, antwort, produkt),
            }));

            setDialogOffen(false);
            toast.success(`${antwort.produkt} hinzugefügt.`);
        };


    const pdf =
        async () => {
            setPdfLaedt(true);

            try {
                await downloadPdf(
                    `Bestellung_${kalenderwoche(bestellung.ende).replace(/\s+/g, "_")}.pdf`
                );
            } catch (downloadError) {
                toast.error(`PDF: ${downloadError.message}`);
            } finally {
                setPdfLaedt(false);
            }
        };


    const kennzahlen =
        useMemo(() => {
            const positionen =
                bestellung?.kategorien.flatMap(k => k.positionen) ?? [];

            return {
                bestellt: positionen.filter(wirdBestellt).length,
                ohneGebinde: positionen.filter(p => !wirdBestellt(p) && !nachtraeglich(p)).length,
                zuViel: positionen.filter(p => p.zuVielZuWenig > 0.0005).length,
                zuWenig: positionen.filter(p => p.zuVielZuWenig < -0.0005).length,
                ids: new Set(positionen.map(p => p.produktId)),
            };
        }, [bestellung]);


    if (!bestellung && laedt) {
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


    if (error && !bestellung) {
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


    if (!bestellung.ende) {
        return (
            <Alert severity="info">
                Es gibt noch keine Bestellrunde.
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
            {/* Kopf */}
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
                        md: "row",
                    }}
                    spacing={2}
                    sx={{
                        alignItems: {
                            md: "flex-start",
                        },
                        justifyContent: "space-between",
                    }}
                >
                    <Box
                        sx={{
                            minWidth: 0,
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 700,
                            }}
                        >
                            Bestellung {kalenderwoche(bestellung.ende)}
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            {bestellung.start
                                ? `Bestellungen vom ${datum(bestellung.start)} bis ${datum(bestellung.ende)}. `
                                : `Bestellungen bis ${datum(bestellung.ende)}. `}
                            Lege fest, was beim Händler bestellt wird und im PDF landet.
                            Die Bestellungen der Mitglieder bleiben dabei unverändert.
                        </Typography>

                        {bestellung.naechsteRunde && (
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                    display: "block",
                                    mt: 0.5,
                                }}
                            >
                                Ab {datumZeit(bestellung.naechsteRunde)} erscheint hier die nächste Runde.
                            </Typography>
                        )}
                    </Box>

                    <Stack
                        direction="row"
                        spacing={1}
                        useFlexGap
                        sx={{
                            flexWrap: "wrap",
                            flexShrink: 0,
                        }}
                    >
                        {/* Ergänzen geht nur bei Frisch – Brot hat keine Gebinde */}
                        {bereich === "frisch" && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                disabled={!bestellung.uebersichtId}
                                onClick={() =>
                                    setDialogOffen(true)
                                }
                            >
                                Produkt hinzufügen
                            </Button>
                        )}

                        <Button
                            variant="outlined"
                            startIcon={
                                pdfLaedt
                                    ? <CircularProgress size={16} />
                                    : <DownloadOutlinedIcon />
                            }
                            disabled={!bestellung.uebersichtId || pdfLaedt}
                            onClick={pdf}
                        >
                            PDF
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


            {!bestellung.uebersichtId ? (
                <Alert severity="info">
                    Für diese Runde gibt es noch keine Bestellübersicht. Sie entsteht,
                    sobald die Deadline abgelaufen ist.
                </Alert>
            ) : (
                <>
                    <Tabs
                        value={bereich}
                        onChange={(_, next) =>
                            setBereich(next)
                        }
                        sx={{
                            borderBottom: 1,
                            borderColor: "divider",
                        }}
                    >
                        <Tab
                            value="frisch"
                            label={
                                <TabLabel
                                    text="Frisch"
                                    anzahl={kennzahlen.ids.size}
                                />
                            }
                        />

                        <Tab
                            value="brot"
                            label={
                                <TabLabel
                                    text="Brot"
                                    anzahl={bestellung.brot.length}
                                />
                            }
                        />
                    </Tabs>


                    {bereich === "frisch" ? (
                        bestellung.kategorien.length === 0 ? (
                            <Alert severity="info">
                                In dieser Runde wurde kein Frisch-Produkt bestellt. Über
                                „Produkt hinzufügen" kannst du trotzdem etwas bestellen.
                            </Alert>
                        ) : (
                            <>
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
                                        label="Wird bestellt"
                                        value={kennzahlen.bestellt}
                                        hint="Produkte mit Gebinde"
                                    />

                                    <StatTile
                                        label="Ohne Gebinde"
                                        value={kennzahlen.ohneGebinde}
                                        hint="gewünscht, aber nicht bestellt"
                                    />

                                    <StatTile
                                        label="Zu viel"
                                        value={kennzahlen.zuViel}
                                        hint="Produkte mit Rest"
                                    />

                                    <StatTile
                                        label="Zu wenig"
                                        value={kennzahlen.zuWenig}
                                        hint="Produkte, die nicht reichen"
                                    />
                                </Box>


                                <VerlaufLegende />


                                {bestellung.kategorien.map(kategorie => (
                                    <KategorieKarte
                                        key={kategorie.name}
                                        kategorie={kategorie}
                                        verlaufRunden={bestellung.verlaufRunden}
                                        speichert={speichert}
                                        onGebinde={aendereGebinde}
                                        onEntfernen={entferne}
                                    />
                                ))}
                            </>
                        )
                    ) : bestellung.brot.length === 0 ? (
                        <Alert severity="info">
                            In dieser Runde wurde kein Brot bestellt.
                        </Alert>
                    ) : (
                        <>
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
                                    label="Sorten"
                                    value={bestellung.brot.length}
                                    hint="werden bestellt"
                                />

                                <StatTile
                                    label="Brote gesamt"
                                    value={zahl(bestellung.brot.reduce((acc, b) => acc + b.menge, 0))}
                                    hint="Stück"
                                />
                            </Box>

                            <BrotKarte brot={bestellung.brot} />
                        </>
                    )}
                </>
            )}


            <ProduktHinzufuegen
                offen={dialogOffen}
                vorhandeneIds={kennzahlen.ids}
                onClose={() =>
                    setDialogOffen(false)
                }
                onHinzugefuegt={hinzugefuegt}
            />
        </Stack>
    );
}


function TabLabel({ text, anzahl }) {
    return (
        <Stack
            direction="row"
            spacing={1}
            sx={{
                alignItems: "center",
            }}
        >
            <span>{text}</span>

            <Chip
                size="small"
                label={anzahl}
            />
        </Stack>
    );
}


// =============================================================================
// Kategorie
// =============================================================================

function KategorieKarte({ kategorie, verlaufRunden, speichert, onGebinde, onEntfernen }) {
    const summe =
        kategorieSumme(kategorie);

    const gewaehlt =
        kategorie.positionen.filter(wirdBestellt);

    return (
        <Paper
            elevation={0}
            sx={{
                border: 1,
                borderColor: "divider",
                overflow: "hidden",
            }}
        >
            <Box
                sx={{
                    px: {
                        xs: 2,
                        sm: 2.5,
                    },
                    py: 1.5,
                    bgcolor: "action.hover",
                }}
            >
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                        alignItems: "center",
                    }}
                >
                    <Typography
                        variant="subtitle1"
                        sx={{
                            fontWeight: 700,
                        }}
                    >
                        {kategorie.name}
                    </Typography>

                    {kategorie.mischbar && (
                        <Chip
                            size="small"
                            label="mischbar"
                            color="primary"
                            variant="outlined"
                        />
                    )}
                </Stack>

                {kategorie.mischbar && (
                    <>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                mt: 0.5,
                            }}
                        >
                            {gewaehlt.length === 0
                                ? "Aktuell wird keine Sorte bestellt."
                                : `Bestellt wird: ${gewaehlt.map(p => p.produkt).join(", ")}.`}
                            {" "}Wer eine Sorte ohne Gebinde bestellt hat, nimmt beim Einkauf
                            eine bestellte Sorte aus „Zu viel".
                        </Typography>

                        {/* Summe nur bei einheitlicher Einheit sinnvoll */}
                        {summe.einheit && (
                        <Typography
                            variant="body2"
                            sx={{
                                mt: 0.5,
                                fontWeight: 600,
                            }}
                        >
                            Gewünscht {zahl(summe.gewollt)}{" "}{summe.einheit}
                            {" · "}bestellt {zahl(summe.bestellt)}{" "}{summe.einheit}
                            {Math.abs(summe.differenz) > 0.0005 && (
                                <Box
                                    component="span"
                                    sx={{
                                        color: summe.differenz > 0
                                            ? DIFFERENZ_FARBE.zuViel
                                            : DIFFERENZ_FARBE.zuWenig,
                                    }}
                                >
                                    {" · "}
                                    {zahl(Math.abs(summe.differenz))}{" "}{summe.einheit}
                                    {summe.differenz > 0 ? " zu viel" : " zu wenig"}
                                </Box>
                            )}
                        </Typography>
                        )}
                    </>
                )}
            </Box>

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
                {kategorie.positionen.map(position => (
                    <PositionZeile
                        key={position.produktId}
                        position={position}
                        mischbar={kategorie.mischbar}
                        verlaufRunden={verlaufRunden}
                        speichert={Boolean(speichert[position.produktId])}
                        onGebinde={onGebinde}
                        onEntfernen={onEntfernen}
                    />
                ))}
            </Stack>
        </Paper>
    );
}


function PositionZeile({ position, mischbar, verlaufRunden, speichert, onGebinde, onEntfernen }) {
    const einheit =
        bestellEinheit(position);

    const bestellt =
        wirdBestellt(position);

    const differenz =
        differenzText(position);

    const texte =
        verlaufTexte(position);

    return (
        <Box
            sx={theme => ({
                px: {
                    xs: 2,
                    sm: 2.5,
                },
                py: 1.5,
                display: "grid",
                gap: {
                    xs: 1.25,
                    md: 2,
                },
                alignItems: "center",
                gridTemplateColumns: {
                    xs: "minmax(0, 1fr)",
                    md: "minmax(0, 1.5fr) minmax(0, 1.5fr) auto",
                },
                // Bei mischbaren Sorten die gewählte hervorheben
                ...(mischbar && bestellt && {
                    bgcolor: alpha(theme.palette.primary.main, 0.06),
                    boxShadow: `inset 3px 0 0 ${theme.palette.primary.main}`,
                }),
            })}
        >
            <Box
                sx={{
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
                        sx={{
                            fontWeight: 600,
                        }}
                    >
                        {position.produkt}
                    </Typography>

                    <Chip
                        size="small"
                        variant="outlined"
                        color={bestellt ? "success" : "default"}
                        label={bestellt ? "wird bestellt" : "entfällt"}
                        sx={{
                            fontWeight: 600,
                        }}
                    />

                    {nachtraeglich(position) && (
                        <Chip
                            size="small"
                            label="ergänzt"
                        />
                    )}
                </Stack>

                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    {nachtraeglich(position)
                        ? "Von niemandem bestellt"
                        : `${position.besteller} ${position.besteller === 1 ? "Person" : "Personen"} · ${zahl(position.gewollteMenge)} ${einheit} gewünscht`}
                    {position.gebindegroesse > 0 &&
                        ` · Gebinde à ${zahl(position.gebindegroesse)} ${einheit}`}
                </Typography>
            </Box>

            <Box
                sx={{
                    minWidth: 0,
                }}
            >
                <VerlaufPunkte
                    verlaufRunden={verlaufRunden}
                    position={position}
                />

                {texte.length > 0 && (
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                            display: "block",
                        }}
                    >
                        {texte.join(" · ")}
                    </Typography>
                )}
            </Box>

            <Stack
                direction="row"
                spacing={1}
                sx={{
                    alignItems: "center",
                    justifySelf: {
                        md: "end",
                    },
                }}
            >
                <Box>
                    <GebindeStepper
                        position={position}
                        speichert={speichert}
                        onChange={onGebinde}
                    />

                    <Typography
                        variant="caption"
                        sx={{
                            display: "block",
                            textAlign: "center",
                            mt: 0.5,
                            fontWeight: 600,
                            color: DIFFERENZ_FARBE[differenz.richtung],
                        }}
                    >
                        {differenz.text}
                    </Typography>
                </Box>

                {nachtraeglich(position) && (
                    <Tooltip title="Wieder entfernen">
                        <span>
                            <IconButton
                                aria-label={`${position.produkt} entfernen`}
                                disabled={speichert}
                                onClick={() =>
                                    onEntfernen(position)
                                }
                            >
                                <DeleteOutlineIcon />
                            </IconButton>
                        </span>
                    </Tooltip>
                )}
            </Stack>
        </Box>
    );
}


// =============================================================================
// Brot (nur Anzeige – ohne Gebinde)
// =============================================================================

function BrotKarte({ brot }) {
    return (
        <Paper
            elevation={0}
            sx={{
                border: 1,
                borderColor: "divider",
                overflow: "hidden",
            }}
        >
            <Box
                sx={{
                    px: {
                        xs: 2,
                        sm: 2.5,
                    },
                    py: 1.5,
                    bgcolor: "action.hover",
                }}
            >
                <Typography
                    variant="subtitle1"
                    sx={{
                        fontWeight: 700,
                    }}
                >
                    Brot
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    Wird so bestellt, wie es bestellt wurde.
                </Typography>
            </Box>

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
                {brot.map(position => (
                    <Stack
                        key={position.produktId}
                        direction="row"
                        spacing={2}
                        sx={{
                            px: {
                                xs: 2,
                                sm: 2.5,
                            },
                            py: 1.25,
                            alignItems: "baseline",
                            justifyContent: "space-between",
                        }}
                    >
                        <Typography
                            sx={{
                                fontWeight: 600,
                            }}
                        >
                            {position.produkt}
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                whiteSpace: "nowrap",
                            }}
                        >
                            {zahl(position.menge)}{" "}Stück
                            {" · "}
                            {position.besteller} {position.besteller === 1 ? "Person" : "Personen"}
                        </Typography>
                    </Stack>
                ))}
            </Stack>
        </Paper>
    );
}
