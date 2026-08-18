import React, {
    useEffect,
    useState,
} from "react";

import {
    Alert,
    Box,
    Button,
    CircularProgress,
    IconButton,
    InputAdornment,
    Paper,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";

import HelpOutlinedIcon from "@mui/icons-material/HelpOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

import { toast } from "react-toastify";

import { useApi } from "../ApiService.jsx";


function HelpTooltip({
    title,
    children,
}) {
    return (
        <Tooltip
            arrow
            placement="right"
            title={
                <Box
                    sx={{
                        maxWidth: 380,
                    }}
                >
                    <Typography
                        variant="subtitle2"
                        fontWeight={700}
                        gutterBottom
                    >
                        {title}
                    </Typography>

                    <Typography
                        component="div"
                        variant="body2"
                    >
                        {children}
                    </Typography>
                </Box>
            }
        >
            <IconButton
                size="small"
                aria-label={`Hilfe zu ${title}`}
            >
                <HelpOutlinedIcon
                    fontSize="small"
                />
            </IconButton>
        </Tooltip>
    );
}


export function AdminConfig() {
    const api = useApi();

    const [
        form,
        setForm,
    ] = useState({
        deliverycost: "",
        threshold: "",
        einkaufEmailText: "",
        einkaufsmanagementEmailText:
            "",
        lagermeisterEmailText:
            "",
    });

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        saving,
        setSaving,
    ] = useState(false);


    // =========================================================================
    // Laden
    // =========================================================================

    useEffect(() => {
        let active = true;


        const loadConfig =
            async () => {
                setLoading(true);

                try {
                    const response =
                        await api.readConfig();


                    if (!response.ok) {
                        throw new Error(
                            `HTTP ${response.status}`
                        );
                    }


                    const data =
                        await response.json();


                    if (
                        !active ||
                        !data
                    ) {
                        return;
                    }


                    setForm({
                        deliverycost:
                            data.deliverycost ??
                            "",

                        threshold:
                            data.threshold ??
                            "",

                        einkaufEmailText:
                            data.einkaufEmailText ??
                            "",

                        einkaufsmanagementEmailText:
                            data.einkaufsmanagementEmailText ??
                            "",

                        lagermeisterEmailText:
                            data.lagermeisterEmailText ??
                            "",
                    });
                } catch (error) {
                    console.error(
                        "Konfiguration konnte nicht geladen werden:",
                        error
                    );

                    toast.error(
                        "Die Konfiguration konnte nicht geladen werden."
                    );
                } finally {
                    if (active) {
                        setLoading(
                            false
                        );
                    }
                }
            };


        loadConfig();


        return () => {
            active = false;
        };
    }, [api]);


    // =========================================================================
    // Eingabe
    // =========================================================================

    const change =
        field => event => {
            setForm(
                previous => ({
                    ...previous,

                    [field]:
                        event.target
                            .value,
                })
            );
        };


    // =========================================================================
    // Speichern
    // =========================================================================

    const handleSubmit =
        async () => {
            setSaving(true);


            try {
                const response =
                    await api.updateConfig(
                        {
                            deliverycost:
                                Number(
                                    form.deliverycost
                                ),

                            threshold:
                                Number(
                                    form.threshold
                                ),

                            einkaufEmailText:
                                form.einkaufEmailText,

                            einkaufsmanagementEmailText:
                                form.einkaufsmanagementEmailText,

                            lagermeisterEmailText:
                                form.lagermeisterEmailText,
                        }
                    );


                if (!response.ok) {
                    toast.error(
                        "Die Konfiguration konnte nicht gespeichert werden."
                    );

                    return;
                }


                toast.success(
                    "Die Konfiguration wurde erfolgreich aktualisiert."
                );
            } catch (error) {
                console.error(
                    "Fehler beim Aktualisieren der Konfiguration:",
                    error
                );

                toast.error(
                    "Beim Speichern der Konfiguration ist ein Fehler aufgetreten."
                );
            } finally {
                setSaving(false);
            }
        };


    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: 300,

                    display: "flex",
                    alignItems:
                        "center",
                    justifyContent:
                        "center",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }


    return (
        <Stack spacing={3}>
            <Box>
                <Typography
                    variant="h2"
                    gutterBottom
                >
                    Konfiguration
                </Typography>

                <Typography
                    color="text.secondary"
                >
                    Allgemeine
                    Einstellungen sowie
                    Vorlagen für
                    automatisch erzeugte
                    E-Mails.
                </Typography>
            </Box>


            <Paper
                elevation={0}
                sx={{
                    p: {
                        xs: 2,
                        sm: 3,
                    },

                    border: 1,
                    borderColor:
                        "divider",
                }}
            >
                <Stack spacing={3}>
                    <Typography
                        variant="h5"
                    >
                        Bestellung
                    </Typography>


                    <TextField
                        fullWidth
                        label="Lieferkosten"
                        type="number"
                        value={
                            form.deliverycost
                        }
                        onChange={change(
                            "deliverycost"
                        )}
                        slotProps={{
                            input: {
                                endAdornment:
                                    (
                                        <InputAdornment position="end">
                                            %
                                        </InputAdornment>
                                    ),
                            },

                            htmlInput: {
                                min: 0,
                                step: 0.1,
                            },
                        }}
                    />


                    <TextField
                        fullWidth
                        label="Gebinde-Schwellwert"
                        type="number"
                        value={
                            form.threshold
                        }
                        onChange={change(
                            "threshold"
                        )}
                        slotProps={{
                            input: {
                                endAdornment:
                                    (
                                        <InputAdornment position="end">
                                            %

                                            <HelpTooltip title="Gebinde-Schwellwert">
                                                Der
                                                Schwellwert
                                                bestimmt,
                                                ab welchem
                                                Anteil eines
                                                Gebindes
                                                bestellt
                                                wird. Bei
                                                80 % und
                                                einer
                                                Gebindegröße
                                                von 10 kg
                                                wird ab
                                                einer
                                                Bestellmenge
                                                von 8 kg ein
                                                Gebinde
                                                bestellt.
                                            </HelpTooltip>
                                        </InputAdornment>
                                    ),
                            },

                            htmlInput: {
                                min: 0,
                                max: 100,
                            },
                        }}
                    />
                </Stack>
            </Paper>


            <Paper
                elevation={0}
                sx={{
                    p: {
                        xs: 2,
                        sm: 3,
                    },

                    border: 1,
                    borderColor:
                        "divider",
                }}
            >
                <Stack spacing={3}>
                    <Typography
                        variant="h5"
                    >
                        E-Mail-Vorlagen
                    </Typography>


                    <Box>
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={0.5}
                            sx={{
                                mb: 1,
                            }}
                        >
                            <Typography
                                fontWeight={
                                    600
                                }
                            >
                                Einkauf
                            </Typography>

                            <HelpTooltip title="E-Mail nach Einkauf">
                                Diese
                                Nachricht
                                erhält ein
                                Mitglied nach
                                einem Einkauf.
                                Platzhalter:
                                <br />
                                <strong>
                                    %personID%
                                </strong>
                                ,{" "}
                                <strong>
                                    %currentDate%
                                </strong>
                                ,{" "}
                                <strong>
                                    %frischEinkauf%
                                </strong>
                                ,{" "}
                                <strong>
                                    %brotEinkauf%
                                </strong>
                                ,{" "}
                                <strong>
                                    %lagerEinkauf%
                                </strong>
                                ,{" "}
                                <strong>
                                    %gesamtKosten%
                                </strong>
                                .
                            </HelpTooltip>
                        </Stack>

                        <TextField
                            fullWidth
                            multiline
                            minRows={8}
                            value={
                                form.einkaufEmailText
                            }
                            onChange={change(
                                "einkaufEmailText"
                            )}
                        />
                    </Box>


                    <Box>
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={0.5}
                            sx={{
                                mb: 1,
                            }}
                        >
                            <Typography
                                fontWeight={
                                    600
                                }
                            >
                                Einkaufsmanagement
                            </Typography>

                            <HelpTooltip title="E-Mail an Einkaufsmanagement">
                                Diese
                                Nachricht
                                wird nach
                                einem Einkauf
                                an das
                                Einkaufsmanagement
                                geschickt.
                                Platzhalter
                                sind unter
                                anderem{" "}
                                <strong>
                                    %personID%
                                </strong>
                                ,{" "}
                                <strong>
                                    %currentDate%
                                </strong>
                                ,{" "}
                                <strong>
                                    %frischKosten%
                                </strong>
                                ,{" "}
                                <strong>
                                    %brotKosten%
                                </strong>
                                ,{" "}
                                <strong>
                                    %lagerKosten%
                                </strong>
                                ,{" "}
                                <strong>
                                    %zuVielKosten%
                                </strong>
                                ,{" "}
                                <strong>
                                    %lieferKosten%
                                </strong>{" "}
                                und{" "}
                                <strong>
                                    %gesamtKosten%
                                </strong>
                                .
                            </HelpTooltip>
                        </Stack>

                        <TextField
                            fullWidth
                            multiline
                            minRows={8}
                            value={
                                form.einkaufsmanagementEmailText
                            }
                            onChange={change(
                                "einkaufsmanagementEmailText"
                            )}
                        />
                    </Box>


                    <Box>
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={0.5}
                            sx={{
                                mb: 1,
                            }}
                        >
                            <Typography
                                fontWeight={
                                    600
                                }
                            >
                                Lagermeister
                            </Typography>

                            <HelpTooltip title="E-Mail an Lagermeister">
                                Diese
                                Nachricht
                                wird beim
                                Versand des
                                aktuellen
                                Lagerbestands
                                verwendet.
                                Der
                                Benutzername
                                kann über{" "}
                                <strong>
                                    %personID%
                                </strong>{" "}
                                eingesetzt
                                werden.
                            </HelpTooltip>
                        </Stack>

                        <TextField
                            fullWidth
                            multiline
                            minRows={8}
                            value={
                                form.lagermeisterEmailText
                            }
                            onChange={change(
                                "lagermeisterEmailText"
                            )}
                        />
                    </Box>
                </Stack>
            </Paper>


            <Button
                size="large"
                variant="contained"
                startIcon={
                    <SaveOutlinedIcon />
                }
                disabled={saving}
                onClick={
                    handleSubmit
                }
                sx={{
                    alignSelf:
                        "flex-start",
                }}
            >
                {saving
                    ? "Wird gespeichert …"
                    : "Konfiguration speichern"}
            </Button>
        </Stack>
    );
}