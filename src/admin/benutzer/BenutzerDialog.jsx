import React, {
    useEffect,
    useState,
} from "react";

import {
    Alert,
    Box,
    Button,
    Checkbox,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    FormGroup,
    Radio,
    RadioGroup,
    Stack,
    Switch,
    TextField,
    Typography,
    useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import { PasswortFeld } from "./PasswortFeld.jsx";
import { EINKAEUFER_ROLE } from "../../auth/roles.js";
import {
    OhneRolleHilfe,
    RollenHilfe,
} from "./RollenHilfe.jsx";

import {
    generatePassword,
} from "./passwort.js";


const EMPTY_FORM = {
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    enabled: true,
    roles: [],

    zugang: "email",
    password: "",
    temporaryPassword: true,
};


const formatDate = timestamp =>
    timestamp
        ? new Date(
            timestamp
        ).toLocaleDateString(
            "de-DE",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            }
        )
        : null;


/**
 * Benutzer anlegen (user === null) oder bearbeiten.
 *
 * onSubmit(data) muss eine Promise liefern. Bei Fehlern bleibt der
 * Dialog offen und zeigt die Meldung an.
 */
export function BenutzerDialog({
    open,
    user,
    roles,
    isSelf,
    adminRole,
    onSubmit,
    onClose,
}) {
    const theme =
        useTheme();

    const fullScreen =
        useMediaQuery(
            theme.breakpoints.down("sm")
        );

    const editing =
        Boolean(user);

    const [
        form,
        setForm,
    ] = useState(EMPTY_FORM);

    const [
        saving,
        setSaving,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState(null);


    useEffect(() => {
        if (!open) {
            return;
        }

        setError(null);
        setSaving(false);

        setForm(
            user
                ? {
                    ...EMPTY_FORM,
                    username:
                        user.username ?? "",
                    email:
                        user.email ?? "",
                    firstName:
                        user.firstName ?? "",
                    lastName:
                        user.lastName ?? "",
                    enabled:
                        user.enabled,
                    roles:
                        user.roles ?? [],
                }
                : {
                    ...EMPTY_FORM,
                    password:
                        generatePassword(),
                    // Neue Mitglieder dürfen standardmäßig bestellen und einkaufen
                    roles:
                        roles.some(role => role.name === EINKAEUFER_ROLE)
                            ? [EINKAEUFER_ROLE]
                            : [],
                }
        );
    }, [
        open,
        user,
    ]);


    const change =
        field =>
            value =>
                setForm(
                    current => ({
                        ...current,
                        [field]: value,
                    })
                );


    const toggleRole =
        roleName =>
            setForm(
                current => ({
                    ...current,
                    roles:
                        current.roles.includes(
                            roleName
                        )
                            ? current.roles.filter(
                                role =>
                                    role !== roleName
                            )
                            : [
                                ...current.roles,
                                roleName,
                            ],
                })
            );


    const usernameMissing =
        !editing &&
        !form.username.trim();

    const passwordMissing =
        !editing &&
        form.zugang === "passwort" &&
        !form.password;

    // Neue Benutzer brauchen immer eine E-Mail-Adresse
    const emailMissing =
        !editing &&
        !form.email.trim();


    const submit = async () => {
        if (
            usernameMissing ||
            passwordMissing ||
            emailMissing
        ) {
            return;
        }

        setSaving(true);
        setError(null);

        try {
            await onSubmit(
                form
            );
        } catch (submitError) {
            setError(
                submitError.message
            );

            setSaving(false);
        }
    };


    return (
        <Dialog
            open={open}
            onClose={
                saving
                    ? undefined
                    : onClose
            }
            fullScreen={fullScreen}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>
                {editing
                    ? `Benutzer „${user.username}“ bearbeiten`
                    : "Neuen Benutzer anlegen"}
            </DialogTitle>

            <DialogContent
                dividers
            >
                <Stack spacing={3}>
                    {error && (
                        <Alert severity="error">
                            {error}
                        </Alert>
                    )}


                    {/* ===================================================== */}
                    {/* Stammdaten                                            */}
                    {/* ===================================================== */}

                    <Stack spacing={2}>
                        <TextField
                            fullWidth
                            required={!editing}
                            label="Benutzername"
                            value={form.username}
                            disabled={editing}
                            autoFocus={!editing}
                            onChange={event =>
                                change("username")(
                                    event.target.value
                                )
                            }
                            helperText={
                                editing
                                    ? "Der Benutzername kann nicht geändert werden."
                                    : "Wird zum Anmelden verwendet."
                            }
                        />

                        <TextField
                            fullWidth
                            type="email"
                            label="E-Mail-Adresse"
                            value={form.email}
                            required={!editing}
                            onChange={event =>
                                change("email")(
                                    event.target.value
                                )
                            }
                        />

                        <Stack
                            direction={{
                                xs: "column",
                                sm: "row",
                            }}
                            spacing={2}
                        >
                            <TextField
                                fullWidth
                                label="Vorname"
                                value={form.firstName}
                                onChange={event =>
                                    change("firstName")(
                                        event.target.value
                                    )
                                }
                            />

                            <TextField
                                fullWidth
                                label="Nachname"
                                value={form.lastName}
                                onChange={event =>
                                    change("lastName")(
                                        event.target.value
                                    )
                                }
                            />
                        </Stack>

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={form.enabled}
                                    disabled={isSelf}
                                    onChange={event =>
                                        change("enabled")(
                                            event.target.checked
                                        )
                                    }
                                />
                            }
                            label={
                                form.enabled
                                    ? "Konto aktiv – Anmeldung möglich"
                                    : "Konto deaktiviert – Anmeldung gesperrt"
                            }
                        />

                        {editing && user.createdTimestamp && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Angelegt am{" "}
                                {formatDate(
                                    user.createdTimestamp
                                )}
                            </Typography>
                        )}
                    </Stack>


                    <Divider />


                    {/* ===================================================== */}
                    {/* Rollen                                                */}
                    {/* ===================================================== */}

                    <Box>
                        <Stack
                            direction="row"
                            spacing={0.5}
                            sx={{
                                alignItems: "center",
                                mb: 0.5,
                            }}
                        >
                            <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 700 }}
                            >
                                Rollen
                            </Typography>

                            <OhneRolleHilfe />
                        </Stack>

                        {roles.length === 0 ? (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                In Keycloak sind noch keine Rollen angelegt.
                            </Typography>
                        ) : (
                            <FormGroup>
                                {roles.map(role => {
                                    const lockedAdmin =
                                        isSelf &&
                                        role.name === adminRole;

                                    return (
                                        <FormControlLabel
                                            key={role.name}
                                            control={
                                                <Checkbox
                                                    // Eigene Admin-Rolle: hat man sicher (sonst wäre man nicht hier) und sie bleibt
                                                    checked={
                                                        lockedAdmin ||
                                                        form.roles.includes(
                                                            role.name
                                                        )
                                                    }
                                                    disabled={lockedAdmin}
                                                    onChange={() =>
                                                        toggleRole(
                                                            role.name
                                                        )
                                                    }
                                                />
                                            }
                                            label={
                                                <Stack
                                                    direction="row"
                                                    spacing={1}
                                                    sx={{ alignItems: "center", flexWrap: "wrap" }}
                                                >
                                                    <span>
                                                        {role.name}
                                                    </span>

                                                    <RollenHilfe
                                                        name={role.name}
                                                        beschreibung={role.description}
                                                    />

                                                    {role.description && (
                                                        <Typography
                                                            component="span"
                                                            variant="body2"
                                                            color="text.secondary"
                                                        >
                                                            {role.description}
                                                        </Typography>
                                                    )}

                                                    {lockedAdmin && (
                                                        <Chip
                                                            size="small"
                                                            label="eigene Admin-Rolle"
                                                        />
                                                    )}
                                                </Stack>
                                            }
                                        />
                                    );
                                })}
                            </FormGroup>
                        )}
                    </Box>


                    {/* ===================================================== */}
                    {/* Zugang (nur beim Anlegen)                             */}
                    {/* ===================================================== */}

                    {!editing && (
                        <>
                            <Divider />

                            <Box>
                                <Typography
                                    variant="subtitle1"
                                    sx={{ fontWeight: 700 }}
                                    gutterBottom
                                >
                                    Zugang
                                </Typography>

                                <RadioGroup
                                    value={form.zugang}
                                    onChange={event =>
                                        change("zugang")(
                                            event.target.value
                                        )
                                    }
                                >
                                    <FormControlLabel
                                        value="email"
                                        control={<Radio />}
                                        label="Einladungs-E-Mail schicken – die Person legt ihr Passwort selbst fest"
                                    />

                                    <FormControlLabel
                                        value="passwort"
                                        control={<Radio />}
                                        label="Startpasswort festlegen und selbst weitergeben"
                                    />
                                </RadioGroup>

                                {form.zugang === "passwort" ? (
                                    <Stack
                                        spacing={1}
                                        sx={{
                                            mt: 2,
                                        }}
                                    >
                                        <PasswortFeld
                                            label="Startpasswort"
                                            value={form.password}
                                            onChange={change(
                                                "password"
                                            )}
                                        />

                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={form.temporaryPassword}
                                                    onChange={event =>
                                                        change("temporaryPassword")(
                                                            event.target.checked
                                                        )
                                                    }
                                                />
                                            }
                                            label="Muss beim ersten Anmelden geändert werden"
                                        />
                                    </Stack>
                                ) : (
                                    <Alert
                                        severity="info"
                                        sx={{
                                            mt: 2,
                                        }}
                                    >
                                        Keycloak verschickt eine E-Mail mit
                                        einem Link zum Festlegen des
                                        Passworts.
                                    </Alert>
                                )}
                            </Box>
                        </>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button
                    onClick={onClose}
                    disabled={saving}
                >
                    Abbrechen
                </Button>

                <Button
                    variant="contained"
                    onClick={submit}
                    disabled={
                        saving ||
                        usernameMissing ||
                        passwordMissing ||
                        emailMissing
                    }
                    startIcon={
                        saving
                            ? (
                                <CircularProgress
                                    size={16}
                                    color="inherit"
                                />
                            )
                            : null
                    }
                >
                    {editing
                        ? "Speichern"
                        : "Anlegen"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
