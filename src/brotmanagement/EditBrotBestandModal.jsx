import React from "react";

import {
    Button,
    Checkbox,
    FormControlLabel,
    Stack,
    TextField,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

import { BrotBestandModal } from "./BrotBestandModal.jsx";


export function EditBrotBestandModal(props) {
    const produkt =
        props.produkt ?? null;

    const [name, setName] =
        React.useState("");

    const [gewicht, setGewicht] =
        React.useState(0);

    const [preis, setPreis] =
        React.useState(0);

    const [
        verfuegbarkeit,
        setVerfuegbarkeit,
    ] = React.useState(true);


    React.useEffect(() => {
        if (
            props.show &&
            produkt
        ) {
            setName(
                produkt.name ?? ""
            );

            setGewicht(
                produkt.gewicht ?? 0
            );

            setPreis(
                produkt.preis ?? 0
            );

            setVerfuegbarkeit(
                Boolean(
                    produkt.verfuegbarkeit
                )
            );
        }
    }, [
        props.show,
        produkt,
    ]);


    const close = () => {
        props.close();
    };


    const save = () => {
        if (!produkt) {
            return;
        }

        props.persist(
            produkt,
            {
                name: {
                    name: "Produkt",
                    value:
                        name.trim(),
                },

                gewicht: {
                    name:
                        "Gewicht in g",
                    value:
                        Number(
                            gewicht
                        ) || 0,
                },

                preis: {
                    name:
                        "Preis in €",
                    value:
                        Number(preis) ||
                        0,
                },

                verfuegbarkeit: {
                    name:
                        "Verfügbarkeit",
                    value:
                        verfuegbarkeit,
                },
            }
        );

        close();
    };


    const remove = () => {
        if (!produkt) {
            return;
        }

        props.deleteBrotBestand(
            produkt
        );

        close();
    };


    const body = (
        <Stack spacing={2.5}>
            <TextField
                fullWidth
                label="Produktname"
                value={name}
                onChange={event =>
                    setName(
                        event.target.value
                    )
                }
            />

            <TextField
                fullWidth
                label="Gewicht in g"
                type="number"
                value={gewicht}
                onChange={event =>
                    setGewicht(
                        event.target.value
                    )
                }
                slotProps={{
                    htmlInput: {
                        min: 0,
                        step: 1,
                    },
                }}
            />

            <TextField
                fullWidth
                label="Preis in €"
                type="number"
                value={preis}
                onChange={event =>
                    setPreis(
                        event.target.value
                    )
                }
                slotProps={{
                    htmlInput: {
                        min: 0,
                        step: 0.01,
                    },
                }}
            />

            <FormControlLabel
                control={
                    <Checkbox
                        checked={
                            verfuegbarkeit
                        }
                        onChange={event =>
                            setVerfuegbarkeit(
                                event.target
                                    .checked
                            )
                        }
                    />
                }
                label="Produkt verfügbar"
            />
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
                disabled={!name.trim()}
            >
                Änderungen speichern
            </Button>
        </>
    );


    return (
        <BrotBestandModal
            title="Brotprodukt bearbeiten"
            body={body}
            footer={footer}
            show={props.show}
            hide={close}
            parentProps={props}
        />
    );
}