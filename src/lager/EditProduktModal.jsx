import React from "react";

import {
    Alert,
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import CloseIcon from "@mui/icons-material/Close";
import MoveToInboxOutlinedIcon from "@mui/icons-material/MoveToInboxOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

import { euro } from "../historie/format.js";

import { LagerModal } from "./LagerModal.jsx";
import { ChargenListe } from "./LagerPreis.jsx";
import { chargenVon, mehrerePreise } from "./chargen.js";


const MENGE =
    new Intl.NumberFormat("de-DE", {
        maximumFractionDigits: 3,
    });


const FIELD_DEFINITIONS = [
    {
        accessor: "name",
        name: "Name",
    },
    {
        accessor:
            "lagerbestand.istLagerbestand",
        name: "Ist Lagerbestand",
        type: "number",
    },
    {
        accessor:
            "lagerbestand.sollLagerbestand",
        name: "Soll Lagerbestand",
        type: "number",
    },
    {
        accessor:
            "lagerbestand.einheit.name",
        name: "Einheit",
        type: "einheit",
    },
    {
        accessor: "kategorie.name",
        name: "Kategorie",
        type: "kategorie",
    },
    {
        accessor: "preis",
        name: "Preis in €",
        type: "number",
    },
];


function getNestedValue(
    object,
    path
) {
    return path
        .split(".")
        .reduce(
            (current, key) =>
                current?.[key],
            object
        );
}


export function EditProduktModal(
    props
) {
    const produkt =
        props.produkt ?? null;

    const [newData, setNewData] =
        React.useState({});

    // Neuer Preis auch für die schon vorhandene Ware?
    const [preisFuerBestand, setPreisFuerBestand] =
        React.useState(false);


    React.useEffect(() => {
        if (props.show) {
            setNewData({});
            setPreisFuerBestand(false);
        }
    }, [props.show, produkt?.id]);


    const close = () => {
        setNewData({});
        setPreisFuerBestand(false);
        props.close();
    };


    const setChangedValue = (
        accessor,
        name,
        value
    ) => {
        setNewData(previous => ({
            ...previous,

            [accessor]: {
                name,
                value,
            },
        }));
    };


    const getCurrentValue = (
        accessor
    ) => {
        if (
            Object.prototype.hasOwnProperty.call(
                newData,
                accessor
            )
        ) {
            return newData[
                accessor
            ].value;
        }

        return getNestedValue(
            produkt,
            accessor
        );
    };


    const save = () => {
        if (!produkt) {
            return;
        }

        props.persist(
            produkt,
            newData,
            {
                preisFuerBestand:
                    preisGeaendert &&
                    preisFuerBestand,
            }
        );

        close();
    };


    // =========================================================================
    // Bestand & Preis
    // =========================================================================

    const istVorher =
        Number(produkt?.lagerbestand?.istLagerbestand ?? 0);

    const istNachher =
        Number(getCurrentValue("lagerbestand.istLagerbestand") ?? 0);

    const preisVorher =
        Number(produkt?.preis ?? 0);

    const preisNachher =
        Number(getCurrentValue("preis") ?? 0);

    const preisGeaendert =
        Math.abs(preisNachher - preisVorher) > 0.0005;

    const zugang =
        istNachher - istVorher;

    const einheit =
        produkt?.lagerbestand?.einheit?.name ?? "";


    const remove = () => {
        if (!produkt) {
            return;
        }

        props.deleteProdukt(
            produkt
        );

        close();
    };


    const renderField = ({
        accessor,
        name,
        type,
    }) => {
        if (
            type === "einheit"
        ) {
            const changedId =
                newData[
                    "lagerbestand.einheit.id"
                ]?.value;

            const currentId =
                produkt?.lagerbestand
                    ?.einheit?.id;

            return (
                <TextField
                    key={accessor}
                    select
                    fullWidth
                    label={name}
                    value={
                        changedId ??
                        currentId ??
                        ""
                    }
                    onChange={event =>
                        setChangedValue(
                            "lagerbestand.einheit.id",
                            name,
                            event.target.value
                        )
                    }
                >
                    {props.einheiten.map(
                        einheit => (
                            <MenuItem
                                key={
                                    einheit.id
                                }
                                value={
                                    einheit.id
                                }
                            >
                                {
                                    einheit.name
                                }
                            </MenuItem>
                        )
                    )}
                </TextField>
            );
        }


        if (
            type === "kategorie"
        ) {
            const changedId =
                newData[
                    "kategorie.id"
                ]?.value;

            const currentId =
                produkt?.kategorie
                    ?.id;

            return (
                <TextField
                    key={accessor}
                    select
                    fullWidth
                    label={name}
                    value={
                        changedId ??
                        currentId ??
                        ""
                    }
                    onChange={event =>
                        setChangedValue(
                            "kategorie.id",
                            name,
                            event.target.value
                        )
                    }
                >
                    {props.kategorien.map(
                        kategorie => (
                            <MenuItem
                                key={
                                    kategorie.id
                                }
                                value={
                                    kategorie.id
                                }
                            >
                                {
                                    kategorie.name
                                }
                            </MenuItem>
                        )
                    )}
                </TextField>
            );
        }


        const value =
            getCurrentValue(
                accessor
            ) ?? "";

        return (
            <TextField
                key={accessor}
                fullWidth
                label={name}
                type={
                    type === "number"
                        ? "number"
                        : "text"
                }
                value={value}
                slotProps={
                    type === "number"
                        ? {
                            htmlInput: {
                                min: 0,
                            },
                        }
                        : undefined
                }
                onChange={event => {
                    const rawValue =
                        event.target.value;

                    setChangedValue(
                        accessor,
                        name,
                        type ===
                            "number" &&
                            rawValue !== ""
                            ? Number(
                                rawValue
                            )
                            : rawValue
                    );
                }}
            />
        );
    };


    const body = (
        <Stack spacing={2.5}>
            {FIELD_DEFINITIONS.map(
                renderField
            )}


            {/* Was passiert mit dem Preis der vorhandenen Ware? */}
            {zugang > 0.0005 && (
                <Alert severity="info">
                    Die zusätzlichen {MENGE.format(zugang)} {einheit} werden als neue
                    Lieferung zu {euro(preisNachher)} eingelagert. Die vorhandene Ware
                    wird zuerst verkauft.
                </Alert>
            )}

            {preisGeaendert && istVorher > 0.0005 && (
                <Box>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={preisFuerBestand}
                                onChange={event =>
                                    setPreisFuerBestand(
                                        event.target.checked
                                    )
                                }
                            />
                        }
                        label={`Neuer Preis gilt auch für die vorhandenen ${MENGE.format(istVorher)} ${einheit}`}
                    />

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            ml: 4,
                        }}
                    >
                        {preisFuerBestand
                            ? "Die ganze Ware wird ab jetzt zum neuen Preis verkauft."
                            : "Die vorhandene Ware behält ihren Preis und wird zuerst verkauft. Der neue Preis gilt für neu eingelagerte Ware."}
                    </Typography>
                </Box>
            )}


            {produkt && chargenVon(produkt).length > 0 && (
                <Box>
                    <Typography
                        variant="subtitle2"
                        sx={{
                            fontWeight: 700,
                            mb: 0.5,
                        }}
                    >
                        {mehrerePreise(chargenVon(produkt))
                            ? "Bestand zu verschiedenen Preisen"
                            : "Bestand"}
                    </Typography>

                    <ChargenListe produkt={produkt} />
                </Box>
            )}
        </Stack>
    );


    const footer = (
        <>
            <Button
                color="error"
                variant="outlined"
                startIcon={
                    <DeleteOutlinedIcon />
                }
                onClick={remove}
            >
                Produkt löschen
            </Button>

            {props.onEinlagern && (
                <Button
                    variant="outlined"
                    startIcon={
                        <MoveToInboxOutlinedIcon />
                    }
                    onClick={() => {
                        const aktuell = produkt;
                        close();
                        props.onEinlagern(aktuell);
                    }}
                >
                    Einlagern
                </Button>
            )}

            <Button
                variant="outlined"
                startIcon={<CloseIcon />}
                onClick={close}
            >
                Verwerfen
            </Button>

            <Button
                variant="contained"
                startIcon={
                    <SaveOutlinedIcon />
                }
                onClick={save}
                disabled={
                    Object.keys(
                        newData
                    ).length === 0
                }
            >
                Änderungen speichern
            </Button>
        </>
    );


    return (
        <LagerModal
            title="Produkt bearbeiten"
            body={body}
            footer={footer}
            show={props.show}
            hide={close}
            parentProps={props}
        />
    );
}