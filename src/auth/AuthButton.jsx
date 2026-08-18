import React from 'react';

import {
    Button,
    Stack,
    Typography,
} from '@mui/material';

import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';

import { useAuth } from './AuthContext.jsx';

export const AuthButton = ({
    fullWidth = false,
    showUsername = true,
}) => {
    const {
        keycloak,
        authenticated,
        login,
        logout,
    } = useAuth();

    const username =
        keycloak?.tokenParsed?.preferred_username || '';

    const handleClick = () => {
        if (authenticated) {
            logout();
            return;
        }

        login();
    };

    return (
        <Stack spacing={1}>
            {authenticated && showUsername && username && (
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        px: 1,
                    }}
                >
                    Angemeldet als {username}
                </Typography>
            )}

            <Button
                fullWidth={fullWidth}
                variant={authenticated ? 'outlined' : 'contained'}
                color="primary"
                startIcon={
                    authenticated
                        ? <LogoutIcon />
                        : <LoginIcon />
                }
                onClick={handleClick}
            >
                {authenticated ? 'Abmelden' : 'Anmelden'}
            </Button>
        </Stack>
    );
};