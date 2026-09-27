import React from "react";

import {
    Link,
    Navigate,
    Route,
    Routes,
    useLocation,
} from "react-router";

import {
    Box,
    Paper,
    Stack,
    Tab,
    Tabs,
    Typography,
} from "@mui/material";

import { Benutzerverwaltung } from "../admin/benutzer/Benutzerverwaltung.jsx";

import { CoopStatistik } from "./CoopStatistik.jsx";
import {
    MitgliedDetail,
    Mitglieder,
} from "./Mitglieder.jsx";

import {
    PFADE,
} from "../router/pfade.js";


const BEREICHE = [
    {
        value: "statistik",
        label: "Statistik",
        titel: "Statistik",
        text: "Umsatz, Beteiligung und beliebte Produkte der Foodcoop.",
    },
    {
        value: "mitglieder",
        label: "Mitglieder",
        titel: "Mitglieder",
        text: "Wer hat was wann bestellt und eingekauft.",
    },
    {
        value: "benutzer",
        label: "Benutzer & Rollen",
        titel: null, // Die Benutzerverwaltung hat eine eigene Überschrift
        text: null,
    },
];


/**
 * ============================================================================
 * Verwaltung (nur Admins)
 * ============================================================================
 */
export function Verwaltung() {
    const location =
        useLocation();

    const aktiv =
        BEREICHE.find(bereich =>
            location.pathname.startsWith(`${PFADE.verwaltung}/${bereich.value}`)
        ) ?? BEREICHE[0];


    return (
        <>
            <Paper
                elevation={0}
                sx={{
                    mb: 2,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2,
                    overflow: "hidden",
                }}
            >
                <Tabs
                    value={aktiv.value}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    aria-label="Verwaltungsbereiche"
                >
                    {BEREICHE.map(bereich => (
                        <Tab
                            key={bereich.value}
                            value={bereich.value}
                            label={bereich.label}
                            component={Link}
                            to={`${PFADE.verwaltung}/${bereich.value}`}
                        />
                    ))}
                </Tabs>
            </Paper>


            {aktiv.titel &&
                !location.pathname.startsWith(`${PFADE.verwaltungMitglieder}/`) && (
                <Stack
                    spacing={0.5}
                    sx={{
                        mb: 3,
                    }}
                >
                    <Typography
                        variant="h2"
                    >
                        {aktiv.titel}
                    </Typography>

                    <Typography color="text.secondary">
                        {aktiv.text}
                    </Typography>
                </Stack>
            )}


            <Box>
                <Routes>
                    <Route
                        path="statistik"
                        element={<CoopStatistik />}
                    />

                    <Route
                        path="mitglieder"
                        element={<Mitglieder />}
                    />

                    <Route
                        path="mitglieder/:personId"
                        element={<MitgliedDetail />}
                    />

                    <Route
                        path="benutzer"
                        element={<Benutzerverwaltung />}
                    />

                    <Route
                        path="*"
                        element={
                            <Navigate
                                to={PFADE.verwaltungStatistik}
                                replace
                            />
                        }
                    />
                </Routes>
            </Box>
        </>
    );
}
