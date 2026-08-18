import React, {
    useEffect,
} from "react";

import {
    Navigate,
    useLocation,
} from "react-router";

import {
    Box,
    CircularProgress,
    Stack,
    Typography,
} from "@mui/material";

import { toast } from "react-toastify";

import { useAuth } from "./AuthContext.jsx";
import {
    hasAnyRole,
} from "./AuthorizedFunction";


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
                alignItems="center"
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


function UnauthorizedRedirect({
    roles,
    authenticated,
}) {
    const location =
        useLocation();


    const roleText =
        roles &&
        roles.length > 0
            ? roles.join(" oder ")
            : null;


    useEffect(() => {
        if (!authenticated) {
            toast.warning(
                "Bitte melde dich an, um diesen Bereich zu öffnen.",
                {
                    toastId:
                        "authentication-required",
                }
            );

            return;
        }


        if (roleText) {
            toast.warning(
                `Keine Berechtigung. Benötigte Rolle: ${roleText}`,
                {
                    toastId:
                        `missing-role-${roleText}`,
                }
            );

            return;
        }


        toast.warning(
            "Du hast keine Berechtigung für diesen Bereich.",
            {
                toastId:
                    "missing-permission",
            }
        );
    }, [
        authenticated,
        roleText,
    ]);


    return (
        <Navigate
            to="/home"
            replace
            state={{
                from:
                    location.pathname,
            }}
        />
    );
}


/**
 * Schützt einen Bereich anhand der
 * Keycloak-Authentifizierung und optionaler Rollen.
 *
 * Verwendung:
 *
 * <Route
 *     path="/mainAdmin/*"
 *     element={
 *         <PrivateRoute
 *             roles={["Einkäufer"]}
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
            <UnauthorizedRedirect
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
            <UnauthorizedRedirect
                roles={roles}
                authenticated
            />
        );
    }


    return children;
}