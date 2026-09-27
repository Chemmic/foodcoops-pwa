import React from "react";

import {
    Link,
    Navigate,
    Route,
    Routes,
    useLocation,
} from "react-router";

import {
    Paper,
    Tab,
    Tabs,
} from "@mui/material";

import {
    Deadline,
} from "../deadline/Deadline.jsx";

import {
    Kontrolle,
} from "./Kontrolle.jsx";

import {
    OrderOverview,
} from "./OrderOverview.jsx";

import {
    AdminConfig,
} from "./AdminConfig.jsx";

import {
    PdfUebersicht,
} from "./PdfUebersicht.jsx";

import {
    PFADE,
} from "../router/pfade.js";


export function MainAdmin() {
    const location =
        useLocation();


    // =========================================================================
    // Aktiver Tab
    // =========================================================================

    const getActiveTab = () => {
        const path =
            location.pathname;


        if (
            path.startsWith(
                PFADE.bestelluebersicht
            )
        ) {
            return "OrderOverview";
        }


        if (
            path.startsWith(
                PFADE.pdfUebersicht
            )
        ) {
            return "pdfOverview";
        }


        if (
            path.startsWith(
                PFADE.einstellungen
            )
        ) {
            return "config";
        }


        if (
            path.startsWith(
                PFADE.deadline
            )
        ) {
            return "deadline";
        }


        return "zuVielzuWenig";
    };


    // =========================================================================
    // Render
    // =========================================================================

    return (
        <>
            <Paper
                elevation={0}
                sx={{
                    mb: 2,

                    border: 1,
                    borderColor:
                        "divider",

                    borderRadius: 2,

                    overflow:
                        "hidden",

                    flexShrink: 0,
                }}
            >
                <Tabs
                    value={
                        getActiveTab()
                    }
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    aria-label="Konfigurationsbereiche"
                >
                    <Tab
                        value="zuVielzuWenig"
                        label="Zu viel / Zu wenig"
                        component={
                            Link
                        }
                        to={PFADE.zuVielZuWenig}
                    />

                    <Tab
                        value="OrderOverview"
                        label="Bestellübersicht"
                        component={
                            Link
                        }
                        to={PFADE.bestelluebersicht}
                    />

                    <Tab
                        value="pdfOverview"
                        label="PDF-Übersicht"
                        component={
                            Link
                        }
                        to={PFADE.pdfUebersicht}
                    />

                    <Tab
                        value="config"
                        label="Konfiguration"
                        component={
                            Link
                        }
                        to={PFADE.einstellungen}
                    />

                    <Tab
                        value="deadline"
                        label="Deadline"
                        component={
                            Link
                        }
                        to={PFADE.deadline}
                    />
                </Tabs>
            </Paper>


            <Routes>
                <Route
                    path="zu-viel-zu-wenig"
                    element={
                        <Kontrolle />
                    }
                />

                <Route
                    path="bestelluebersicht"
                    element={
                        <OrderOverview />
                    }
                />

                <Route
                    path="pdf"
                    element={
                        <PdfUebersicht />
                    }
                />

                <Route
                    path="einstellungen"
                    element={
                        <AdminConfig />
                    }
                />

                <Route
                    path="deadline"
                    element={
                        <Deadline />
                    }
                />

                {/* ========================================================= */}
                {/* /konfiguration                                            */}
                {/* ========================================================= */}

                <Route
                    index
                    element={
                        <Navigate
                            to={PFADE.zuVielZuWenig}
                            replace
                        />
                    }
                />


                {/* ========================================================= */}
                {/* Ungültige Unterroute                                      */}
                {/* ========================================================= */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to={PFADE.zuVielZuWenig}
                            replace
                        />
                    }
                />
            </Routes>
        </>
    );
}