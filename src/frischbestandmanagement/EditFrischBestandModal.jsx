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
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import HelpOutlinedIcon from "@mui/icons-material/HelpOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

import { FrischBestandModal } from "./FrischBestandModal.jsx";


const FIELD_DEFINITIONS = [
    {
        accessor: "name",
        name: "Produkt",
    },
    {
        accessor: "verfuegbarkeit",
        name: "Verfügbarkeit",
        type: "boolean",
    },
    {
        accessor: "herkunftsland",
        name: "Land",
    },
    {
        accessor: "verband",
        name: "Verband",
    },
    {
        accessor: "gebindegroesse",
        name: "Gebindegröße",
        type: "number",
    },
    {
        accessor: "kategorie.name",
        name: "Kategorie",
        type: "kategorie",
    },
    {
        accessor: "einheit.name",
        name: "Einheit",
        type: "einheit",
    },
    {
        accessor:
            "spezialfallBestelleinheit",
        name:
            "Spezialfall Bestelleinheit",
        type: "specialBoolean",
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


export function EditFrischBestandModal(
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
    }, [
        props.show,
        produkt?.id,
    ]);


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


    const getCurrentValue =
        accessor => {
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

        props.deleteFrischBestand(
            produkt
        );

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
                        verwendet wird. In
                        diesem Fall wird als
                        Einheit „kg“ gewählt
                        und dieser Spezialfall
                        aktiviert.
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


    const renderField = ({
        accessor,
        name,
        type,
    }) => {
        if (
            type === "einheit"
        ) {
            const currentId =
                newData[
                    "einheit.id"
                ]?.value ??
                produkt?.einheit?.id ??
                "";

            return (
                <TextField
                    key={accessor}
                    select
                    fullWidth
                    label={name}
                    value={currentId}
                    onChange={event =>
                        setChangedValue(
                            "einheit.id",
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
            const currentId =
                newData[
                    "kategorie.id"
                ]?.value ??
                produkt?.kategorie
                    ?.id ??
                "";

            return (
                <TextField
                    key={accessor}
                    select
                    fullWidth
                    label={name}
                    value={currentId}
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


        if (type === "boolean") {
            return (
                <FormControlLabel
                    key={accessor}
                    control={
                        <Checkbox
                            checked={Boolean(
                                getCurrentValue(
                                    accessor
                                )
                            )}
                            onChange={event =>
                                setChangedValue(
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
            type ===
            "specialBoolean"
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
                                    getCurrentValue(
                                        accessor
                                    )
                                )}
                                onChange={event =>
                                    setChangedValue(
                                        accessor,
                                        name,
                                        event
                                            .target
                                            .checked
                                    )
                                }
                            />
                        }
                        label={name}
                    />

                    {specialCaseHelp}
                </Stack>
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
                disabled={
                    Object.keys(
                        newData
                    ).length === 0
                }
                onClick={save}
            >
                Änderungen speichern
            </Button>
        </>
    );


    return (
        <FrischBestandModal
            title="Frischprodukt bearbeiten"
            body={body}
            footer={footer}
            show={props.show}
            hide={close}
            parentProps={props}
        />
    );
}