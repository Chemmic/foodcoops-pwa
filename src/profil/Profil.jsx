import React, {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    Alert,
    Avatar,
    Box,
    Button,
    CircularProgress,
    Paper,
    Stack,
    Typography,
} from "@mui/material";

import { useAuth } from "../auth/AuthContext.jsx";

import { getMeineHistorie } from "../historie/historieApi.js";
import { HistorieAnsicht } from "../historie/HistorieAnsicht.jsx";


/**
 * ============================================================================
 * Mein Profil
 * ============================================================================
 *
 * Eigene Bestellrunden mit Einkäufen, Abweichungen, Rechnungen als PDF
 * und Statistiken. Die Daten kommen aus /me/historie – das Backend nimmt
 * die Person aus dem Token.
 */
export function Profil() {
    const {
        keycloak,
        username,
        email,
    } = useAuth();

    const token =
        keycloak?.tokenParsed ?? {};

    const name =
        token.name ||
        [
            token.given_name,
            token.family_name,
        ]
            .filter(Boolean)
            .join(" ");


    const [
        historie,
        setHistorie,
    ] = useState(null);

    const [
        error,
        setError,
    ] = useState(null);


    const laden =
        useCallback(
            async () => {
                setError(null);

                try {
                    setHistorie(
                        await getMeineHistorie()
                    );
                } catch (loadError) {
                    setError(
                        loadError.message
                    );
                }
            },
            []
        );


    useEffect(() => {
        laden();
    }, [laden]);


    return (
        <Stack spacing={3}>
            <Paper
                elevation={0}
                sx={{
                    p: {
                        xs: 2,
                        sm: 3,
                    },
                    border: 1,
                    borderColor: "divider",
                }}
            >
                <Stack
                    direction="row"
                    spacing={2}
                    sx={{ alignItems: "center" }}
                >
                    <Avatar
                        sx={{
                            width: 56,
                            height: 56,
                            bgcolor: "primary.main",
                            fontSize: 24,
                        }}
                    >
                        {(name || username || "?")
                            .charAt(0)
                            .toUpperCase()}
                    </Avatar>

                    <Box
                        sx={{
                            minWidth: 0,
                        }}
                    >
                        <Typography
                            variant="h5"
                            sx={{ fontWeight: 700 }}
                            noWrap
                        >
                            {name || username}
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            noWrap
                        >
                            {[
                                name ? username : null,
                                email,
                            ]
                                .filter(Boolean)
                                .join(" · ")}
                        </Typography>
                    </Box>
                </Stack>
            </Paper>


            {error && (
                <Alert
                    severity="error"
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            onClick={laden}
                        >
                            Erneut versuchen
                        </Button>
                    }
                >
                    {error}
                </Alert>
            )}


            {!historie && !error && (
                <Box
                    sx={{
                        py: 8,
                        display: "flex",
                        justifyContent: "center",
                    }}
                >
                    <CircularProgress />
                </Box>
            )}


            {historie && (
                <HistorieAnsicht
                    historie={historie}
                    personId={username}
                    personName={name}
                    eigene
                />
            )}
        </Stack>
    );
}
