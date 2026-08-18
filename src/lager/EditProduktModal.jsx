import React from "react";

import {
    Button,
    MenuItem,
    Stack,
    TextField,
} from "@mui/material";

import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import CloseIcon from "@mui/icons-material/Close";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

import { LagerModal } from "./LagerModal.jsx";


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


    React.useEffect(() => {
        if (props.show) {
            setNewData({});
        }
    }, [props.show, produkt?.id]);


    const close = () => {
        setNewData({});
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
            newData
        );

        close();
    };


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