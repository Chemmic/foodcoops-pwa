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
                "/mainAdmin/OrderOverview"
            )
        ) {
            return "OrderOverview";
        }


        if (
            path.startsWith(
                "/mainAdmin/pdfOverview"
            )
        ) {
            return "pdfOverview";
        }


        if (
            path.startsWith(
                "/mainAdmin/config"
            )
        ) {
            return "config";
        }


        if (
            path.startsWith(
                "/mainAdmin/deadline"
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
                        to="/mainAdmin/zuVielzuWenig"
                    />

                    <Tab
                        value="OrderOverview"
                        label="Bestellübersicht"
                        component={
                            Link
                        }
                        to="/mainAdmin/OrderOverview"
                    />

                    <Tab
                        value="pdfOverview"
                        label="PDF-Übersicht"
                        component={
                            Link
                        }
                        to="/mainAdmin/pdfOverview"
                    />

                    <Tab
                        value="config"
                        label="Konfiguration"
                        component={
                            Link
                        }
                        to="/mainAdmin/config"
                    />

                    <Tab
                        value="deadline"
                        label="Deadline"
                        component={
                            Link
                        }
                        to="/mainAdmin/deadline"
                    />
                </Tabs>
            </Paper>


            <Routes>
                <Route
                    path="zuVielzuWenig"
                    element={
                        <Kontrolle />
                    }
                />

                <Route
                    path="OrderOverview"
                    element={
                        <OrderOverview />
                    }
                />

                <Route
                    path="pdfOverview"
                    element={
                        <PdfUebersicht />
                    }
                />

                <Route
                    path="config"
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
                {/* /mainAdmin                                                */}
                {/* ========================================================= */}

                <Route
                    index
                    element={
                        <Navigate
                            to="/mainAdmin/zuVielzuWenig"
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
                            to="/mainAdmin/zuVielzuWenig"
                            replace
                        />
                    }
                />
            </Routes>
        </>
    );
}