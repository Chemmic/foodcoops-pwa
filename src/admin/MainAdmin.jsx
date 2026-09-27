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

import {
    useAuth,
} from "../auth/AuthContext.jsx";

import {
    PrivateRoute,
} from "../auth/PrivateRoute.jsx";

import {
    RECHTE,
} from "../auth/rechte.js";


export function MainAdmin() {
    const location =
        useLocation();

    // Einstellungen und Deadline nur für Admins
    const {
        hasRoles,
    } = useAuth();

    const darfEinstellungen =
        hasRoles(
            RECHTE.einstellungen
        );


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

    const aktiverTab =
        ["config", "deadline"].includes(getActiveTab()) &&
        !darfEinstellungen
            ? false
            : getActiveTab();


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
                        aktiverTab
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

                    {darfEinstellungen && (
                        <Tab
                            value="config"
                            label="Konfiguration"
                            component={
                                Link
                            }
                            to={PFADE.einstellungen}
                        />
                    )}

                    {darfEinstellungen && (
                        <Tab
                            value="deadline"
                            label="Deadline"
                            component={
                                Link
                            }
                            to={PFADE.deadline}
                        />
                    )}
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
                        <PrivateRoute
                            roles={RECHTE.einstellungen}
                        >
                            <AdminConfig />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="deadline"
                    element={
                        <PrivateRoute
                            roles={RECHTE.einstellungen}
                        >
                            <Deadline />
                        </PrivateRoute>
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