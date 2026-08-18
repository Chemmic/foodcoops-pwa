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
    Lager,
} from "./lager/Lager.jsx";

import {
    FrischBestandManagement,
} from "./frischbestandmanagement/FrischBestandManagement.jsx";

import {
    BrotBestandManagement,
} from "./brotmanagement/BrotBestandManagement.jsx";


export function MainManagement() {
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
                "/mainManagement/frischbestandmanagement"
            )
        ) {
            return "frischbestandmanagement";
        }


        if (
            path.startsWith(
                "/mainManagement/brotbestandmanagement"
            )
        ) {
            return "brotbestandmanagement";
        }


        return "lager";
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
                    aria-label="Produktmanagement"
                >
                    <Tab
                        value="lager"
                        label="Lager"
                        component={
                            Link
                        }
                        to="/mainManagement/lager"
                    />

                    <Tab
                        value="frischbestandmanagement"
                        label="Frisch"
                        component={
                            Link
                        }
                        to="/mainManagement/frischbestandmanagement"
                    />

                    <Tab
                        value="brotbestandmanagement"
                        label="Brot"
                        component={
                            Link
                        }
                        to="/mainManagement/brotbestandmanagement"
                    />
                </Tabs>
            </Paper>


            <Routes>
                <Route
                    path="lager"
                    element={
                        <Lager />
                    }
                />

                <Route
                    path="frischbestandmanagement"
                    element={
                        <FrischBestandManagement />
                    }
                />

                <Route
                    path="brotbestandmanagement"
                    element={
                        <BrotBestandManagement />
                    }
                />


                {/* ========================================================= */}
                {/* /mainManagement                                           */}
                {/* ========================================================= */}

                <Route
                    index
                    element={
                        <Navigate
                            to="/mainManagement/lager"
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
                            to="/mainManagement/lager"
                            replace
                        />
                    }
                />
            </Routes>
        </>
    );
}