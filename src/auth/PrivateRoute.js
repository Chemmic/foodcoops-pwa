import React from "react";
import {Redirect, Route} from "react-router-dom";
import { useAuth } from "./AuthContext";

export function PrivateRoute({component: Component, roles, ...rest}) {

    const { keycloak, initialized } = useAuth();
    if (!initialized) {
        return <div>Lädt...</div>;
    }

    const isAuthorized = (roles) => {
        if (keycloak && roles) {
            return roles.some(r => {
                const realm = keycloak.hasRealmRole(r);
                const resource = keycloak.hasResourceRole(r);
                return realm || resource;
            });
        }
        return false;
    }

    return (
        <Route
            {...rest}
            render={props => 
                isAuthorized(roles) ? (
                    <Component {...props} />
                  ) : (
                     <Redirect to={{pathname: '/',}}/>)
            }
        />  
    )
}