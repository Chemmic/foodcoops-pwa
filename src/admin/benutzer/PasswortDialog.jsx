import React, {
    useEffect,
    useState,
} from "react";

import {
    Alert,
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Radio,
    RadioGroup,
    Stack,
    Typography,
} from "@mui/material";

import { PasswortFeld } from "./PasswortFeld.jsx";

import {
    generatePassword,
} from "./passwort.js";


/**
 * Passwort zurücksetzen:
 *
 *   - neues (vorläufiges) Passwort direkt setzen, oder
 *   - Keycloak eine E-Mail mit Link zum Zurücksetzen schicken lassen.
 *
 * onSetPassword(password, temporary) / onSendEmail() liefern Promises.
 */
export function PasswortDialog({
    open,
    user,
    onSetPassword,
    onSendEmail,
    onClose,
}) {
    const [
        mode,
        setMode,
    ] = useState("passwort");

    const [
        password,
        setPassword,
    ] = useState("");

    const [
        temporary,
        setTemporary,
    ] = useState(true);

    const [
        saving,
        setSaving,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState(null);


    const hasEmail =
        Boolean(user?.email);


    useEffect(() => {
        if (!open) {
            return;
        }

        setMode("passwort");
        setPassword(generatePassword());
        setTemporary(true);
        setSaving(false);
        setError(null);
    }, [open]);


    const submit = async () => {
        setSaving(true);
        setError(null);

        try {
            if (mode === "email") {
                await onSendEmail();
            } else {
                await onSetPassword(
                    password,
                    temporary
                );
            }
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
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>
                Passwort zurücksetzen
                {user
                    ? ` – ${user.username}`
                    : ""}
            </DialogTitle>

            <DialogContent
                dividers
            >
                <Stack spacing={2}>
                    {error && (
                        <Alert severity="error">
                            {error}
                        </Alert>
                    )}

                    <RadioGroup
                        value={mode}
                        onChange={event =>
                            setMode(
                                event.target.value
                            )
                        }
                    >
                        <FormControlLabel
                            value="passwort"
                            control={<Radio />}
                            label="Neues Passwort festlegen"
                        />

                        <FormControlLabel
                            value="email"
                            control={<Radio />}
                            disabled={!hasEmail}
                            label={
                                hasEmail
                                    ? `Link zum Zurücksetzen an ${user.email} senden`
                                    : "Link per E-Mail senden (keine E-Mail-Adresse hinterlegt)"
                            }
                        />
                    </RadioGroup>

                    {mode === "passwort" ? (
                        <>
                            <PasswortFeld
                                value={password}
                                onChange={setPassword}
                                label="Neues Passwort"
                                helperText="Gib das Passwort sicher an die Person weiter."
                            />

                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={temporary}
                                        onChange={event =>
                                            setTemporary(
                                                event.target.checked
                                            )
                                        }
                                    />
                                }
                                label="Muss beim nächsten Anmelden geändert werden"
                            />
                        </>
                    ) : (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Keycloak verschickt eine E-Mail mit einem Link,
                            über den die Person selbst ein neues Passwort
                            festlegt. Dafür muss im Keycloak-Realm ein
                            E-Mail-Server eingerichtet sein.
                        </Typography>
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
                        (mode === "passwort" && !password)
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
                    {mode === "email"
                        ? "E-Mail senden"
                        : "Passwort setzen"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
