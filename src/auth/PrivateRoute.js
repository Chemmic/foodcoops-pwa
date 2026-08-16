import React, { useEffect } from "react";
import { Route, useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";


function UnauthorizedRedirect({ roles }) {

    const history = useHistory();

    const roleText =
        roles && roles.length > 0
            ? roles.join(" oder ")
            : "unbekannt";

    useEffect(() => {

        toast.warning(
            `Keine Berechtigung. Benötigte Rolle: ${roleText}`,
            {
                toastId: `missing-role-${roleText}`
            }
        );

        history.replace("/");

    }, [history, roleText]);

    return null;
}


export function PrivateRoute({ component: Component, roles, ...rest }) {

    const {
        keycloak,
        initialized,
        authenticated
    } = useAuth();


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
            return (
                keycloak.hasRealmRole(role) ||
                keycloak.hasResourceRole(role)
            );
        });
    };


    return (
        <Route
            {...rest}
            render={props =>
                isAuthorized() ? (
                    <Component {...props} />
                ) : (
                    <UnauthorizedRedirect roles={roles} />
                )
            }
        />
    );
}