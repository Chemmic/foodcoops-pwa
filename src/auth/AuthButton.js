import React from 'react';
import { Typography } from "@mui/material";

import {useAuth} from "./AuthContext";

export const AuthButton = ({ width = 'auto', height = "auto", backgroundColor="#333", color="white" }) => {
    const { keycloak } = useAuth();

    const handleLoginClick = () => {
        if (!keycloak.authenticated) {
            keycloak.login();
        }
    };

    const handleLogoutClick = () => {
        if (keycloak.authenticated) {
            keycloak.logout({});
        }
    };

    return (
        <div style={{ width: width, height: height, }}>
            <Typography
                onClick={keycloak.authenticated ? handleLogoutClick : handleLoginClick}
                sx={{
                    backgroundColor: backgroundColor,
                    color: color,
                    borderRadius: 10,
                    textAlign: "center",
                    padding: 1,
                    margin: 2,
                    cursor: 'pointer', 
                }}
            >
                {keycloak.authenticated ? `Logout (${keycloak.tokenParsed.preferred_username})` : 'Login'}
            </Typography>
        </div>
    );
};
