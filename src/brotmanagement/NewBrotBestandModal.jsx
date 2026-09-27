import React from "react";

import {
    Button,
    Checkbox,
    FormControlLabel,
    Stack,
    TextField,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

import { BrotBestandModal } from "./BrotBestandModal.jsx";
import {
    PlatzFeld,
    platzAusEingabe,
} from "../components/reihenfolge/PlatzFeld.jsx";


export function NewBrotBestandModal(props) {
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

    // Platz in der Liste (1 = oben); leer = ans Ende
    const [platz, setPlatz] =
        React.useState("");


    React.useEffect(() => {
        if (props.show) {
            setName("");
            setGewicht(0);
            setPreis(0);
            setVerfuegbarkeit(true);
            setPlatz("");
        }
    }, [props.show]);


    const close = () => {
        setName("");
        setGewicht(0);
        setPreis(0);
        setVerfuegbarkeit(true);

        props.close();
    };


    const save = () => {
        const trimmedName =
            name.trim();

        if (!trimmedName) {
            return;
        }

        props.create({
            name: trimmedName,
            gewicht:
                Number(gewicht) || 0,
            preis:
                Number(preis) || 0,
            verfuegbarkeit,
            sortierung:
                platzAusEingabe(platz),
        });

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
                autoFocus
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

            <PlatzFeld
                value={platz}
                onChange={setPlatz}
                anzahl={props.anzahl ?? 0}
            />
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
                disabled={!name.trim()}
            >
                Brotprodukt erstellen
            </Button>
        </>
    );


    return (
        <BrotBestandModal
            title="Brotprodukt erstellen"
            body={body}
            footer={footer}
            show={props.show}
            hide={close}
            parentProps={props}
        />
    );
}