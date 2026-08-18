import React from "react";

import {
    Box,
    Button,
    Checkbox,
    Divider,
    FormControlLabel,
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
import HelpOutlinedIcon from "@mui/icons-material/HelpOutlined";

import { LagerModal } from "./LagerModal.jsx";


export function EditKategorieModal(
    props
) {
    const [name, setName] =
        React.useState("");

    const [mixable, setMixable] =
        React.useState(false);


    React.useEffect(() => {
        if (!props.show) {
            setName("");
            setMixable(false);
        }
    }, [props.show]);


    const close = () => {
        setName("");
        setMixable(false);

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
            mixable,
        });

        setName("");
        setMixable(false);
    };


    const handleKeyDown = event => {
        if (
            event.key === "Enter"
        ) {
            event.preventDefault();

            submit();
        }
    };


    const title = (
        <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
        >
            <span>
                Kategorien bearbeiten
            </span>

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
                            Mischbare Kategorien
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{
                                mb: 1,
                            }}
                        >
                            Wenn eine Kategorie
                            als „mischbar“
                            markiert ist, können
                            Produkte dieser
                            Kategorie zu einem
                            gemeinsamen Gebinde
                            kombiniert werden.
                        </Typography>

                        <Typography
                            variant="body2"
                        >
                            Beispiel: Werden 4
                            Feldsalate und 8
                            Eichblattsalate bei
                            einer Gebindegröße von
                            12 bestellt, kann daraus
                            ein vollständiges
                            gemischtes Gebinde
                            entstehen.
                        </Typography>
                    </Box>
                }
            >
                <IconButton
                    size="small"
                    aria-label="Informationen zu mischbaren Kategorien"
                >
                    <HelpOutlinedIcon />
                </IconButton>
            </Tooltip>
        </Stack>
    );


    const body = (
        <Stack spacing={3}>
            <Box>
                <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    gutterBottom
                >
                    Neue Kategorie
                </Typography>

                <Stack
                    direction={{
                        xs: "column",
                        sm: "row",
                    }}
                    spacing={2}
                    alignItems={{
                        xs: "stretch",
                        sm: "center",
                    }}
                >
                    <TextField
                        fullWidth
                        label="Name"
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

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={
                                    mixable
                                }
                                onChange={
                                    event =>
                                        setMixable(
                                            event
                                                .target
                                                .checked
                                        )
                                }
                            />
                        }
                        label="Mischbar"
                    />

                    <Button
                        variant="contained"
                        startIcon={
                            <AddIcon />
                        }
                        onClick={submit}
                        disabled={
                            !name.trim()
                        }
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
                    Bestehende Kategorien
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
                    {props.kategorien.map(
                        (
                            kategorie,
                            index
                        ) => (
                            <React.Fragment
                                key={
                                    kategorie.id
                                }
                            >
                                {index > 0 && (
                                    <Divider />
                                )}

                                <ListItem
                                    sx={{
                                        py: 1,
                                    }}
                                    secondaryAction={
                                        <Tooltip title="Kategorie löschen">
                                            <IconButton
                                                edge="end"
                                                color="error"
                                                aria-label={`${kategorie.name} löschen`}
                                                onClick={() =>
                                                    props.remove(
                                                        {
                                                            id:
                                                                kategorie.id,
                                                            name:
                                                                kategorie.name,
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
                                            kategorie.name
                                        }
                                    />

                                    <FormControlLabel
                                        sx={{
                                            mr: 5,
                                        }}
                                        control={
                                            <Checkbox
                                                checked={Boolean(
                                                    kategorie.mixable
                                                )}
                                                disabled
                                            />
                                        }
                                        label="Mischbar"
                                    />
                                </ListItem>
                            </React.Fragment>
                        )
                    )}

                    {props.kategorien
                        .length === 0 && (
                        <ListItem>
                            <ListItemText
                                primary="Keine Kategorien vorhanden"
                                secondary="Lege oben die erste Kategorie an."
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
            title={title}
            body={body}
            footer={footer}
            show={props.show}
            hide={close}
            parentProps={props}
        />
    );
}