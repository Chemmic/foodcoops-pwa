import React from "react";
import { Redirect, Route } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function PrivateRoute({ component: Component, roles, ...rest }) {

    const { keycloak, initialized, authenticated } = useAuth();

    if (!initialized) {
        return <div>Lädt...</div>;
    }

    const isAuthorized = () => {
        if (!authenticated || !keycloak) {
            return false;
        }

        if (!roles || roles.length === 0) {
            return true;
        }

        return roles.some(role => {
            const realm = keycloak.hasRealmRole(role);
            const resource = keycloak.hasResourceRole(role);

            return realm || resource;
        });
    };

    return (
        <Route
            {...rest}
            render={props =>
                isAuthorized() ? (
                    <Component {...props} />
                ) : (
                    <Redirect to={{ pathname: "/" }} />
                )
            }
        />
    );
}