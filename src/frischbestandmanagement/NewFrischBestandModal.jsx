import React from "react";

import {
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    IconButton,
    MenuItem,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import HelpOutlinedIcon from "@mui/icons-material/HelpOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

import { FrischBestandModal } from "./FrischBestandModal.jsx";
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
            "Name";
    }

    if (
        initial.verfuegbarkeit
    ) {
        initial.verfuegbarkeit.value =
            true;
    }

    if (
        initial.herkunftsland
    ) {
        initial.herkunftsland.value =
            "DE";
    }

    if (initial.verband) {
        initial.verband.value =
            "DB";
    }

    if (
        initial.gebindegroesse
    ) {
        initial.gebindegroesse.value =
            0;
    }

    if (initial.preis) {
        initial.preis.value = 0;
    }

    if (
        initial.spezialfallBestelleinheit
    ) {
        initial.spezialfallBestelleinheit.value =
            false;
    }

    return initial;
}


const NUMBER_FIELDS = new Set([
    "preis",
    "gebindegroesse",
]);


export function NewFrischBestandModal(
    props
) {
    const {
        columns = [],
        einheiten = [],
        kategorien = [],
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
        setNewData({});
        props.close();
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
            "einheit.name"
        ) {
            targetAccessor =
                "einheit.id";
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
                    "einheit.name" ||
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
            !result.einheit?.id &&
            einheiten.length > 0
        ) {
            deepAssign(
                "einheit.id",
                result,
                einheiten[0].id
            );
        }


        if (
            !result.kategorie?.id &&
            kategorien.length > 0
        ) {
            result.kategorie = {
                id:
                    kategorien[0].id,
                name:
                    kategorien[0].name,
            };
        }


        props.create(result);

        close();
    };


    const specialCaseHelp = (
        <Tooltip
            arrow
            placement="right"
            title={
                <Box>
                    <Typography
                        variant="subtitle2"
                        fontWeight={700}
                        gutterBottom
                    >
                        Spezialfall
                        Bestelleinheit
                    </Typography>

                    <Typography
                        variant="body2"
                    >
                        Ein Produkt ist ein
                        Spezialfall, wenn die
                        Bestelleinheit „Stück“
                        ist, beim Einkauf aber
                        beispielsweise „kg“
                        verwendet wird. In diesem
                        Fall wird bei Einheit
                        „kg“ gewählt und der
                        Spezialfall aktiviert.
                        Ein typisches Beispiel
                        ist Blumenkohl.
                    </Typography>
                </Box>
            }
        >
            <IconButton
                size="small"
                aria-label="Informationen zum Spezialfall Bestelleinheit"
            >
                <HelpOutlinedIcon />
            </IconButton>
        </Tooltip>
    );


    const renderField = (
        accessor,
        {
            name,
            value,
        }
    ) => {
        if (
            accessor ===
            "verfuegbarkeit"
        ) {
            return (
                <FormControlLabel
                    key={accessor}
                    control={
                        <Checkbox
                            checked={Boolean(
                                value
                            )}
                            onChange={event =>
                                setValue(
                                    accessor,
                                    name,
                                    event
                                        .target
                                        .checked
                                )
                            }
                        />
                    }
                    label="Verfügbar"
                />
            );
        }


        if (
            accessor ===
            "spezialfallBestelleinheit"
        ) {
            return (
                <Stack
                    key={accessor}
                    direction="row"
                    alignItems="center"
                    spacing={0.5}
                >
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={Boolean(
                                    value
                                )}
                                onChange={event =>
                                    setValue(
                                        accessor,
                                        name,
                                        event
                                            .target
                                            .checked
                                    )
                                }
                            />
                        }
                        label="Spezialfall Bestelleinheit"
                    />

                    {specialCaseHelp}
                </Stack>
            );
        }


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
            "einheit.name"
        ) {
            const selectedId =
                newData[
                    "einheit.id"
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
                        "einheit.id"
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
                disabled={
                    einheiten.length ===
                        0 ||
                    kategorien.length ===
                        0
                }
                onClick={save}
            >
                Frischprodukt erstellen
            </Button>
        </>
    );


    return (
        <FrischBestandModal
            title="Frischprodukt erstellen"
            body={body}
            footer={footer}
            show={props.show}
            hide={close}
            parentProps={props}
        />
    );
}