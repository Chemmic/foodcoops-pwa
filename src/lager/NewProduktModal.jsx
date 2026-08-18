import React from "react";

import {
    Button,
    MenuItem,
    Stack,
    TextField,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

import { LagerModal } from "./LagerModal.jsx";
import { deepAssign } from "../util";


function capitalize(word = "") {
    return word.replace(
        /^\w/,
        character =>
            character.toUpperCase()
    );
}


function getColumnAccessor(column) {
    return (
        column.accessorKey ??
        column.accessor
    );
}


function getColumnName(column) {
    const accessor =
        getColumnAccessor(column);

    if (
        typeof column.header ===
        "string"
    ) {
        return column.header;
    }

    if (
        typeof column.Header ===
        "string"
    ) {
        return column.Header;
    }

    return capitalize(accessor);
}


function defaultData(columns) {
    const initial =
        Object.fromEntries(
            columns
                .map(column => {
                    const accessor =
                        getColumnAccessor(
                            column
                        );

                    if (!accessor) {
                        return null;
                    }

                    return [
                        accessor,
                        {
                            name:
                                getColumnName(
                                    column
                                ),
                            value: "",
                        },
                    ];
                })
                .filter(Boolean)
        );

    if (initial.name) {
        initial.name.value =
            "Produktname";
    }

    if (
        initial[
            "lagerbestand.istLagerbestand"
        ]
    ) {
        initial[
            "lagerbestand.istLagerbestand"
        ].value = 0;
    }

    if (
        initial[
            "lagerbestand.sollLagerbestand"
        ]
    ) {
        initial[
            "lagerbestand.sollLagerbestand"
        ].value = 0;
    }

    if (initial.preis) {
        initial.preis.value = 0;
    }

    return initial;
}


const NUMBER_FIELDS = new Set([
    "preis",
    "lagerbestand.istLagerbestand",
    "lagerbestand.sollLagerbestand",
]);


export function NewProduktModal(props) {
    const {
        columns = [],
        kategorien = [],
        einheiten = [],
    } = props;

    const [newData, setNewData] =
        React.useState({});


    const initial = React.useMemo(
        () => ({
            ...defaultData(columns),
            ...newData,
        }),
        [columns, newData]
    );


    const close = () => {
        props.close();
        setNewData({});
    };


    const setValue = (
        accessor,
        name,
        value
    ) => {
        let targetAccessor =
            accessor;

        if (
            accessor ===
            "lagerbestand.einheit.name"
        ) {
            targetAccessor =
                "lagerbestand.einheit.id";
        }

        if (
            accessor ===
            "kategorie.name"
        ) {
            targetAccessor =
                "kategorie.id";
        }

        setNewData(previous => ({
            ...previous,

            [targetAccessor]: {
                name,
                value,
            },
        }));
    };


    const save = () => {
        const result = {};

        for (
            const [
                accessor,
                { value },
            ] of Object.entries(initial)
        ) {
            if (
                accessor ===
                    "lagerbestand.einheit.name" ||
                accessor ===
                    "kategorie.name"
            ) {
                continue;
            }

            deepAssign(
                accessor,
                result,
                value
            );
        }

        for (
            const [
                accessor,
                { value },
            ] of Object.entries(newData)
        ) {
            deepAssign(
                accessor,
                result,
                value
            );
        }


        if (
            !result.lagerbestand
                ?.einheit?.id &&
            einheiten.length > 0
        ) {
            deepAssign(
                "lagerbestand.einheit.id",
                result,
                einheiten[0].id
            );
        }


        if (
            !result.kategorie?.id &&
            kategorien.length > 0
        ) {
            result.kategorie = {
                id: kategorien[0].id,
                name:
                    kategorien[0].name,
            };
        }


        props.create(result);

        close();
    };


    const renderField = (
        accessor,
        {
            name,
            value,
        }
    ) => {
        if (
            accessor ===
            "kategorie.name"
        ) {
            const selectedId =
                newData[
                    "kategorie.id"
                ]?.value ??
                kategorien[0]?.id ??
                "";

            return (
                <TextField
                    key={accessor}
                    select
                    fullWidth
                    label={name}
                    value={selectedId}
                    onChange={event =>
                        setValue(
                            accessor,
                            name,
                            event.target.value
                        )
                    }
                >
                    {kategorien.map(
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


        if (
            accessor ===
            "lagerbestand.einheit.name"
        ) {
            const selectedId =
                newData[
                    "lagerbestand.einheit.id"
                ]?.value ??
                einheiten[0]?.id ??
                "";

            return (
                <TextField
                    key={accessor}
                    select
                    fullWidth
                    label={name}
                    value={selectedId}
                    onChange={event =>
                        setValue(
                            accessor,
                            name,
                            event.target.value
                        )
                    }
                >
                    {einheiten.map(
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


        const numberField =
            NUMBER_FIELDS.has(
                accessor
            );

        return (
            <TextField
                key={accessor}
                fullWidth
                label={name}
                type={
                    numberField
                        ? "number"
                        : "text"
                }
                value={value ?? ""}
                slotProps={
                    numberField
                        ? {
                            htmlInput: {
                                min: 0,
                            },
                        }
                        : undefined
                }
                onChange={event => {
                    const inputValue =
                        event.target.value;

                    setValue(
                        accessor,
                        name,
                        numberField &&
                            inputValue !==
                                ""
                            ? Number(
                                inputValue
                            )
                            : inputValue
                    );
                }}
            />
        );
    };


    const body = (
        <Stack spacing={2.5}>
            {Object.entries(initial)
                .filter(
                    ([accessor]) =>
                        accessor !==
                        "lagerbestand.einheit.id"
                )
                .filter(
                    ([accessor]) =>
                        accessor !==
                        "kategorie.id"
                )
                .map(
                    ([
                        accessor,
                        field,
                    ]) =>
                        renderField(
                            accessor,
                            field
                        )
                )}
        </Stack>
    );


    const footer = (
        <>
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
                    kategorien.length ===
                        0 ||
                    einheiten.length === 0
                }
            >
                Produkt erstellen
            </Button>
        </>
    );


    return (
        <LagerModal
            title="Produkt erstellen"
            body={body}
            footer={footer}
            show={props.show}
            hide={close}
            parentProps={props}
        />
    );
}