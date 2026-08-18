import React from "react";

import {
    Box,
    Button,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";

import { LagerModal } from "./LagerModal.jsx";


export function EditEinheitenModal(
    props
) {
    const [name, setName] =
        React.useState("");


    React.useEffect(() => {
        if (!props.show) {
            setName("");
        }
    }, [props.show]);


    const close = () => {
        setName("");
        props.close();
    };


    const submit = () => {
        const trimmedName =
            name.trim();

        if (!trimmedName) {
            return;
        }

        props.create({
            name: trimmedName,
        });

        setName("");
    };


    const handleKeyDown = event => {
        if (
            event.key === "Enter"
        ) {
            event.preventDefault();
            submit();
        }
    };


    const body = (
        <Stack spacing={3}>
            <Box>
                <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    gutterBottom
                >
                    Neue Einheit
                </Typography>

                <Stack
                    direction={{
                        xs: "column",
                        sm: "row",
                    }}
                    spacing={2}
                >
                    <TextField
                        fullWidth
                        label="Einheit"
                        placeholder="z. B. kg, Stück, Kiste"
                        value={name}
                        onChange={event =>
                            setName(
                                event.target
                                    .value
                            )
                        }
                        onKeyDown={
                            handleKeyDown
                        }
                    />

                    <Button
                        variant="contained"
                        startIcon={
                            <AddIcon />
                        }
                        disabled={
                            !name.trim()
                        }
                        onClick={submit}
                        sx={{
                            flexShrink: 0,
                        }}
                    >
                        Hinzufügen
                    </Button>
                </Stack>
            </Box>

            <Divider />

            <Box>
                <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    gutterBottom
                >
                    Bestehende Einheiten
                </Typography>

                <List
                    disablePadding
                    sx={{
                        border: 1,
                        borderColor:
                            "divider",
                        borderRadius: 2,
                        overflow: "hidden",
                    }}
                >
                    {props.einheiten.map(
                        (
                            einheit,
                            index
                        ) => (
                            <React.Fragment
                                key={
                                    einheit.id
                                }
                            >
                                {index > 0 && (
                                    <Divider />
                                )}

                                <ListItem
                                    secondaryAction={
                                        <Tooltip title="Einheit löschen">
                                            <IconButton
                                                edge="end"
                                                color="error"
                                                aria-label={`${einheit.name} löschen`}
                                                onClick={() =>
                                                    props.remove(
                                                        {
                                                            id:
                                                                einheit.id,
                                                            name:
                                                                einheit.name,
                                                        }
                                                    )
                                                }
                                            >
                                                <DeleteOutlinedIcon />
                                            </IconButton>
                                        </Tooltip>
                                    }
                                >
                                    <ListItemText
                                        primary={
                                            einheit.name
                                        }
                                    />
                                </ListItem>
                            </React.Fragment>
                        )
                    )}

                    {props.einheiten
                        .length === 0 && (
                        <ListItem>
                            <ListItemText
                                primary="Keine Einheiten vorhanden"
                                secondary="Lege oben die erste Einheit an."
                            />
                        </ListItem>
                    )}
                </List>
            </Box>
        </Stack>
    );


    const footer = (
        <Button
            variant="outlined"
            startIcon={<CloseIcon />}
            onClick={close}
        >
            Schließen
        </Button>
    );


    return (
        <LagerModal
            title="Einheiten bearbeiten"
            body={body}
            footer={footer}
            show={props.show}
            hide={close}
            parentProps={props}
        />
    );
}