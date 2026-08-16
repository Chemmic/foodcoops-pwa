
import React from "react";
import { Redirect, Route } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function PrivateRoute({ component: Component, roles, ...rest }) {

    const { keycloak, initialized, authenticated } = useAuth();

    if (!initialized) {
        return <div>Lädt...</div>;
    }

    console.log("[PrivateRoute] authenticated:", authenticated);
    console.log("[PrivateRoute] required roles:", roles);
    console.log("[PrivateRoute] realm roles:",
        keycloak?.tokenParsed?.realm_access?.roles
    );
    console.log("[PrivateRoute] resource roles:",
        keycloak?.tokenParsed?.resource_access
    );

    const isAuthorized = () => {

        if (!authenticated || !keycloak) {
            console.log("[PrivateRoute] Nicht authentifiziert");
            return false;
        }

        // Wenn für die Route gar keine Rollen verlangt werden,
        // reicht eine erfolgreiche Anmeldung.
        if (!roles || roles.length === 0) {
            return true;
        }

        return roles.some(role => {

            const realmRole = keycloak.hasRealmRole(role);
            const resourceRole = keycloak.hasResourceRole(role);

            console.log(
                `[PrivateRoute] role=${role}`,
                "realm=", realmRole,
                "resource=", resourceRole
            );

            return realmRole || resourceRole;
        });
    };

    return (
        <Route
            {...rest}
            render={props =>
                isAuthorized() ? (
                    <Component {...props} />
                ) : (
                    <Redirect to="/" />
                )
            }
        />
    );
}