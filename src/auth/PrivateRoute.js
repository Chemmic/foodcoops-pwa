import React, { useEffect } from "react";
import { Redirect, Route } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";

export function PrivateRoute({ component: Component, roles, ...rest }) {

    const { keycloak, initialized, authenticated } = useAuth();

    const isAuthorized = () => {

        if (!authenticated || !keycloak) {
            return false;
        }

        // Wenn keine Rollen für die Route definiert sind,
        // reicht ein angemeldeter Benutzer.
        if (!roles || roles.length === 0) {
            return true;
        }

        return roles.some(role => {
            const realmRole = keycloak.hasRealmRole(role);
            const resourceRole = keycloak.hasResourceRole(role);

            return realmRole || resourceRole;
        });
    };

    const authorized = initialized && isAuthorized();


    useEffect(() => {

        // Noch nicht initialisiert -> keinen Toast anzeigen
        if (!initialized) {
            return;
        }

        // Nicht eingeloggt -> hier keinen Rollen-Toast anzeigen
        if (!authenticated) {
            return;
        }

        // Keine Rollen erforderlich
        if (!roles || roles.length === 0) {
            return;
        }

        // Benutzer hat die benötigte Rolle
        if (authorized) {
            return;
        }

        const roleText = roles.join(" oder ");

        toast.warning(
            `Keine Berechtigung. Benötigte Rolle: ${roleText}`,
            {
                toastId: `missing-role-${roles.join("-")}`
            }
        );

    }, [initialized, authenticated, authorized, roles]);


    if (!initialized) {
        return <div>Lädt...</div>;
    }


    return (
        <Route
            {...rest}
            render={props =>
                authorized ? (
                    <Component {...props} />
                ) : (
                    <Redirect to="/" />
                )
            }
        />
    );
}