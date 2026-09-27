import React from "react";

import {
    Box,
    CircularProgress,
    Paper,
    Stack,
    Typography,
} from "@mui/material";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import { useAuth } from "./AuthContext.jsx";
import {
    hasAnyRole,
} from "./AuthorizedFunction";

import {
    AuthButton,
} from "./AuthButton.jsx";

import {
    benoetigteRollen,
} from "./rechte.js";


function LoadingScreen() {
    return (
        <Box
            sx={{
                minHeight: 240,

                display: "flex",
                alignItems: "center",
                justifyContent:
                    "center",
            }}
        >
            <Stack
                spacing={2}
                sx={{ alignItems: "center" }}
            >
                <CircularProgress />

                <Typography
                    color="text.secondary"
                >
                    Berechtigung wird
                    geprüft …
                </Typography>
            </Stack>
        </Box>
    );
}


/**
 * Hinweis statt Inhalt: nicht angemeldet (mit Anmelde-Button) oder die
 * nötige Rolle fehlt.
 */
function KeinZugriff({
    roles,
    authenticated,
}) {
    const rollen =
        benoetigteRollen(roles);

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                py: {
                    xs: 4,
                    sm: 8,
                },
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    maxWidth: 440,
                    width: "100%",
                    p: {
                        xs: 3,
                        sm: 4,
                    },
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 3,
                    textAlign: "center",
                }}
            >
                <Stack
                    spacing={2}
                    sx={{
                        alignItems: "center",
                    }}
                >
                    <Box
                        sx={{
                            width: 52,
                            height: 52,
                            borderRadius: "50%",
                            display: "grid",
                            placeItems: "center",
                            bgcolor: "action.hover",
                            color: "text.secondary",
                        }}
                    >
                        <LockOutlinedIcon />
                    </Box>

                    {authenticated ? (
                        <>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 700,
                                }}
                            >
                                Kein Zugriff
                            </Typography>

                            <Typography color="text.secondary">
                                {rollen.length > 0
                                    ? `Dafür brauchst du die Rolle ${rollen.map(rolle => `„${rolle}“`).join(" oder ")}.`
                                    : "Du hast keine Berechtigung für diesen Bereich."}
                                {" "}
                                Ein Admin kann sie dir unter Verwaltung → Benutzer geben.
                            </Typography>
                        </>
                    ) : (
                        <>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 700,
                                }}
                            >
                                Bitte melde dich an
                            </Typography>

                            <Typography color="text.secondary">
                                Dieser Bereich ist nur für angemeldete Mitglieder.
                            </Typography>

                            <AuthButton
                                showUsername={
                                    false
                                }
                            />
                        </>
                    )}
                </Stack>
            </Paper>
        </Box>
    );
}


/**
 * Schützt einen Bereich anhand der
 * Keycloak-Authentifizierung und optionaler Rollen.
 *
 * Verwendung:
 *
 * <Route
 *     path="/konfiguration/*"
 *     element={
 *         <PrivateRoute
 *             roles={RECHTE.konfiguration}
 *         >
 *             <MainAdmin />
 *         </PrivateRoute>
 *     }
 * />
 */
export function PrivateRoute({
    children,
    roles = [],
}) {
    const {
        keycloak,
        initialized,
        authenticated,
    } = useAuth();


    if (!initialized) {
        return (
            <LoadingScreen />
        );
    }


    if (!authenticated) {
        return (
            <KeinZugriff
                roles={roles}
                authenticated={false}
            />
        );
    }


    const authorized =
        hasAnyRole(
            keycloak,
            roles
        );


    if (!authorized) {
        return (
            <KeinZugriff
                roles={roles}
                authenticated
            />
        );
    }


    return children;
}
