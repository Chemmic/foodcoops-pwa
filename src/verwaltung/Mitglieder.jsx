import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Alert,
    Box,
    Button,
    CircularProgress,
    InputAdornment,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    TextField,
    Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

import {
    Link,
    useNavigate,
    useParams,
} from "react-router";

import {
    datum,
    euro,
} from "../historie/format.js";
import {
    getMitgliedHistorie,
    getMitglieder,
} from "../historie/historieApi.js";
import { HistorieAnsicht } from "../historie/HistorieAnsicht.jsx";


const SPALTEN = [
    { key: "personId", label: "Mitglied" },
    { key: "bestellungen", label: "Bestellungen", align: "right" },
    { key: "einkaeufe", label: "Einkäufe", align: "right" },
    { key: "ausgegeben", label: "Ausgegeben", align: "right" },
    { key: "letzteAktivitaet", label: "Zuletzt aktiv", align: "right" },
];


// =============================================================================
// Liste
// =============================================================================

export function Mitglieder() {
    const navigate =
        useNavigate();

    const [
        mitglieder,
        setMitglieder,
    ] = useState(null);

    const [
        error,
        setError,
    ] = useState(null);

    const [
        suche,
        setSuche,
    ] = useState("");

    const [
        sortierung,
        setSortierung,
    ] = useState({
        key: "letzteAktivitaet",
        richtung: "desc",
    });


    useEffect(() => {
        getMitglieder()
            .then(setMitglieder)
            .catch(loadError =>
                setError(loadError.message)
            );
    }, []);


    const gefiltert =
        useMemo(
            () => {
                const term =
                    suche
                        .trim()
                        .toLowerCase();

                const liste =
                    (mitglieder ?? []).filter(m =>
                        !term ||
                        [
                            m.personId,
                            m.name,
                            m.email,
                        ]
                            .filter(Boolean)
                            .some(wert =>
                                wert.toLowerCase().includes(term)
                            )
                    );

                const faktor =
                    sortierung.richtung === "asc"
                        ? 1
                        : -1;

                return [...liste].sort((a, b) => {
                    const va = a[sortierung.key];
                    const vb = b[sortierung.key];

                    if (va === vb) {
                        return 0;
                    }

                    if (va === null || va === undefined) {
                        return 1;
                    }

                    if (vb === null || vb === undefined) {
                        return -1;
                    }

                    return (
                        typeof va === "string"
                            ? va.localeCompare(vb, "de")
                            : va - vb
                    ) * faktor;
                });
            },
            [
                mitglieder,
                suche,
                sortierung,
            ]
        );


    if (error) {
        return (
            <Alert severity="error">
                {error}
            </Alert>
        );
    }


    if (!mitglieder) {
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


    return (
        <Stack spacing={2}>
            <TextField
                size="small"
                placeholder="Nach Name, Benutzername oder E-Mail suchen"
                value={suche}
                onChange={event =>
                    setSuche(event.target.value)
                }
                autoFocus
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
                    maxWidth: 420,
                }}
            />

            <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                    border: 1,
                    borderColor: "divider",
                }}
            >
                <Table
                    size="small"
                    sx={{
                        minWidth: 640,
                    }}
                >
                    <TableHead>
                        <TableRow>
                            {SPALTEN.map(spalte => (
                                <TableCell
                                    key={spalte.key}
                                    align={spalte.align}
                                    sortDirection={
                                        sortierung.key === spalte.key
                                            ? sortierung.richtung
                                            : false
                                    }
                                >
                                    <TableSortLabel
                                        active={sortierung.key === spalte.key}
                                        direction={
                                            sortierung.key === spalte.key
                                                ? sortierung.richtung
                                                : "desc"
                                        }
                                        onClick={() =>
                                            setSortierung(aktuell => ({
                                                key: spalte.key,
                                                richtung:
                                                    aktuell.key === spalte.key &&
                                                    aktuell.richtung === "desc"
                                                        ? "asc"
                                                        : "desc",
                                            }))
                                        }
                                    >
                                        {spalte.label}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {gefiltert.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={SPALTEN.length}
                                    sx={{
                                        py: 4,
                                        textAlign: "center",
                                        color: "text.secondary",
                                    }}
                                >
                                    Keine Mitglieder gefunden.
                                </TableCell>
                            </TableRow>
                        )}

                        {gefiltert.map(m => (
                            <TableRow
                                key={m.personId}
                                hover
                                tabIndex={0}
                                onClick={() =>
                                    navigate(encodeURIComponent(m.personId))
                                }
                                onKeyDown={event => {
                                    if (event.key === "Enter") {
                                        navigate(encodeURIComponent(m.personId));
                                    }
                                }}
                                sx={{
                                    cursor: "pointer",
                                }}
                            >
                                <TableCell>
                                    <Typography
                                        variant="body2"
                                        sx={{ fontWeight: 600 }}
                                    >
                                        {m.name || m.personId}
                                    </Typography>

                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        {[
                                            m.name ? m.personId : null,
                                            m.email,
                                        ]
                                            .filter(Boolean)
                                            .join(" · ")}
                                    </Typography>
                                </TableCell>

                                <TableCell align="right">
                                    {m.bestellungen}
                                </TableCell>

                                <TableCell align="right">
                                    {m.einkaeufe}
                                </TableCell>

                                <TableCell
                                    align="right"
                                    sx={{
                                        fontVariantNumeric: "tabular-nums",
                                    }}
                                >
                                    {euro(m.ausgegeben)}
                                </TableCell>

                                <TableCell align="right">
                                    {m.letzteAktivitaet
                                        ? datum(m.letzteAktivitaet)
                                        : "–"}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Typography
                variant="caption"
                color="text.secondary"
            >
                {gefiltert.length} von {mitglieder.length} Mitgliedern.
                Namen und E-Mail-Adressen kommen aus Keycloak.
            </Typography>
        </Stack>
    );
}


// =============================================================================
// Detail
// =============================================================================

export function MitgliedDetail() {
    const {
        personId,
    } = useParams();

    const [
        historie,
        setHistorie,
    ] = useState(null);

    const [
        mitglied,
        setMitglied,
    ] = useState(null);

    const [
        error,
        setError,
    ] = useState(null);


    useEffect(() => {
        setHistorie(null);
        setError(null);

        getMitgliedHistorie(personId)
            .then(setHistorie)
            .catch(loadError =>
                setError(loadError.message)
            );

        // Name / E-Mail – optional
        getMitglieder()
            .then(liste =>
                setMitglied(
                    liste.find(m => m.personId === personId) ?? null
                )
            )
            .catch(() => {});
    }, [personId]);


    return (
        <Stack spacing={2}>
            <Box>
                <Button
                    component={Link}
                    to=".."
                    relative="path"
                    startIcon={<ArrowBackIcon />}
                    size="small"
                >
                    Alle Mitglieder
                </Button>
            </Box>

            <Box>
                <Typography
                    variant="h5"
                    sx={{ fontWeight: 700 }}
                >
                    {mitglied?.name || personId}
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    {[
                        mitglied?.name ? personId : null,
                        mitglied?.email,
                    ]
                        .filter(Boolean)
                        .join(" · ") || " "}
                </Typography>
            </Box>

            {error && (
                <Alert severity="error">
                    {error}
                </Alert>
            )}

            {!historie && !error && (
                <Box
                    sx={{
                        py: 8,
                        display: "flex",
                        justifyContent: "center",
                    }}
                >
                    <CircularProgress />
                </Box>
            )}

            {historie && (
                <HistorieAnsicht
                    historie={historie}
                    personId={personId}
                    personName={mitglied?.name}
                />
            )}
        </Stack>
    );
}
