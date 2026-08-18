import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    keycloak,
} from "./Keycloak";

import {
    hasAnyRole,
} from "./AuthorizedFunction";


const AuthContext =
    createContext(null);


// =============================================================================
// Keycloak nur einmal initialisieren
// =============================================================================
//
// React.StrictMode führt Effects im Development absichtlich mehrfach aus.
// Eine Keycloak-Instanz darf aber nur genau einmal mit init() initialisiert
// werden.
//
// Deshalb speichern wir die Promise außerhalb der React-Komponente.
//
// =============================================================================

let keycloakInitPromise = null;


const initializeKeycloak = () => {
    if (!keycloakInitPromise) {
        keycloakInitPromise =
            keycloak.init({
                onLoad:
                    "check-sso",

                checkLoginIframe:
                    false,

                pkceMethod:
                    "S256",

                enableLogging:
                    import.meta.env.DEV,
            });
    }


    return keycloakInitPromise;
};


/**
 * ============================================================================
 * Auth Provider
 * ============================================================================
 */

export const AuthProvider = ({
    children,
}) => {
    const [
        initialized,
        setInitialized,
    ] = useState(false);

    const [
        authenticated,
        setAuthenticated,
    ] = useState(false);


    // =========================================================================
    // Keycloak initialisieren
    // =========================================================================

    useEffect(() => {
        let active = true;


        const updateAuthState =
            value => {
                if (!active) {
                    return;
                }


                setAuthenticated(
                    Boolean(value)
                );
            };


        // =====================================================================
        // Events
        // =====================================================================

        keycloak.onAuthSuccess =
            () => {
                console.log(
                    "[Keycloak] authentication successful"
                );


                updateAuthState(
                    true
                );
            };


        keycloak.onAuthLogout =
            () => {
                console.log(
                    "[Keycloak] logout"
                );


                updateAuthState(
                    false
                );
            };


        keycloak.onAuthError =
            error => {
                console.error(
                    "[Keycloak] authentication error:",
                    error
                );


                updateAuthState(
                    false
                );
            };


        keycloak.onTokenExpired =
            async () => {
                console.log(
                    "[Keycloak] token expired"
                );


                try {
                    const refreshed =
                        await keycloak.updateToken(
                            30
                        );


                    if (refreshed) {
                        console.log(
                            "[Keycloak] token refreshed"
                        );
                    }


                    updateAuthState(
                        Boolean(
                            keycloak.authenticated
                        )
                    );
                } catch (error) {
                    console.error(
                        "[Keycloak] token refresh failed:",
                        error
                    );


                    updateAuthState(
                        false
                    );
                }
            };


        // =====================================================================
        // Init
        // =====================================================================

        const initKeycloak =
            async () => {
                try {
                    const isAuthenticated =
                        await initializeKeycloak();


                    console.log(
                        "[Keycloak] initialized, authenticated:",
                        isAuthenticated
                    );


                    updateAuthState(
                        isAuthenticated
                    );
                } catch (error) {
                    console.error(
                        "[Keycloak] initialization failed:",
                        error
                    );


                    updateAuthState(
                        false
                    );
                } finally {
                    if (active) {
                        setInitialized(
                            true
                        );
                    }
                }
            };


        initKeycloak();


        // =====================================================================
        // Cleanup
        // =====================================================================

        return () => {
            active = false;


            /*
             * Die Keycloak-Instanz selbst wird hier NICHT zurückgesetzt.
             *
             * Das ist wichtig, weil init() nur einmal pro Instanz erlaubt ist.
             *
             * Wir entfernen lediglich die Eventhandler des aktuellen
             * React-Lebenszyklus.
             */

            keycloak.onAuthSuccess =
                undefined;

            keycloak.onAuthLogout =
                undefined;

            keycloak.onAuthError =
                undefined;

            keycloak.onTokenExpired =
                undefined;
        };
    }, []);


    // =========================================================================
    // Login
    // =========================================================================

    const login =
        useCallback(() => {
            return keycloak.login({
                redirectUri:
                    window.location.href,
            });
        }, []);


    // =========================================================================
    // Logout
    // =========================================================================

    const logout =
        useCallback(() => {
            return keycloak.logout({
                redirectUri:
                    `${window.location.origin}/`,
            });
        }, []);


    // =========================================================================
    // Token aktualisieren
    // =========================================================================

    const refreshToken =
        useCallback(
            async (
                minValidity = 30
            ) => {
                if (
                    !keycloak.authenticated
                ) {
                    return false;
                }


                try {
                    const refreshed =
                        await keycloak.updateToken(
                            minValidity
                        );


                    setAuthenticated(
                        Boolean(
                            keycloak.authenticated
                        )
                    );


                    return refreshed;
                } catch (error) {
                    console.error(
                        "[Keycloak] token refresh failed:",
                        error
                    );


                    setAuthenticated(
                        false
                    );


                    return false;
                }
            },
            []
        );


    // =========================================================================
    // Rollen
    // =========================================================================

    const hasRole =
        useCallback(
            role => {
                if (
                    !authenticated ||
                    !role
                ) {
                    return false;
                }


                return hasAnyRole(
                    keycloak,
                    [role]
                );
            },
            [authenticated]
        );


    const hasRoles =
        useCallback(
            roles => {
                if (
                    !authenticated
                ) {
                    return false;
                }


                return hasAnyRole(
                    keycloak,
                    roles
                );
            },
            [authenticated]
        );


    // =========================================================================
    // User
    // =========================================================================

    const username =
        keycloak
            ?.tokenParsed
            ?.preferred_username ??
        "";

    const email =
        keycloak
            ?.tokenParsed
            ?.email ??
        "";


    // =========================================================================
    // Context
    // =========================================================================

    const value =
        useMemo(
            () => ({
                keycloak,

                initialized,
                authenticated,

                username,
                email,

                login,
                logout,

                refreshToken,

                hasRole,
                hasRoles,
            }),
            [
                initialized,
                authenticated,
                username,
                email,
                login,
                logout,
                refreshToken,
                hasRole,
                hasRoles,
            ]
        );


    // =========================================================================
    // Render
    // =========================================================================

    return (
        <AuthContext.Provider
            value={value}
        >
            {children}
        </AuthContext.Provider>
    );
};


/**
 * ============================================================================
 * useAuth
 * ============================================================================
 */

export const useAuth = () => {
    const context =
        useContext(
            AuthContext
        );


    if (!context) {
        throw new Error(
            "useAuth must be used inside an AuthProvider"
        );
    }


    return context;
};