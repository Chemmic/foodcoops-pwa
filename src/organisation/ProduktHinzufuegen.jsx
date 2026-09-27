import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import { zahl } from "../historie/format.js";

import {
    addProdukt,
    getFrischProdukte,
} from "./bestellung.js";


/**
 * Ein Frisch-Produkt nachträglich in die Bestellung aufnehmen,
 * z.B. zum Auffüllen eines Gebindes oder als Abwechslung.
 */
export function ProduktHinzufuegen({
    offen,
    vorhandeneIds,
    onClose,
    onHinzugefuegt,
}) {
    const [
        produkte,
        setProdukte,
    ] = useState(null);

    const [
        produkt,
        setProdukt,
    ] = useState(null);

    const [
        gebinde,
        setGebinde,
    ] = useState("1");

    const [
        error,
        setError,
    ] = useState(null);

    const [
        speichert,
        setSpeichert,
    ] = useState(false);


    useEffect(() => {
        if (!offen) {
            return undefined;
        }

        let aktiv = true;

        setProdukt(null);
        setGebinde("1");
        setError(null);

        getFrischProdukte()
            .then(data => {
                if (aktiv) {
                    setProdukte(Array.isArray(data) ? data : []);
                }
            })
            .catch(loadError => {
                if (aktiv) {
                    setError(loadError.message);
                    setProdukte([]);
                }
            });

        return () => {
            aktiv = false;
        };
    }, [offen]);


    const optionen =
        useMemo(
            () =>
                (produkte ?? [])
                    .filter(p => !vorhandeneIds.has(p.id))
                    .sort((a, b) =>
                        (a.kategorie?.name ?? "").localeCompare(b.kategorie?.name ?? "", "de") ||
                        (a.name ?? "").localeCompare(b.name ?? "", "de")
                    ),
            [produkte, vorhandeneIds]
        );


    const anzahl =
        Number(gebinde);

    const gueltig =
        produkt &&
        gebinde !== "" &&
        Number.isFinite(anzahl) &&
        anzahl > 0 &&
        anzahl <= 999;

    const einheit =
        produkt?.spezialfallBestelleinheit
            ? "Stück"
            : produkt?.einheit?.name ?? "";


    const speichern =
        async () => {
            setSpeichert(true);
            setError(null);

            try {
                const antwort =
                    await addProdukt(produkt.id, anzahl);

                onHinzugefuegt(antwort, produkt);
            } catch (saveError) {
                setError(saveError.message);
            } finally {
                setSpeichert(false);
            }
        };


    return (
        <Dialog
            open={offen}
            onClose={speichert ? undefined : onClose}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle>
                Produkt hinzufügen
            </DialogTitle>

            <DialogContent>
                <Stack
                    spacing={2}
                    sx={{
                        pt: 1,
                    }}
                >
                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        Das Produkt wird zusätzlich beim Händler bestellt und landet
                        komplett auf der „Zu viel"-Liste.
                    </Typography>

                    {error && (
                        <Alert severity="error">
                            {error}
                        </Alert>
                    )}

                    <Autocomplete
                        options={optionen}
                        loading={produkte === null}
                        value={produkt}
                        onChange={(_, value) =>
                            setProdukt(value)
                        }
                        groupBy={option =>
                            option.kategorie?.name ?? "Ohne Kategorie"
                        }
                        getOptionLabel={option =>
                            option.name ?? ""
                        }
                        isOptionEqualToValue={(option, value) =>
                            option.id === value.id
                        }
                        renderOption={(props, option) => {
                            const { key, ...rest } = props;

                            return (
                                <Box
                                    key={key}
                                    component="li"
                                    {...rest}
                                >
                                    <Box>
                                        <Typography variant="body2">
                                            {option.name}
                                        </Typography>

                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Gebinde à {zahl(option.gebindegroesse)}{" "}
                                            {option.spezialfallBestelleinheit ? "Stück" : option.einheit?.name}
                                            {option.verfuegbarkeit === false && " · derzeit nicht verfügbar"}
                                        </Typography>
                                    </Box>
                                </Box>
                            );
                        }}
                        noOptionsText="Kein Produkt gefunden"
                        renderInput={params => (
                            <TextField
                                {...params}
                                label="Produkt"
                                autoFocus
                            />
                        )}
                    />

                    <TextField
                        label="Gebinde"
                        type="number"
                        value={gebinde}
                        onChange={event =>
                            setGebinde(event.target.value)
                        }
                        slotProps={{
                            htmlInput: {
                                min: 1,
                                max: 999,
                                step: 1,
                            },
                        }}
                        helperText={
                            produkt && Number.isFinite(anzahl) && anzahl > 0
                                ? `= ${zahl(anzahl * (produkt.gebindegroesse || 1))} ${einheit}`
                                : " "
                        }
                        sx={{
                            maxWidth: 200,
                        }}
                    />
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
                >
                    Hinzufügen
                </Button>
            </DialogActions>
        </Dialog>
    );
}
