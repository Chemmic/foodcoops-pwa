import React from 'react';

import {
    Box,
    Button,
    Paper,
    Stack,
    Typography,
} from '@mui/material';

import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';

import { useAuth } from './auth/AuthContext.jsx';

export function Home() {
    const {
        keycloak,
        login,
    } = useAuth();

    const authenticated = keycloak?.authenticated === true;

    if (!authenticated) {
        return (
            <Box
                component="main"
                sx={{
                    minHeight: {
                        xs: 'calc(100vh - 100px)',
                        md: 'calc(100vh - 130px)',
                    },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: 2,
                    py: 4,
                }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        width: '100%',
                        maxWidth: 520,
                        p: {
                            xs: 3,
                            sm: 5,
                        },
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 3,
                    }}
                >
                    <Stack
                        spacing={3}
                        alignItems="center"
                        textAlign="center"
                    >
                        <Box
                            component="img"
                            src="/manifest-icon-512.png"
                            alt="FoodCoop"
                            sx={{
                                width: {
                                    xs: 100,
                                    sm: 120,
                                },
                                height: {
                                    xs: 100,
                                    sm: 120,
                                },
                                objectFit: 'contain',
                            }}
                        />

                        <Box>
                            <Typography
                                component="h1"
                                variant="h2"
                                gutterBottom
                            >
                                Willkommen bei der Foodcoop MiKa
                            </Typography>

                            <Typography
                                variant="body1"
                                color="text.secondary"
                            >
                                Melde dich an, um Bestellungen, Einkäufe
                                und die Verwaltung der Foodcoop MiKa zu nutzen.
                            </Typography>
                        </Box>

                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<LoginOutlinedIcon />}
                            onClick={login}
                            sx={{
                                width: {
                                    xs: '100%',
                                    sm: 'auto',
                                },
                                minWidth: {
                                    sm: 220,
                                },
                            }}
                        >
                            Anmelden
                        </Button>
                    </Stack>
                </Paper>
            </Box>
        );
    }

    return (
        <Box
            component="main"
            sx={{
                py: {
                    xs: 2,
                    sm: 3,
                },
            }}
        >
            <Stack spacing={3}>
                <Box>
                    <Typography
                        component="h1"
                        variant="h2"
                        gutterBottom
                    >
                        Willkommen bei FoodCoop
                    </Typography>

                    <Typography
                        variant="body1"
                        color="text.secondary"
                    >
                        Wähle einen Bereich aus der Navigation,
                        um loszulegen.
                    </Typography>
                </Box>

                <Paper
                    elevation={0}
                    sx={{
                        minHeight: 280,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 3,
                        p: 4,
                    }}
                >
                    <Box
                        component="img"
                        src="/manifest-icon-512.png"
                        alt="FoodCoop"
                        sx={{
                            width: {
                                xs: 160,
                                sm: 220,
                            },
                            maxWidth: '60%',
                            height: 'auto',
                            opacity: 0.9,
                        }}
                    />
                </Paper>
            </Stack>
        </Box>
    );
}