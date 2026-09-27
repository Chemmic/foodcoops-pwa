import React, {
    useEffect,
    useState,
} from "react";

import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    InputAdornment,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import { euro } from "../historie/format.js";

import { ChargenListe } from "./LagerPreis.jsx";


const MENGE =
    new Intl.NumberFormat("de-DE", {
        maximumFractionDigits: 3,
    });


/**
 * Neue Lieferung einlagern. Die vorhandene Ware behält ihren Preis und
 * wird zuerst verkauft – erst danach gilt der neue Preis.
 */
export function EinlagernDialog({
    offen,
    produkt,
    onClose,
    onEinlagern,
}) {
    const [
        menge,
        setMenge,
    ] = useState("");

    const [
        preis,
        setPreis,
    ] = useState("");

    const [
        fehler,
        setFehler,
    ] = useState(null);

    const [
        speichert,
        setSpeichert,
    ] = useState(false);


    useEffect(() => {
        if (offen) {
            setMenge("");
            setPreis(produkt?.preis != null ? String(produkt.preis) : "");
            setFehler(null);
        }
    }, [offen, produkt]);


    if (!produkt) {
        return null;
    }


    const einheit =
        produkt.lagerbestand?.einheit?.name ?? "";

    const ist =
        Number(produkt.lagerbestand?.istLagerbestand ?? 0);

    const soll =
        Number(produkt.lagerbestand?.sollLagerbestand ?? 0);

    const zahlMenge =
        Number(menge);

    const zahlPreis =
        Number(preis);

    const gueltig =
        menge !== "" &&
        zahlMenge > 0 &&
        preis !== "" &&
        zahlPreis >= 0;

    // Soll dient nur der Einkaufsliste – mehr Ware als Soll ist erlaubt
    const danach =
        ist + (zahlMenge > 0 ? zahlMenge : 0);

    const anderePreis =
        ist > 0 &&
        preis !== "" &&
        Math.abs(zahlPreis - Number(produkt.preis ?? 0)) > 0.0005;


    const speichern =
        async () => {
            setSpeichert(true);
            setFehler(null);

            try {
                await onEinlagern(produkt, zahlMenge, zahlPreis);
            } catch (error) {
                setFehler(error.message);
            } finally {
                setSpeichert(false);
            }
        };


    return (
        <Dialog
            open={offen}
            onClose={speichert ? undefined : onClose}
            fullWidth
            maxWidth="xs"
        >
            <DialogTitle>
                {produkt.name} einlagern
            </DialogTitle>

            <DialogContent>
                <Stack
                    spacing={2}
                    sx={{
                        pt: 1,
                    }}
                >
                    <Box>
                        <Typography
                            variant="subtitle2"
                            sx={{
                                fontWeight: 700,
                                mb: 0.5,
                            }}
                        >
                            Aktueller Bestand
                        </Typography>

                        <ChargenListe produkt={produkt} />
                    </Box>

                    {fehler && (
                        <Alert severity="error">
                            {fehler}
                        </Alert>
                    )}

                    <TextField
                        label="Neue Menge"
                        type="number"
                        value={menge}
                        autoFocus
                        onChange={event =>
                            setMenge(event.target.value)
                        }
                        helperText={
                            `Danach: ${MENGE.format(danach)} ${einheit} (Soll: ${MENGE.format(soll)} ${einheit})`
                        }
                        slotProps={{
                            htmlInput: {
                                min: 0,
                                step: "any",
                            },
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        {einheit}
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />

                    <TextField
                        label={`Preis pro ${einheit || "Einheit"}`}
                        type="number"
                        value={preis}
                        onChange={event =>
                            setPreis(event.target.value)
                        }
                        slotProps={{
                            htmlInput: {
                                min: 0,
                                step: "0.01",
                            },
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        €
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />

                    {anderePreis && (
                        <Alert severity="info">
                            Die vorhandenen {MENGE.format(ist)} {einheit} behalten ihren Preis
                            und werden zuerst verkauft – erst danach gilt {euro(zahlPreis)}.
                        </Alert>
                    )}
                </Stack>
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
                    disabled={!gueltig || speichert}
                    startIcon={
                        speichert
                            ? <CircularProgress size={16} />
                            : null
                    }
                >
                    Einlagern
                </Button>
            </DialogActions>
        </Dialog>
    );
}
